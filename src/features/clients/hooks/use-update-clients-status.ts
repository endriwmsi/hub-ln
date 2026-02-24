"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateClientsStatus } from "../actions";

type BulkStatusUpdateInput = {
  items: Array<{ requestId: string; itemIndex: number }>;
  status: "aguardando" | "baixas_completas" | "baixas_negadas";
  observacao?: string;
};

export function useUpdateClientsStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: BulkStatusUpdateInput) => updateClientsStatus(input),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(`${result.data?.updated} cliente(s) atualizado(s)`);
        // Invalida a query para refetch
        queryClient.invalidateQueries({ queryKey: ["clients"] });
      } else {
        toast.error(result.error || "Erro ao atualizar status");
      }
    },
    onError: (error) => {
      console.error("Erro ao atualizar status em bulk:", error);
      toast.error("Erro ao atualizar status");
    },
  });
}
