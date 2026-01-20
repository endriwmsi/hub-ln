"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import type { User } from "@/core/db/schema";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { Card, CardContent } from "@/shared/components/ui/card";
import { getUsers } from "../actions/get-users";
import { useUserFilters } from "../hooks/use-user-filters";
import { createColumns } from "./columns";
import { DataTable } from "./data-table";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableSkeleton } from "./data-table-skeleton";
import { UsersTableFilters } from "./users-table-filters";

export function UsersTableContainer() {
  const { filters, updateFilters } = useUserFilters();

  const handleSelectionChange = useCallback((selectedUsers: User[]) => {
    console.log("Selected users:", selectedUsers);
  }, []);

  const columns = useMemo(
    () => createColumns({ filters, updateFilters }),
    [filters, updateFilters],
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["users", filters],
    queryFn: () => getUsers(filters),
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60 * 3,
  });

  if (isLoading) {
    return <DataTableSkeleton />;
  }

  const renderTableContent = () => {
    if (isError || !data?.success) {
      return (
        <Alert variant="destructive">
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>
            {error?.message || "Erro ao carregar usuários. Tente novamente."}
          </AlertDescription>
        </Alert>
      );
    }

    if (!data.data) {
      return (
        <Alert variant="destructive">
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>Dados não encontrados.</AlertDescription>
        </Alert>
      );
    }

    const { users } = data.data;
    return (
      <DataTable
        columns={columns}
        data={users}
        onSelectionChange={handleSelectionChange}
      />
    );
  };

  const pagination = data?.data?.pagination || {
    totalPages: 1,
    total: 0,
  };

  return (
    <Card>
      <CardContent className="space-y-4">
        <UsersTableFilters />
        {renderTableContent()}
        <DataTablePagination
          totalPages={pagination.totalPages}
          total={pagination.total}
        />
      </CardContent>
    </Card>
  );
}
