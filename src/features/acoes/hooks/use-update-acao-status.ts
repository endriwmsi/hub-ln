"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateAcaoStatus } from "../actions/update-acao-status";
import type { UpdateAcaoStatusInput } from "../schemas";

export function useUpdateAcaoStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateAcaoStatusInput) => updateAcaoStatus(input),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message);
        queryClient.invalidateQueries({ queryKey: ["acoes"] });
      } else {
        toast.error(result.error || "Erro ao atualizar status");
      }
    },
    onError: (error) => {
      console.error("Erro ao atualizar status da ação:", error);
      toast.error("Erro ao atualizar status");
    },
  });
}
