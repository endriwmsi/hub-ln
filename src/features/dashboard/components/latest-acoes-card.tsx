"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import {
  getLatestAcoes,
  type LatestAcao,
} from "@/features/acoes/actions/get-latest-acoes";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

type StatusOrgao =
  | "aguardando_baixas"
  | "baixas_iniciadas"
  | "baixas_completas";

interface StatusItemProps {
  status: StatusOrgao;
  orgao: string;
}

function StatusItem({ status, orgao }: StatusItemProps) {
  const statusConfig = {
    aguardando_baixas: {
      label: "Aguardando",
      className: "bg-amber-50 text-amber-700 border-amber-200",
    },
    baixas_iniciadas: {
      label: "Iniciadas",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    },
    baixas_completas: {
      label: "Completas",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center justify-between gap-2 py-1.5">
      <span className="text-xs font-medium text-muted-foreground">{orgao}</span>
      <Badge
        variant="outline"
        className={cn("text-xs font-normal", config.className)}
      >
        {config.label}
      </Badge>
    </div>
  );
}

interface AcaoCardProps {
  acao: LatestAcao;
}

function AcaoCard({ acao }: AcaoCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border bg-card hover:bg-accent/30 transition-colors">
        <CollapsibleTrigger className="w-full p-3 text-left">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate">{acao.nome}</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {format(new Date(acao.dataInicio), "dd MMM", { locale: ptBR })}{" "}
                -{" "}
                {format(new Date(acao.dataFim), "dd MMM yyyy", {
                  locale: ptBR,
                })}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span className="text-xs font-medium">
                {isOpen ? "Ocultar" : "Ver status"}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isOpen && "rotate-180",
                )}
              />
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-3 pb-3 pt-1 border-t">
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-2">
              <StatusItem status={acao.statusSpc} orgao="SPC" />
              <StatusItem status={acao.statusBoaVista} orgao="Boa Vista" />
              <StatusItem status={acao.statusSerasa} orgao="Serasa" />
              <StatusItem
                status={acao.statusCenprotNacional}
                orgao="Cenprot Nac"
              />
              <StatusItem status={acao.statusCenprotSp} orgao="Cenprot SP" />
              <StatusItem status={acao.statusOutros} orgao="Outros" />
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(3)].map((_, i) => (
        <div
          key={`skeleton-${
            // biome-ignore lint/suspicious/noArrayIndexKey: Its a Skeleton, index is fine
            i
          }`}
          className="rounded-lg border bg-card p-3"
        >
          <Skeleton className="h-4 w-3/4 mb-1.5" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function LatestAcoesCard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["latest-acoes"],
    queryFn: async () => {
      const result = await getLatestAcoes(3);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data || [];
    },
    refetchInterval: 30000, // Refetch a cada 30 segundos
  });

  return (
    <Card className="bg-background border rounded-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Últimas Ações</CardTitle>
        <CardDescription>
          Acompanhe o status das campanhas mais recentes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <LoadingSkeleton />}

        {error && (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            <p>Erro ao carregar ações</p>
          </div>
        )}

        {data && data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhuma ação encontrada
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              As ações criadas aparecerão aqui
            </p>
          </div>
        )}

        {data && data.length > 0 && (
          <div className="space-y-2">
            {data.map((acao) => (
              <AcaoCard key={acao.id} acao={acao} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
