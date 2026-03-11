"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import type { ClientFilters } from "../types";

export function useInvalidateClients() {
  const queryClient = useQueryClient();

  const invalidateClients = useCallback(
    (filters?: ClientFilters) => {
      if (filters) {
        // Invalidate specific query
        queryClient.invalidateQueries({
          queryKey: ["clients", filters],
        });
      } else {
        // Invalidate all clients queries
        queryClient.invalidateQueries({
          queryKey: ["clients"],
        });
      }
    },
    [queryClient],
  );

  return { invalidateClients };
}
