"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export interface EntityFilters {
  search?: string;
  status?: string;
  sortBy?: "createdAt" | "name";
  sortOrder?: "asc" | "desc";
  page: number;
  pageSize: number;
}

export function useEntityFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Obter filtros atuais da URL
  const filters: EntityFilters = useMemo(
    () => ({
      search: searchParams.get("search") || undefined,
      status: searchParams.get("status") || undefined,
      sortBy: (searchParams.get("sortBy") as "createdAt" | "name") || "createdAt",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
      page: Number(searchParams.get("page")) || 1,
      pageSize: Number(searchParams.get("pageSize")) || 10,
    }),
    [searchParams]
  );

  // Atualizar filtros na URL
  const updateFilters = useCallback(
    (newFilters: Partial<EntityFilters>) => {
      const params = new URLSearchParams(searchParams.toString());

      // Atualizar ou remover cada parâmetro
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value === undefined || value === "" || value === "all") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      // Se mudou qualquer filtro exceto página, resetar para página 1
      if (
        newFilters.search !== undefined ||
        newFilters.status !== undefined ||
        newFilters.sortBy !== undefined ||
        newFilters.sortOrder !== undefined ||
        newFilters.pageSize !== undefined
      ) {
        if (newFilters.page === undefined) {
          params.set("page", "1");
        }
      }

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // Limpar todos os filtros
  const clearFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [pathname, router]);

  return {
    filters,
    updateFilters,
    clearFilters,
  };
}
