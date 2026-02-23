"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { Card, CardContent } from "@/shared/components/ui/card";
import { getClients } from "../actions";
import { useClientFilters } from "../hooks";
import { ClientsTableFilters } from "./clients-table-filters";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableSkeleton } from "./data-table-skeleton";

type ClientsTableContainerProps = {
  services?: Array<{ id: string; title: string }>;
};

export function ClientsTableContainer({
  services = [],
}: ClientsTableContainerProps) {
  const { filters } = useClientFilters();

  // React Query com filtros como queryKey
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["clients", filters],
    queryFn: () => getClients(filters),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 30, // Refetch a cada 30s
  });

  if (isLoading) {
    return <DataTableSkeleton />;
  }

  if (isError || !data?.success || !data?.data) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>
          {error instanceof Error
            ? error.message
            : data?.error || "Erro ao carregar clientes"}
        </AlertDescription>
      </Alert>
    );
  }

  const { clients, pagination } = data.data;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Filtros */}
          <ClientsTableFilters services={services} />

          {/* Tabela */}
          <DataTable columns={columns} data={clients} />

          {/* Paginação */}
          {pagination.total > 0 && (
            <DataTablePagination
              totalPages={pagination.totalPages}
              total={pagination.total}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
