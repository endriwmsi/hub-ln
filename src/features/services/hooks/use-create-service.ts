"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createService } from "../actions";
import type { CreateServiceInput } from "../schemas";

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServiceInput) => createService(data),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Serviço criado com sucesso!");
        queryClient.invalidateQueries({ queryKey: ["services"] });
      } else {
        toast.error("Erro ao criar serviço");
      }
    },
    onError: () => {
      toast.error("Erro ao criar serviço");
    },
  });
}
