"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { toggleAcaoField } from "../actions/toggle-acao-field";
import type { ToggleAcaoFieldInput } from "../schemas";

export function useToggleAcaoField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ToggleAcaoFieldInput) => toggleAcaoField(input),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message);
        queryClient.invalidateQueries({ queryKey: ["acoes"] });
      } else {
        toast.error(result.error || "Erro ao atualizar campo");
      }
    },
    onError: (error) => {
      console.error("Erro ao atualizar campo da ação:", error);
      toast.error("Erro ao atualizar campo");
    },
  });
}
