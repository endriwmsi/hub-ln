"use client";

import { useQuery } from "@tanstack/react-query";
import type { RowSelectionState } from "@tanstack/react-table";
import { useCallback, useState } from "react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { Card, CardContent } from "@/shared/components/ui/card";
import { getClients } from "../actions";
import { useClientFilters, useUpdateClientsStatus } from "../hooks";
import type { Client, ClientStatus } from "../types";
import { ClientsActionsBar } from "./clients-actions-bar";
import { ClientsTableFilters } from "./clients-table-filters";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableSkeleton } from "./data-table-skeleton";

type ClientsTableContainerProps = {
  services?: Array<{ id: string; title: string }>;
  users?: Array<{ id: string; name: string; email: string }>;
};

export function ClientsTableContainer({
  services = [],
  users = [],
}: ClientsTableContainerProps) {
  const { filters, isPending: isFiltersPending } = useClientFilters();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // React Query com filtros como queryKey
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["clients", filters],
    queryFn: () => getClients(filters),
    staleTime: 1000 * 60, // 60 seconds (aumentado para reduzir refetches)
    placeholderData: (previousData) => previousData, // Mantém dados anteriores durante loading
  });

  // Mutation para atualizar status
  const { mutate: updateStatus, isPending } = useUpdateClientsStatus();

  // Função para gerar rowId único
  const getRowId = useCallback((row: Client) => {
    return `${row.serviceRequestId}-${row.itemIndex}`;
  }, []);

  // Handler para atualizar status dos selecionados
  const handleStatusUpdate = useCallback(
    (status: ClientStatus) => {
      const selectedIds = Object.keys(rowSelection).filter(
        (key) => rowSelection[key],
      );

      const items = selectedIds.map((id) => {
        const lastDashIndex = id.lastIndexOf("-");
        const requestId = id.substring(0, lastDashIndex);
        const itemIndex = Number.parseInt(id.substring(lastDashIndex + 1));

        return { requestId, itemIndex };
      });

      updateStatus(
        { items, status },
        {
          onSuccess: () => {
            setRowSelection({});
          },
        },
      );
    },
    [rowSelection, updateStatus],
  );

  // Handler para limpar seleção
  const handleClearSelection = useCallback(() => {
    setRowSelection({});
  }, []);

  if (isLoading && !data) {
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
          <ClientsTableFilters services={services} users={users} />

          {/* Indicador de loading não-intrusivo */}
          {(isLoading || isFiltersPending) && data && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Atualizando...
            </div>
          )}

          {/* Barra de ações em massa */}
          <ClientsActionsBar
            rowSelection={rowSelection}
            onStatusUpdate={handleStatusUpdate}
            onClearSelection={handleClearSelection}
            isPending={isPending}
          />

          {/* Tabela */}
          <DataTable
            columns={columns}
            data={clients}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            getRowId={getRowId}
          />

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
