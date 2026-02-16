"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteAnnouncement } from "../actions";

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAnnouncement(id),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message);
        queryClient.invalidateQueries({ queryKey: ["announcements"] });
      } else {
        toast.error(result.message);
      }
    },
    onError: () => {
      toast.error("Erro ao deletar aviso");
    },
  });
}
