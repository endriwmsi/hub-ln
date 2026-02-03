"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  updateBulkItemsStatus,
  updateSingleItemStatus,
} from "../actions/update-acao-items-status";

type BulkStatusUpdateInput = {
  items: Array<{ requestId: string; itemIndex: number }>;
  status: "aguardando" | "baixas_completas" | "baixas_negadas";
  observacao?: string;
};

type SingleStatusUpdateInput = {
  requestId: string;
  itemIndex: number;
  status: "aguardando" | "baixas_completas" | "baixas_negadas";
  observacao?: string;
};

export function useUpdateBulkItemsStatus(acaoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: BulkStatusUpdateInput) => updateBulkItemsStatus(input),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(`${result.data?.updated} item(s) atualizado(s)`);
        // Invalida a query para refetch
        queryClient.invalidateQueries({ queryKey: ["acao-clients", acaoId] });
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

export function useUpdateSingleItemStatus(acaoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SingleStatusUpdateInput) =>
      updateSingleItemStatus(
        input.requestId,
        input.itemIndex,
        input.status,
        input.observacao,
      ),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Status atualizado");
        // Invalida a query para refetch
        queryClient.invalidateQueries({ queryKey: ["acao-clients", acaoId] });
      } else {
        toast.error(result.error || "Erro ao atualizar status");
      }
    },
    onError: (error) => {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status");
    },
  });
}
