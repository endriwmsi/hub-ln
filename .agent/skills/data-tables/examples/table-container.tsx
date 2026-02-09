"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import type { Entity } from "../types";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { getEntities } from "../actions";
import { useEntityFilters } from "../hooks/use-entity-filters";
import { createColumns } from "./columns";
import { DataTable } from "./data-table";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableSkeleton } from "./data-table-skeleton";
import { TableFilters } from "./table-filters";

export function TableContainer() {
  const { filters, updateFilters } = useEntityFilters();

  const handleSelectionChange = useCallback((selectedEntities: Entity[]) => {
    console.log("Selected:", selectedEntities);
  }, []);

  const columns = useMemo(
    () => createColumns({ filters, updateFilters }),
    [filters, updateFilters]
  );

  // React Query com filtros como queryKey
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["entities", filters],
    queryFn: () => getEntities(filters),
    staleTime: 1000 * 60, // 1 minuto
    refetchInterval: 1000 * 60 * 3, // 3 minutos
  });

  if (isLoading) {
    return <DataTableSkeleton />;
  }

  if (isError || !data?.success) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>
          {error?.message || "Erro ao carregar dados."}
        </AlertDescription>
      </Alert>
    );
  }

  const { entities } = data.data;
  const pagination = data.data.pagination || { totalPages: 1, total: 0 };

  return (
    <Card>
      <CardContent className="space-y-4">
        <TableFilters />
        <DataTable
          columns={columns}
          data={entities}
          onSelectionChange={handleSelectionChange}
        />
        <DataTablePagination
          totalPages={pagination.totalPages}
          total={pagination.total}
        />
      </CardContent>
    </Card>
  );
}
