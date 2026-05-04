"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import type { User } from "@/core/db/schema";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { Separator } from "@/shared/components/ui/separator";
import { getUsers } from "../actions/get-users";
import { useUserFilters } from "../hooks/use-user-filters";
import { createColumns } from "./columns";
import { DataTable } from "./data-table";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableSkeleton } from "./data-table-skeleton";
import { UserCard } from "./user-card";
import { UsersTableFilters } from "./users-table-filters";

export function UsersTableContainer() {
  const { filters, viewMode, updateFilters } = useUserFilters();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleSelectionChange = useCallback((selectedUsers: User[]) => {
    setSelectedIds(new Set(selectedUsers.map((u) => u.id)));
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
    return <DataTableSkeleton viewMode={viewMode} />;
  }

  const handleCardSelect = (userId: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(userId);
      } else {
        next.delete(userId);
      }
      return next;
    });
  };

  const renderContent = () => {
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

    if (viewMode === "grid") {
      return (
        <div>
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              {selectedIds.size} usuário(s) selecionado(s)
            </div>
          )}
          {users.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              Nenhum usuário encontrado.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {users.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  isSelected={selectedIds.has(user.id)}
                  onSelectChange={(checked) =>
                    handleCardSelect(user.id, checked)
                  }
                />
              ))}
            </div>
          )}
        </div>
      );
    }

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
    <div className="space-y-4">
      <UsersTableFilters />
      <Separator className="mt-8" />
      <div className="mt-8">{renderContent()}</div>
      <DataTablePagination
        totalPages={pagination.totalPages}
        total={pagination.total}
      />
    </div>
  );
}
