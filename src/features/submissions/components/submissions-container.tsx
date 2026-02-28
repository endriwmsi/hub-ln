"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { RowSelectionState } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { CreatePixPaymentResult } from "@/features/service-requests/actions";
import { PaymentModal } from "@/features/service-requests/components/payment-modal";
import { formatCurrency } from "@/shared";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { getSubmissions } from "../actions";
import { useSubmissionFilters } from "../hooks";
import { createColumns } from "./columns";
import { DataTable } from "./data-table";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableSkeleton } from "./data-table-skeleton";
import { DeleteActionsBar } from "./delete-actions-bar";
import { PaymentActionsBar } from "./payment-actions-bar";
import { SubmissionsFilters } from "./submissions-filters";

type Service = {
  id: string;
  title: string;
};

type SubmissionsContainerProps = {
  services?: Service[];
};

export function SubmissionsContainer({
  services = [],
}: SubmissionsContainerProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { filters } = useSubmissionFilters();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<CreatePixPaymentResult | null>(
    null,
  );

  // Handler para deletar um único envio
  const handleSingleDelete = useCallback(
    async (id: string) => {
      const { deleteSubmissions } = await import("../actions");
      const result = await deleteSubmissions([id]);

      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["submissions"] });
        router.refresh();
      }
    },
    [queryClient, router],
  );

  const columns = useMemo(
    () => createColumns({ onDelete: handleSingleDelete }),
    [handleSingleDelete],
  );

  // React Query com filtros como queryKey
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["submissions", filters],
    queryFn: () => getSubmissions(filters),
    staleTime: 1000 * 60, // 1 minuto
    refetchInterval: 1000 * 60 * 3, // 3 minutos
  });

  // Limpar seleção quando filtros mudam
  useEffect(() => {
    setRowSelection({});
  }, []);

  // Calcular submissions selecionados
  const selectedSubmissions = useMemo(() => {
    if (!data?.success || !data.data) return [];
    return data.data.submissions.filter((s) => rowSelection[s.id]);
  }, [data, rowSelection]);

  // Callback quando pagamento é criado
  const handlePaymentCreated = (result: CreatePixPaymentResult) => {
    setPaymentData(result);
    setIsPaymentModalOpen(true);
  };

  // Callback quando pagamento é confirmado
  const handlePaymentConfirmed = () => {
    setRowSelection({});
    queryClient.invalidateQueries({ queryKey: ["submissions"] });
    router.refresh();
  };

  // Fechar modal
  const handleCloseModal = () => {
    setIsPaymentModalOpen(false);
    setPaymentData(null);
  };

  // Callback quando envios são deletados
  const handleDeleted = () => {
    setRowSelection({});
    queryClient.invalidateQueries({ queryKey: ["submissions"] });
    router.refresh();
  };

  if (isLoading) {
    return <DataTableSkeleton />;
  }

  if (isError || !data?.success || !data.data) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>
          {(error as Error)?.message ||
            data?.error ||
            "Erro ao carregar envios."}
        </AlertDescription>
      </Alert>
    );
  }

  const { submissions, pagination } = data.data;

  return (
    <div className="space-y-4">
      <SubmissionsFilters services={services} />

      {/* Barra de ações quando há seleção */}
      {selectedSubmissions.length > 0 && (
        <div className="flex flex-col gap-3 p-4 rounded-lg bg-muted/50 border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">
                {selectedSubmissions.length} envio(s) selecionado(s)
              </span>
              <span className="text-lg font-bold">
                Total:{" "}
                {formatCurrency(
                  selectedSubmissions
                    .reduce((acc, s) => acc + parseFloat(s.totalPrice), 0)
                    .toFixed(2),
                )}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <DeleteActionsBar
                selectedSubmissions={selectedSubmissions}
                onDeleted={handleDeleted}
              />
              <PaymentActionsBar
                selectedSubmissions={selectedSubmissions}
                onPaymentCreated={handlePaymentCreated}
              />
            </div>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={submissions}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        getRowId={(row) => row.id}
      />

      <DataTablePagination
        totalPages={pagination.totalPages}
        total={pagination.total}
      />

      {/* Modal de Pagamento */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={handleCloseModal}
        paymentData={paymentData}
        onPaymentConfirmed={handlePaymentConfirmed}
      />
    </div>
  );
}
