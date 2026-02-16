"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateAnnouncement } from "../actions";
import type { UpdateAnnouncementInput } from "../schemas";

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAnnouncementInput) => updateAnnouncement(data),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message);
        queryClient.invalidateQueries({ queryKey: ["announcements"] });
      } else {
        toast.error(result.message);
      }
    },
    onError: () => {
      toast.error("Erro ao atualizar aviso");
    },
  });
}
