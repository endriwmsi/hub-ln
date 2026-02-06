import type { TransactionFilters } from "@/features/transactions";
import {
  getTransactions,
  TransactionsPagination,
  TransactionsTable,
} from "@/features/transactions";

type paramsProps = {
  params: {
    search?: string;
    type?: string;
    status?: string;
    page?: string;
    pageSize?: string;
  };
};

export default async function TransactionsTableSection({
  params,
}: paramsProps) {
  const filters: Partial<TransactionFilters> = {
    search: params.search,
    type: params.type as TransactionFilters["type"],
    status: params.status as TransactionFilters["status"],
    page: params.page ? Number(params.page) : 1,
    pageSize: params.pageSize ? Number(params.pageSize) : 10,
  };

  const result = await getTransactions(filters);

  if (!result.success || !result.data) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Erro ao carregar transações
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TransactionsTable transactions={result.data.data} />
      <TransactionsPagination
        total={result.data.pagination.total}
        totalPages={result.data.pagination.totalPages}
      />
    </div>
  );
}
