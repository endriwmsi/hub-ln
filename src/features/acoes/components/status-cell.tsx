"use client";

import type { Acao } from "@/core/db/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils";
import { useUpdateAcaoStatus } from "../hooks/use-update-acao-status";
import type { OrgaoField, StatusOrgao } from "../schemas";
import { statusOrgaoLabels } from "../schemas";

type StatusCellProps = {
  acao: Acao;
  field: OrgaoField;
};

const statusColors: Record<StatusOrgao, string> = {
  aguardando_baixas: "bg-yellow-100 text-yellow-800 border-yellow-300",
  baixas_iniciadas: "bg-blue-100 text-blue-800 border-blue-300",
  baixas_completas: "bg-green-100 text-green-800 border-green-300",
};

export function StatusCell({ acao, field }: StatusCellProps) {
  const { mutate: updateStatus, isPending } = useUpdateAcaoStatus();

  const currentStatus = acao[field] as StatusOrgao;

  const handleStatusChange = (value: StatusOrgao) => {
    updateStatus({ id: acao.id, field, value });
  };

  return (
    <Select
      value={currentStatus}
      onValueChange={handleStatusChange}
      disabled={isPending}
    >
      <SelectTrigger
        className={cn("h-8 w-35 text-xs border", statusColors[currentStatus])}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(statusOrgaoLabels).map(([value, label]) => (
          <SelectItem key={value} value={value} className="text-xs">
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
