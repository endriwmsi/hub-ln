"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  FileSearch,
  Loader2,
  Search,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import type {
  AcaoResult,
  OrgaoResult,
  OrgaoStatus,
  SearchByDocumentoResult,
} from "@/features/acoes/actions/search-by-documento";
import { searchByDocumento } from "@/features/acoes/actions/search-by-documento";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";

// ─── Document Mask ────────────────────────────────────────────────────────────

function applyDocumentMask(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (digits.length <= 11) {
    return digits
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4")
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})-(\d{2})\d+/, "$1.$2.$3-$4");
  }

  return digits
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4")
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5")
    .replace(
      /^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})-(\d{2})\d+/,
      "$1.$2.$3/$4-$5",
    );
}

// ─── Greeting ────────────────────────────────────────────────────────────────

function getGreeting(name: string) {
  const hour = new Date().getHours();
  const firstName = name.trim().split(/\s+/)[0] ?? name;

  if (hour >= 5 && hour < 12) {
    return {
      text: `Bom dia, ${firstName}!`,
      emoji: "☀️",
      gradient: "from-amber-50 to-orange-50",
      border: "border-amber-200",
      textColor: "text-amber-700",
      subColor: "text-amber-600/80",
    };
  }
  if (hour >= 12 && hour < 18) {
    return {
      text: `Boa tarde, ${firstName}!`,
      emoji: "🌤️",
      gradient: "from-sky-50 to-cyan-50",
      border: "border-sky-200",
      textColor: "text-sky-700",
      subColor: "text-sky-600/80",
    };
  }
  return {
    text: `Boa noite, ${firstName}!`,
    emoji: "🌙",
    gradient: "from-indigo-50 to-blue-50",
    border: "border-indigo-200",
    textColor: "text-indigo-700",
    subColor: "text-indigo-600/80",
  };
}

// ─── Status config ────────────────────────────────────────────────────────────

const orgaoStatusConfig: Record<
  OrgaoStatus,
  { label: string; colorClass: string; icon: React.ReactNode }
> = {
  aguardando_baixas: {
    label: "Aguardando",
    colorClass: "text-amber-700 bg-amber-50 border-amber-200",
    icon: <Clock className="h-3 w-3" />,
  },
  baixas_iniciadas: {
    label: "Em andamento",
    colorClass: "text-blue-700 bg-blue-50 border-blue-200",
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
  },
  baixas_completas: {
    label: "Concluída",
    colorClass: "text-emerald-700 bg-emerald-50 border-emerald-200",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
};

const itemStatusConfig: Record<
  "aguardando" | "baixas_completas" | "baixas_negadas",
  {
    label: string;
    badgeClass: string;
    icon: React.ReactNode;
  }
> = {
  aguardando: {
    label: "Aguardando",
    badgeClass: "border-slate-200 bg-slate-100 text-slate-600",
    icon: <Clock className="h-3 w-3" />,
  },
  baixas_completas: {
    label: "Concluído",
    badgeClass: "border-emerald-200 bg-emerald-100 text-emerald-700",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  baixas_negadas: {
    label: "Negado",
    badgeClass: "border-red-200 bg-red-100 text-red-700",
    icon: <XCircle className="h-3 w-3" />,
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function OrgaoStatusBadge({ orgao }: { orgao: OrgaoResult }) {
  const config = orgaoStatusConfig[orgao.status];

  const rowBg =
    orgao.status === "baixas_completas"
      ? "bg-emerald-50/60 border-emerald-100"
      : orgao.status === "baixas_iniciadas"
        ? "bg-blue-50/60 border-blue-100"
        : "bg-slate-50/60 border-slate-100";

  return (
    <div
      className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 ${rowBg}`}
    >
      <span className="text-sm font-medium text-foreground">{orgao.label}</span>
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config.colorClass}`}
      >
        {config.icon}
        {config.label}
      </span>
    </div>
  );
}

function AcaoCard({ acao }: { acao: AcaoResult }) {
  const itemCfg = itemStatusConfig[acao.itemStatus];

  const progressColor =
    acao.percentage === 100
      ? "bg-linear-to-r from-emerald-500 to-green-500"
      : acao.percentage > 0
        ? "bg-linear-to-r from-blue-500 to-cyan-500"
        : "bg-linear-to-r from-slate-300 to-slate-400";

  const borderAccent =
    acao.percentage === 100
      ? "border-l-emerald-500"
      : acao.percentage > 0
        ? "border-l-blue-500"
        : "border-l-slate-300";

  const progressTrack =
    acao.percentage === 100
      ? "bg-emerald-100/60"
      : acao.percentage > 0
        ? "bg-blue-100/60"
        : "bg-slate-100/60";

  const bgGradient =
    acao.percentage === 100
      ? "from-emerald-50/40 to-green-50/40"
      : acao.percentage > 0
        ? "from-blue-50/40 to-cyan-50/40"
        : "from-slate-50/40 to-slate-50/40";

  const formattedDate = acao.enviadoEm
    ? format(new Date(acao.enviadoEm), "d 'de' MMMM 'de' yyyy", {
        locale: ptBR,
      })
    : null;

  return (
    <Card
      className={`overflow-hidden border border-l-4 bg-linear-to-br to-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${borderAccent} ${bgGradient}`}
    >
      <CardHeader className="pb-4 pt-5">
        <div className="flex flex-col gap-3.5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-1.5">
            <CardTitle className="text-base sm:text-lg font-semibold leading-snug text-slate-900">
              {acao.acaoNome}
            </CardTitle>
            {formattedDate && (
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                <span>Enviado em {formattedDate}</span>
              </div>
            )}
          </div>
          <div
            className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap ${itemCfg.badgeClass}`}
          >
            {itemCfg.icon}
            {itemCfg.label}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pb-5">
        {/* Progress */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-700">
              Progresso das baixas
            </span>
            <span className="text-xs font-bold tabular-nums text-slate-900">
              {acao.baixasCompletas}
              <span className="font-normal text-slate-600">
                /{acao.totalOrgaos}
              </span>
              <span className="ml-2 font-normal text-slate-600">
                ({acao.percentage}%)
              </span>
            </span>
          </div>
          <div
            className={`relative h-2.5 w-full overflow-hidden rounded-full ${progressTrack}`}
          >
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out shadow-sm ${progressColor}`}
              style={{ width: `${acao.percentage}%` }}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200/60" />

        {/* Órgãos grid */}
        <div className="grid gap-2.5 sm:grid-cols-2">
          {acao.orgaos.map((orgao) => (
            <OrgaoStatusBadge key={orgao.field} orgao={orgao} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function GreetingBanner({ data }: { data: SearchByDocumentoResult }) {
  const { text, emoji, gradient, border, textColor, subColor } = getGreeting(
    data.nome,
  );

  return (
    <div
      className={`w-full rounded-3xl border bg-linear-to-br p-6 sm:p-7 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-500 backdrop-blur-sm ${gradient} ${border}`}
    >
      <div className="flex items-start gap-4">
        <span className="mt-1 text-3xl leading-none" aria-hidden>
          {emoji}
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <p
            className={`text-lg sm:text-xl font-bold leading-snug ${textColor}`}
          >
            {text}
          </p>
          <p className={`text-sm ${subColor}`}>
            Acompanhe o status do seu processo de limpeza de nome.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Badge
              variant="outline"
              className="border-current/30 bg-white/70 font-mono text-xs font-semibold px-3 py-1.5 shadow-sm"
            >
              {data.documentoFormatado}
            </Badge>
            <span className={`text-xs font-medium ${subColor}`}>
              {data.acoes.length === 1
                ? "1 processo encontrado"
                : `${data.acoes.length} processos encontrados`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultsSection({ data }: { data: SearchByDocumentoResult }) {
  return (
    <div className="w-full space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <GreetingBanner data={data} />

      <div className="space-y-4 pt-2">
        {data.acoes.map((acao, index) => (
          <div
            key={acao.acaoId}
            className="animate-in fade-in slide-in-from-bottom-2 duration-500"
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          >
            <AcaoCard acao={acao} />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ documento }: { documento: string }) {
  return (
    <div className="flex w-full flex-col items-center gap-4 rounded-2xl border border-amber-200/50 bg-linear-to-br from-amber-50 to-yellow-50/50 px-6 py-12 text-center animate-in fade-in slide-in-from-bottom-3 duration-500 shadow-lg shadow-amber-200/20">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-amber-100 to-yellow-100 shadow-md">
        <FileSearch className="h-8 w-8 text-amber-600" />
      </div>
      <div className="space-y-2">
        <p className="text-lg font-semibold text-amber-900">
          Nenhum processo encontrado
        </p>
        <p className="text-sm text-amber-800/80">
          Não encontramos nenhum processo vinculado ao documento{" "}
          <span className="font-mono font-semibold text-amber-900 bg-white/60 px-2 py-1 rounded-md">
            {documento}
          </span>
          .
        </p>
        <p className="text-xs text-amber-700/70 pt-1">
          Verifique se o documento está correto ou entre em contato com o
          responsável pelo seu processo.
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ConsultaForm() {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<
    SearchByDocumentoResult | null | "empty"
  >(null);
  const [lastSearched, setLastSearched] = useState<string>("");

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const masked = applyDocumentMask(e.target.value);
    setInputValue(masked);
    if (result !== null) setResult(null);
    if (error) setError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const raw = inputValue.replace(/\D/g, "");
    if (!raw) {
      setError("Por favor, informe um CPF ou CNPJ.");
      return;
    }
    if (raw.length !== 11 && raw.length !== 14) {
      setError(
        raw.length < 11
          ? "CPF deve ter 11 dígitos."
          : raw.length < 14
            ? "CNPJ deve ter 14 dígitos."
            : "Documento inválido.",
      );
      return;
    }

    setError(null);
    setIsLoading(true);
    setResult(null);
    setLastSearched(inputValue);

    try {
      const response = await searchByDocumento(inputValue);

      if (!response.success) {
        setError(response.error);
        return;
      }

      setResult(response.data ?? "empty");
    } catch {
      setError("Erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  const rawDigits = inputValue.replace(/\D/g, "");
  const isValidLength = rawDigits.length === 11 || rawDigits.length === 14;

  return (
    <div className="flex w-full flex-col items-center gap-6">
      {/* Search form */}
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col gap-3 sm:flex-row sm:gap-2"
      >
        <div className="relative flex-1">
          <Input
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Digite seu CPF ou CNPJ"
            className="h-12 w-full rounded-xl bg-linear-to-br from-slate-50 to-slate-100 px-5 pr-4 font-mono text-base tracking-widest shadow-sm border border-slate-200/60 focus:border-blue-400 focus:shadow-md focus:shadow-blue-200/30 transition-all duration-200 placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-400"
            inputMode="numeric"
            maxLength={18}
            disabled={isLoading}
            aria-label="CPF ou CNPJ"
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading || !isValidLength}
          className="h-12 gap-2 bg-linear-to-r from-blue-600 to-indigo-600 px-8 text-sm font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Consultando…
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Consultar
            </>
          )}
        </Button>
      </form>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="flex w-full flex-col gap-4 animate-in fade-in duration-300">
          <div className="h-32 w-full animate-pulse rounded-2xl bg-linear-to-r from-slate-100 to-slate-50" />
          <div className="h-56 w-full animate-pulse rounded-2xl bg-linear-to-r from-slate-100 to-slate-50" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex w-full items-start gap-3 rounded-2xl border border-red-200/60 bg-linear-to-br from-red-50 to-red-50/50 px-5 py-4 text-sm text-red-700 animate-in fade-in slide-in-from-bottom-2 duration-300 shadow-lg shadow-red-200/20 backdrop-blur-sm">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Empty */}
      {!isLoading && result === "empty" && (
        <EmptyState documento={lastSearched} />
      )}

      {/* Results */}
      {!isLoading && result && result !== "empty" && (
        <ResultsSection data={result} />
      )}
    </div>
  );
}
