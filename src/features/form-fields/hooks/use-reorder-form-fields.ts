import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { reorderFormFields } from "../actions";
import type { ReorderFieldsInput } from "../schemas";

export function useReorderFormFields() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ReorderFieldsInput) => reorderFormFields(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form-fields"] });
      toast.success("Ordem dos campos atualizada com sucesso");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao reordenar campos");
    },
  });
}
