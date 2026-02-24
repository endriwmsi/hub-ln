"use client";

import type { RowSelectionState } from "@tanstack/react-table";
import { CheckCircle2, Hourglass, Loader2, XCircle } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import type { ClientStatus } from "../types";

type ClientsActionsBarProps = {
  rowSelection: RowSelectionState;
  onStatusUpdate: (status: ClientStatus) => void;
  onClearSelection: () => void;
  isPending: boolean;
};

export function ClientsActionsBar({
  rowSelection,
  onStatusUpdate,
  onClearSelection,
  isPending,
}: ClientsActionsBarProps) {
  // Contar quantos itens estão selecionados (independente da página atual)
  const selectedCount = useMemo(() => {
    return Object.keys(rowSelection).filter((key) => rowSelection[key]).length;
  }, [rowSelection]);

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 rounded-md border bg-muted/50 p-3">
      <span className="text-sm text-muted-foreground">
        {selectedCount} cliente(s) selecionado(s)
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="default" size="sm" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Alterar Status
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onStatusUpdate("aguardando")}>
            <Hourglass className="h-4 w-4 mr-2 text-yellow-600" />
            Aguardando
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onStatusUpdate("baixas_completas")}>
            <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
            Baixas Completas
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onStatusUpdate("baixas_negadas")}>
            <XCircle className="h-4 w-4 mr-2 text-red-600" />
            Baixas Negadas
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="ghost" size="sm" onClick={onClearSelection}>
        Limpar
      </Button>
    </div>
  );
}
