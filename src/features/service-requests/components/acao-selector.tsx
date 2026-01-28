"use client";

import { CalendarDays, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { AcaoAtiva } from "@/features/acoes/actions";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

type AcaoSelectorProps = {
  acoes: AcaoAtiva[];
  selectedAcaoId?: string;
  serviceSlug: string;
};

export function AcaoSelector({
  acoes,
  selectedAcaoId,
  serviceSlug,
}: AcaoSelectorProps) {
  const router = useRouter();

  const handleAcaoChange = (acaoId: string) => {
    router.push(`/servicos/solicitar/${serviceSlug}?acao=${acaoId}`);
  };

  const selectedAcao = acoes.find((a) => a.id === selectedAcaoId);

  if (acoes.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-center bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
        <p className="text-amber-800 dark:text-amber-200 font-medium">
          Nenhuma ação disponível no momento
        </p>
        <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
          Não há ações abertas para envio. Por favor, aguarde ou entre em
          contato com o suporte.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-6 space-y-4">
      <div>
        <Label className="text-base font-semibold">
          Selecione a Ação <span className="text-destructive">*</span>
        </Label>
        <p className="text-sm text-muted-foreground mt-1">
          Escolha a ação em que este envio será vinculado
        </p>
      </div>

      <Select value={selectedAcaoId || ""} onValueChange={handleAcaoChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione uma ação..." />
        </SelectTrigger>
        <SelectContent>
          {acoes.map((acao) => (
            <SelectItem key={acao.id} value={acao.id}>
              <div className="flex items-center gap-2">
                <span>{acao.nome}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedAcao && (
        <div className="flex items-center gap-4 pt-2 border-t text-sm">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>Ação selecionada</span>
          </div>
          {(selectedAcao.dataInicio || selectedAcao.dataFim) && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span>
                {selectedAcao.dataInicio &&
                  new Date(selectedAcao.dataInicio).toLocaleDateString("pt-BR")}
                {selectedAcao.dataInicio && selectedAcao.dataFim && " - "}
                {selectedAcao.dataFim &&
                  new Date(selectedAcao.dataFim).toLocaleDateString("pt-BR")}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
