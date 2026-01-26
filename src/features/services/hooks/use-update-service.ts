"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateService } from "../actions";
import type { UpdateServiceInput } from "../schemas";

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateServiceInput) => updateService(data),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Serviço atualizado com sucesso!");
        queryClient.invalidateQueries({ queryKey: ["services"] });
      } else {
        toast.error("Erro ao atualizar serviço");
      }
    },
    onError: () => {
      toast.error("Erro ao atualizar serviço");
    },
  });
}
