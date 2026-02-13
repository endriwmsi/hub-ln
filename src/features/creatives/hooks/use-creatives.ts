"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteCreative, listCreatives } from "../actions";

/**
 * Hook para listar todos os criativos
 */
export function useCreatives() {
  return useQuery({
    queryKey: ["creatives"],
    queryFn: async () => {
      const result = await listCreatives();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
}

/**
 * Hook para deletar um criativo (admin only)
 */
export function useDeleteCreative() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteCreative(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creatives"] });
      toast.success("Criativo deletado com sucesso");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao deletar criativo");
    },
  });
}
