"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import type { UserFilters, ViewMode } from "../schemas";

const GRID_PAGE_SIZE = 18;
const LIST_PAGE_SIZE = 10;

export function useUserFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters: UserFilters = useMemo(
    () => ({
      search: searchParams.get("search") || undefined,
      role: (searchParams.get("role") as "user" | "admin" | "all") || undefined,
      sortBy:
        (searchParams.get("sortBy") as "createdAt" | "name" | "email") ||
        "createdAt",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
      page: Number(searchParams.get("page")) || 1,
      pageSize: Number(searchParams.get("pageSize")) || 0,
      viewMode: (searchParams.get("viewMode") as ViewMode) || "list",
    }),
    [searchParams],
  );

  const viewMode = filters.viewMode || "list";
  const effectivePageSize =
    filters.pageSize || (viewMode === "grid" ? GRID_PAGE_SIZE : LIST_PAGE_SIZE);

  const updateFilters = useCallback(
    (newFilters: Partial<UserFilters>) => {
      const params = new URLSearchParams(searchParams.toString());

      if (
        newFilters.viewMode !== undefined &&
        newFilters.pageSize === undefined
      ) {
        const newPageSize =
          newFilters.viewMode === "grid" ? GRID_PAGE_SIZE : LIST_PAGE_SIZE;
        params.set("pageSize", String(newPageSize));
        params.set("page", "1");
      }

      Object.entries(newFilters).forEach(([key, value]) => {
        if (value === undefined || value === "" || value === "all") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

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

  const clearFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [pathname, router]);

  return {
    filters: { ...filters, pageSize: effectivePageSize },
    viewMode,
    updateFilters,
    clearFilters,
  };
}
