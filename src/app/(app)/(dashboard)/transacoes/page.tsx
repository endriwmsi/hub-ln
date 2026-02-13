import { Suspense } from "react";
import {
  BalanceCardsSkeleton,
  TransactionsFilters,
  TransactionsTableSkeleton,
} from "@/features/transactions";
import BalanceCardsSection from "@/features/transactions/components/balance-cards-section";
import PendingWithdrawalsSection from "@/features/transactions/components/pending-withdrawals-section";
import { TransactionsTableContainer } from "@/features/transactions/components/transactions-table-container";
import WithdrawalSection from "@/features/transactions/components/withdrawal-section";
import { Card, CardContent } from "@/shared/components/ui/card";

export default async function TransacoesPage() {
  return (
    <div className="space-y-6 gap-6 py-4 md:gap-8 md:py-6 px-6">
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

      {/* Pending Withdrawals (Admin only) */}
      <Suspense fallback={null}>
        <PendingWithdrawalsSection />
      </Suspense>

      {/* Table */}
      <Card>
        <CardContent className="space-y-4">
          {/* Filters */}
          <TransactionsFilters />

          <Suspense fallback={<TransactionsTableSkeleton />}>
            <TransactionsTableContainer />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
