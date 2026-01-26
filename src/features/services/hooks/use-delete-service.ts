"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteService } from "../actions";

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteService(id),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Serviço excluído com sucesso!");
        queryClient.invalidateQueries({ queryKey: ["services"] });
      } else {
        toast.error("Erro ao excluir serviço");
      }
    },
    onError: () => {
      toast.error("Erro ao excluir serviço");
    },
  });
}
