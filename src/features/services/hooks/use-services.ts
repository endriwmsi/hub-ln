"use client";

import { useQuery } from "@tanstack/react-query";
import { getServices } from "../actions";

export function useServices(onlyActive = false) {
  return useQuery({
    queryKey: ["services", { onlyActive }],
    queryFn: () => getServices(onlyActive),
  });
}
