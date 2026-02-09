"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { getTransactions } from "../actions";
import { useTransactionFilters } from "../hooks/use-transaction-filters";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { TransactionsPagination } from "./transactions-pagination";
import { TransactionsTableSkeleton } from "./transactions-table";

export function TransactionsTableContainer() {
  const { filters } = useTransactionFilters();

  // React Query with filters as queryKey
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["transactions", filters],
    queryFn: () => getTransactions(filters),
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60,
  });

  if (isLoading) {
    return <TransactionsTableSkeleton />;
  }

  if (isError || !data?.success || !data?.data) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>
          {error?.message || "Erro ao carregar transações."}
        </AlertDescription>
      </Alert>
    );
  }

  const { data: transactions, pagination } = data.data;

  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={transactions} />
      <TransactionsPagination
        total={pagination.total}
        totalPages={pagination.totalPages}
      />
    </div>
  );
}
