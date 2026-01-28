"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  type CreateFormFieldInput,
  createFormField,
} from "@/features/form-fields";

export function useCreateFormField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFormFieldInput) => {
      const result = await createFormField(data);
      if (!result.success) {
        throw new Error(result.error || "Erro ao criar campo");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form-fields"] });
      toast.success("Campo criado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
