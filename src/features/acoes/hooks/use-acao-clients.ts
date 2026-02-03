"use client";

import { useQuery } from "@tanstack/react-query";
import {
  type GetAcaoClientsFilters,
  getAcaoClients,
} from "../actions/get-acao-clients";

export type UseAcaoClientsOptions = {
  acaoId: string;
  filters?: GetAcaoClientsFilters;
  enabled?: boolean;
};

export function useAcaoClients({
  acaoId,
  filters = {},
  enabled = true,
}: UseAcaoClientsOptions) {
  return useQuery({
    queryKey: ["acao-clients", acaoId, filters],
    queryFn: () => getAcaoClients(acaoId, filters),
    enabled: enabled && !!acaoId,
    staleTime: 30 * 1000, // 30 segundos
    refetchOnWindowFocus: false,
  });
}
