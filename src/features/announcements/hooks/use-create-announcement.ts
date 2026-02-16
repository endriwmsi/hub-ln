"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createAnnouncement } from "../actions";
import type { CreateAnnouncementInput } from "../schemas";

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAnnouncementInput) => createAnnouncement(data),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message);
        queryClient.invalidateQueries({ queryKey: ["announcements"] });
      } else {
        toast.error(result.message);
      }
    },
    onError: () => {
      toast.error("Erro ao criar aviso");
    },
  });
}
