"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  type UpdateFormFieldInput,
  updateFormField,
} from "@/features/form-fields";

export function useUpdateFormField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateFormFieldInput) => {
      const result = await updateFormField(data);
      if (!result.success) {
        throw new Error(result.error || "Erro ao atualizar campo");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form-fields"] });
      toast.success("Campo atualizado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
