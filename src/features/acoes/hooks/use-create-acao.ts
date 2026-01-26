"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createAcao } from "../actions/create-acao";
import type { CreateAcaoInput } from "../schemas";

export function useCreateAcao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAcaoInput) => createAcao(input),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message);
        queryClient.invalidateQueries({ queryKey: ["acoes"] });
      } else {
        toast.error(result.error || "Erro ao criar ação");
      }
    },
    onError: (error) => {
      console.error("Erro ao criar ação:", error);
      toast.error("Erro ao criar ação");
    },
  });
}
