"use client";

import { Banknote, DollarSign, TrendingDown, Users } from "lucide-react";
import { formatCurrency } from "@/shared";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import type { AdminBalanceSummary } from "../types";

type AdminBalanceCardsProps = {
  data: AdminBalanceSummary;
};

export function AdminBalanceCards({ data }: AdminBalanceCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Recebido */}
      <Card className="border-green-200 dark:border-green-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
          <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(data.totalRevenue)}
          </div>
          <p className="text-xs text-muted-foreground">
            Transações (exceto assinaturas)
          </p>
        </CardContent>
      </Card>

      {/* Total de Comissões */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Comissões Geradas
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(data.totalUsersCommissions)}
          </div>
          <p className="text-xs text-muted-foreground">
            Comissões de todos os usuários
          </p>
        </CardContent>
      </Card>

      {/* Disponível para Saque (Usuários) */}
      <Card className="border-amber-200 dark:border-amber-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Disponível p/ Saque
          </CardTitle>
          <Banknote className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {formatCurrency(data.totalUsersWithdrawable)}
          </div>
          <p className="text-xs text-muted-foreground">Usuários podem sacar</p>
        </CardContent>
      </Card>

      {/* Total Sacado */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sacado</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(data.totalUsersWithdrawn)}
          </div>
          <p className="text-xs text-muted-foreground">Saques dos usuários</p>
        </CardContent>
      </Card>
    </div>
  );
}
