"use client";

import type { Acao } from "@/core/db/schema";
import { formatCurrency } from "@/shared";
import { orgaoLabels } from "../schemas";
import { StatusCell } from "./status-cell";

type ExpandedRowProps = {
  acao: Acao;
};

export function ExpandedRow({ acao }: ExpandedRowProps) {
  const statusFields = [
    { name: "statusSpc", label: orgaoLabels.statusSpc },
    { name: "statusBoaVista", label: orgaoLabels.statusBoaVista },
    { name: "statusSerasa", label: orgaoLabels.statusSerasa },
    { name: "statusCenprotNacional", label: orgaoLabels.statusCenprotNacional },
    { name: "statusCenprotSp", label: orgaoLabels.statusCenprotSp },
    { name: "statusOutros", label: orgaoLabels.statusOutros },
  ] as const;

  return (
    <div className="px-12 py-6 bg-muted/30">
      <div className="space-y-6">
        {/* Status por Órgão */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Status por Órgão</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {statusFields.map(({ name, label }) => (
              <div
                key={name}
                className="flex items-center justify-between p-3 bg-background rounded-md border"
              >
                <span className="text-sm font-medium">{label}</span>
                <StatusCell acao={acao} field={name} />
              </div>
            ))}
          </div>
        </div>

        {/* Informações Admin */}
        {(acao.responsavel || acao.custoProcesso) && (
          <div>
            <h4 className="text-sm font-semibold mb-3">
              Informações Administrativas
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {acao.responsavel && (
                <div className="p-3 bg-background rounded-md border">
                  <p className="text-xs text-muted-foreground mb-1">
                    Responsável
                  </p>
                  <p className="text-sm font-medium">{acao.responsavel}</p>
                </div>
              )}

              {acao.custoProcesso && (
                <div className="p-3 bg-background rounded-md border">
                  <p className="text-xs text-muted-foreground mb-1">
                    Custo do Processo
                  </p>
                  <p className="text-sm font-medium">
                    {formatCurrency(acao.custoProcesso)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
