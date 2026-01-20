"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import type { UserFilters } from "../schemas";

export function useUserFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Obter filtros atuais da URL
  const filters: UserFilters = useMemo(
    () => ({
      search: searchParams.get("search") || undefined,
      role: (searchParams.get("role") as "user" | "admin" | "all") || undefined,
      sortBy:
        (searchParams.get("sortBy") as "createdAt" | "name" | "email") ||
        "createdAt",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
      page: Number(searchParams.get("page")) || 1,
      pageSize: Number(searchParams.get("pageSize")) || 10,
    }),
    [searchParams],
  );

  // Atualizar filtros na URL
  const updateFilters = useCallback(
    (newFilters: Partial<UserFilters>) => {
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
        newFilters.role !== undefined ||
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
    [pathname, router, searchParams],
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
