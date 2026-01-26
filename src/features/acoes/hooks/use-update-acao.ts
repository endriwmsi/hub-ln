"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateAcao } from "../actions/update-acao";
import type { UpdateAcaoInput } from "../schemas";

export function useUpdateAcao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateAcaoInput) => updateAcao(input),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message);
        queryClient.invalidateQueries({ queryKey: ["acoes"] });
      } else {
        toast.error(result.error || "Erro ao atualizar ação");
      }
    },
    onError: (error) => {
      console.error("Erro ao atualizar ação:", error);
      toast.error("Erro ao atualizar ação");
    },
  });
}
