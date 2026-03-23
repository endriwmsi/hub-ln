"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteAcaoItem } from "../actions/delete-acao-item";

type DeleteItemInput = {
  requestId: string;
  itemIndex: number;
};

export function useDeleteAcaoItem(acaoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DeleteItemInput) => deleteAcaoItem(input),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Item excluído com sucesso");
        queryClient.invalidateQueries({ queryKey: ["acao-clients", acaoId] });
      } else {
        toast.error(result.error || "Erro ao excluir item");
      }
    },
    onError: (error) => {
      console.error("Erro ao excluir item:", error);
      toast.error("Erro ao excluir item");
    },
  });
}
