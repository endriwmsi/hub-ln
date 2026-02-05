"use client";

import { ArrowDownRight, ArrowUpRight, Clock, Wallet } from "lucide-react";
import { formatCurrency } from "@/shared";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import type { BalanceSummary } from "../types";

type BalanceCardsProps = {
  data: BalanceSummary;
};

export function BalanceCards({ data }: BalanceCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Disponível para saque */}
      <Card className="border-green-200 dark:border-green-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Disponível para Saque
          </CardTitle>
          <Wallet className="h-4 w-4 text-green-600 dark:text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(data.availableBalance)}
          </div>
          <p className="text-xs text-muted-foreground">Liberado após 7 dias</p>
        </CardContent>
      </Card>

      {/* Aguardando liberação */}
      <Card className="border-yellow-200 dark:border-yellow-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Aguardando Liberação
          </CardTitle>
          <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {formatCurrency(data.pendingBalance)}
          </div>
          <p className="text-xs text-muted-foreground">
            Liberado em até 7 dias
          </p>
        </CardContent>
      </Card>

      {/* Total ganho */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Ganho</CardTitle>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(data.totalEarned)}
          </div>
          <p className="text-xs text-muted-foreground">Em comissões</p>
        </CardContent>
      </Card>

      {/* Total sacado */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sacado</CardTitle>
          <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(data.totalWithdrawn)}
          </div>
          <p className="text-xs text-muted-foreground">Histórico de saques</p>
        </CardContent>
      </Card>
    </div>
  );
}

export function BalanceCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: Its a skeleton and dont need to follow any rules
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-28 mb-1" />
            <Skeleton className="h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
