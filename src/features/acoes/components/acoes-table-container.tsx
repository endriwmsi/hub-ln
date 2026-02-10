"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import type { Acao } from "@/core/db/schema";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { getAcoes } from "../actions/get-acoes";
import { useAcaoFilters } from "../hooks/use-acao-filters";
import { AcaoFormDialog } from "./acao-form-dialog";
import { AcoesTableFilters } from "./acoes-table-filters";
import { createColumns } from "./columns";
import { DataTable } from "./data-table";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableSkeleton } from "./data-table-skeleton";
import { DeleteAcaoDialog } from "./delete-acao-dialog";

export function AcoesTableContainer() {
  const { filters, updateFilters } = useAcaoFilters();

  // Estado para diálogos
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAcao, setSelectedAcao] = useState<Acao | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = useCallback((id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSelectionChange = useCallback((selectedAcoes: Acao[]) => {
    console.log("Selected acoes:", selectedAcoes);
  }, []);

  const handleEdit = useCallback((acao: Acao) => {
    setSelectedAcao(acao);
    setFormDialogOpen(true);
  }, []);

  const handleDelete = useCallback((acao: Acao) => {
    setSelectedAcao(acao);
    setDeleteDialogOpen(true);
  }, []);

  const handleCreate = useCallback(() => {
    setSelectedAcao(null);
    setFormDialogOpen(true);
  }, []);

  const columns = useMemo(
    () =>
      createColumns({
        filters,
        updateFilters,
        onEdit: handleEdit,
        onDelete: handleDelete,
        expandedRows,
        toggleRow,
      }),
    [filters, updateFilters, handleEdit, handleDelete, expandedRows, toggleRow],
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["acoes", filters],
    queryFn: () => getAcoes(filters),
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
            {error?.message || "Erro ao carregar ações. Tente novamente."}
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

    const { acoes } = data.data;
    return (
      <DataTable
        columns={columns}
        data={acoes}
        onSelectionChange={handleSelectionChange}
        expandedRows={expandedRows}
      />
    );
  };

  const pagination = data?.data?.pagination || {
    totalPages: 1,
    total: 0,
  };

  return (
    <>
      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <AcoesTableFilters />
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Ação
            </Button>
          </div>
          {renderTableContent()}
          <DataTablePagination
            totalPages={pagination.totalPages}
            total={pagination.total}
          />
        </CardContent>
      </Card>

      {/* Diálogo de criação/edição */}
      <AcaoFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        acao={selectedAcao}
      />

      {/* Diálogo de exclusão */}
      <DeleteAcaoDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        acao={selectedAcao}
      />
    </>
  );
}
