"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import type { PaginatedReferralsFilter } from "../actions/get-paginated-referrals";

export function useReferralFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo<PaginatedReferralsFilter>(
    () => ({
      search: searchParams.get("search") || undefined,
      page: Number(searchParams.get("page")) || 1,
      pageSize: Number(searchParams.get("pageSize")) || 10,
    }),
    [searchParams],
  );

  const updateFilters = useCallback(
    (newFilters: Partial<PaginatedReferralsFilter>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(newFilters).forEach(([key, value]) => {
        if (value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      // Se mudou algum filtro que não seja a página, volta pra pág 1
      if (
        newFilters.search !== undefined ||
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

  const clearFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [pathname, router]);

  return { filters, updateFilters, clearFilters };
}
