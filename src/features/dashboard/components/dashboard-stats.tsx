"use client";

import {
  Banknote,
  HandCoins,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { cn, formatCurrency } from "@/shared/lib/utils";
import { StatCard } from "./stat-card";

interface DashboardMetrics {
  revenue: {
    total: number;
    percentageChange: number;
    chartData: { date: string; value: number }[];
  };
  referrals: {
    total: number;
    chartData: { date: string; value: number }[];
  };
  withdrawn: {
    total: number;
    chartData: { date: string; value: number }[];
  };
}

interface DashboardStatsProps {
  metrics: DashboardMetrics;
}

export function DashboardStats({ metrics }: DashboardStatsProps) {
  const { revenue, referrals, withdrawn } = metrics;

  return (
    <div className="w-full overflow-x-auto space-y-4 lg:overflow-visible">
      <div className="flex w-max gap-4 lg:grid lg:w-full lg:grid-cols-3">
        {/* Revenue Card */}
        <StatCard
          title="Faturamento Total"
          value={formatCurrency(revenue.total)}
          subtext={
            revenue.percentageChange !== 0 ? (
              <span
                className={cn(
                  "flex items-center text-xs font-medium",
                  revenue.percentageChange > 0
                    ? "text-emerald-500"
                    : "text-red-500",
                )}
              >
                {revenue.percentageChange > 0 ? (
                  <TrendingUp className="mr-1 h-3 w-3" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3" />
                )}
                {Math.abs(revenue.percentageChange).toFixed(1)}% vs. mês
                anterior
              </span>
            ) : (
              "Sem dados do mês anterior"
            )
          }
          icon={Banknote}
          chartData={revenue.chartData}
        />

        {/* Referrals Card */}
        <StatCard
          title="Total de Indicações"
          value={new Intl.NumberFormat("pt-BR").format(referrals.total)}
          subtext="Cadastros com seu código"
          icon={Users}
        />

        {/* Withdrawn Card */}
        <StatCard
          title="Comissões Sacadas"
          value={formatCurrency(withdrawn.total)}
          subtext="Valor total já recebido"
          icon={HandCoins}
        />
      </div>

      <Card className="bg-white border rounded-lg">
        <CardHeader>
          <CardTitle>teste</CardTitle>
        </CardHeader>
        <CardContent></CardContent>
      </Card>
    </div>
  );
}
