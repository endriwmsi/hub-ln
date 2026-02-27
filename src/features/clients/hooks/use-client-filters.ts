"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useTransition } from "react";
import type { ClientFilters } from "../types";

export function useClientFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const filters = useMemo<ClientFilters>(() => {
    // Parse search terms (comma-separated)
    const searchString = searchParams.get("search") || "";
    const search = searchString
      ? searchString.split(",").filter((term) => term.trim())
      : [];

    return {
      search,
      status:
        (searchParams.get("status") as
          | "aguardando"
          | "baixas_completas"
          | "baixas_negadas"
          | "all") || "all",
      serviceId: searchParams.get("serviceId") || undefined,
      userId: searchParams.get("userId") || undefined,
      paid:
        searchParams.get("paid") === "true"
          ? true
          : searchParams.get("paid") === "false"
            ? false
            : "all",
      page: Number(searchParams.get("page")) || 1,
      pageSize: Number(searchParams.get("pageSize")) || 10,
    };
  }, [searchParams]);

  const updateFilters = useCallback(
    (newFilters: Partial<ClientFilters>) => {
      // Usa transition para tornar a navegação não-bloqueante
      startTransition(() => {
        const params = new URLSearchParams(searchParams);

        // Handle search array
        if (newFilters.search !== undefined) {
          if (newFilters.search.length > 0) {
            params.set("search", newFilters.search.join(","));
          } else {
            params.delete("search");
          }
        }

        // Handle other filters
        if (newFilters.status !== undefined) {
          if (newFilters.status === "all") {
            params.delete("status");
          } else {
            params.set("status", newFilters.status);
          }
        }

        if ("serviceId" in newFilters) {
          if (newFilters.serviceId) {
            params.set("serviceId", newFilters.serviceId);
          } else {
            params.delete("serviceId");
          }
        }

        if ("userId" in newFilters) {
          if (newFilters.userId) {
            params.set("userId", newFilters.userId);
          } else {
            params.delete("userId");
          }
        }

        if (newFilters.paid !== undefined) {
          if (newFilters.paid === "all") {
            params.delete("paid");
          } else {
            params.set("paid", String(newFilters.paid));
          }
        }

        if (newFilters.page !== undefined) {
          params.set("page", String(newFilters.page));
        }

        if (newFilters.pageSize !== undefined) {
          params.set("pageSize", String(newFilters.pageSize));
        }

        router.replace(`${pathname}?${params.toString()}`);
      });
    },
    [pathname, router, searchParams],
  );

  const resetFilters = useCallback(() => {
    startTransition(() => {
      router.replace(pathname);
    });
  }, [pathname, router]);

  return { filters, updateFilters, resetFilters, isPending };
}
