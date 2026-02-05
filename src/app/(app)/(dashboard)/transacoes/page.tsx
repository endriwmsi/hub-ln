import { Suspense } from "react";
import type { TransactionFilters } from "@/features/transactions";
import {
  BalanceCards,
  BalanceCardsSkeleton,
  getBalanceSummary,
  getTransactions,
  TransactionsFilters,
  TransactionsPagination,
  TransactionsTable,
  TransactionsTableSkeleton,
  WithdrawalDialog,
} from "@/features/transactions";

type PageProps = {
  searchParams: Promise<{
    search?: string;
    type?: string;
    status?: string;
    page?: string;
    pageSize?: string;
  }>;
};

export default async function TransacoesPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transações</h1>
          <p className="text-muted-foreground">
            Visualize seus pagamentos, comissões e saques
          </p>
        </div>
        <Suspense fallback={null}>
          <WithdrawalSection />
        </Suspense>
      </div>

      {/* Balance Cards */}
      <Suspense fallback={<BalanceCardsSkeleton />}>
        <BalanceCardsSection />
      </Suspense>

      {/* Filters */}
      <TransactionsFilters />

      {/* Table */}
      <Suspense fallback={<TransactionsTableSkeleton />}>
        <TransactionsTableSection params={params} />
      </Suspense>
    </div>
  );
}

async function WithdrawalSection() {
  const result = await getBalanceSummary();

  if (!result.success || !result.data) {
    return null;
  }

  return <WithdrawalDialog availableBalance={result.data.availableBalance} />;
}

async function BalanceCardsSection() {
  const result = await getBalanceSummary();

  if (!result.success || !result.data) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Erro ao carregar saldo
      </div>
    );
  }

  return <BalanceCards data={result.data} />;
}

async function TransactionsTableSection({
  params,
}: {
  params: {
    search?: string;
    type?: string;
    status?: string;
    page?: string;
    pageSize?: string;
  };
}) {
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
