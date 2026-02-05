"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import type { SubmissionFilters } from "../types";

const DEFAULT_PAGE_SIZE = 10;

export function useSubmissionFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters: SubmissionFilters = useMemo(
    () => ({
      search: searchParams.get("search") || undefined,
      status:
        (searchParams.get("status") as SubmissionFilters["status"]) || "all",
      serviceId: searchParams.get("serviceId") || undefined,
      page: Number(searchParams.get("page")) || 1,
      pageSize: Number(searchParams.get("pageSize")) || DEFAULT_PAGE_SIZE,
    }),
    [searchParams],
  );

  const updateFilters = useCallback(
    (newFilters: Partial<SubmissionFilters>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(newFilters).forEach(([key, value]) => {
        if (value === undefined || value === "" || value === "all") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      // Reset to page 1 when filters change (except page itself)
      if (!("page" in newFilters)) {
        params.set("page", "1");
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
