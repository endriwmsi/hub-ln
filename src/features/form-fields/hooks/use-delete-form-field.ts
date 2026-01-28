"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteFormField } from "@/features/form-fields";

export function useDeleteFormField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteFormField(id);
      if (!result.success) {
        throw new Error(result.error || "Erro ao deletar campo");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form-fields"] });
      toast.success("Campo removido com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
