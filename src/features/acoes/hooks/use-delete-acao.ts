"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteAcao } from "../actions/delete-acao";

export function useDeleteAcao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAcao(id),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message);
        queryClient.invalidateQueries({ queryKey: ["acoes"] });
      } else {
        toast.error(result.error || "Erro ao excluir ação");
      }
    },
    onError: (error) => {
      console.error("Erro ao excluir ação:", error);
      toast.error("Erro ao excluir ação");
    },
  });
}
