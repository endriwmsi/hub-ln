"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { toggleAnnouncementStatus } from "../actions";

export function useToggleAnnouncementStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => toggleAnnouncementStatus(id),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message);
        queryClient.invalidateQueries({ queryKey: ["announcements"] });
      } else {
        toast.error(result.message);
      }
    },
    onError: () => {
      toast.error("Erro ao alterar status do aviso");
    },
  });
}
