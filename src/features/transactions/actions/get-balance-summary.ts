"use server";

import { and, eq, gte, lt, sql, sum } from "drizzle-orm";
import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import { commission, userBalance, withdrawal } from "@/core/db/schema";
import type { ActionResponse } from "@/shared/lib/server-actions";
import type { BalanceSummary } from "../types";

// Número de dias para liberar comissão para saque
const COMMISSION_RELEASE_DAYS = 7;

/**
 * Calcula a data limite para comissões disponíveis (7 dias atrás)
 */
function getCommissionReleaseDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() - COMMISSION_RELEASE_DAYS);
  return date;
}

/**
 * Obtém o resumo do saldo do usuário com regra de 7 dias
 */
export async function getBalanceSummary(): Promise<
  ActionResponse<BalanceSummary>
> {
  try {
    const session = await verifySession();
    const releaseDate = getCommissionReleaseDate();

    // Buscar ou criar registro de saldo
    let balanceData = await db
      .select()
      .from(userBalance)
      .where(eq(userBalance.userId, session.userId))
      .limit(1);

    if (!balanceData[0]) {
      await db.insert(userBalance).values({
        userId: session.userId,
        availableBalance: "0",
        pendingBalance: "0",
        totalWithdrawn: "0",
      });

      balanceData = [
        {
          id: "",
          userId: session.userId,
          availableBalance: "0",
          pendingBalance: "0",
          totalWithdrawn: "0",
          updatedAt: new Date(),
        },
      ];
    }

    // Calcular saldo disponível - comissões com status 'available' E createdAt < 7 dias atrás
    const availableResult = await db
      .select({
        total: sum(commission.amount),
      })
      .from(commission)
      .where(
        and(
          eq(commission.userId, session.userId),
          eq(commission.status, "available"),
          lt(commission.createdAt, releaseDate),
        ),
      );

    // Calcular saldo pendente - comissões com status 'available' E createdAt >= 7 dias atrás
    // OU comissões com status 'pending'
    const pendingResult = await db
      .select({
        total: sum(commission.amount),
      })
      .from(commission)
      .where(
        and(
          eq(commission.userId, session.userId),
          eq(commission.status, "available"),
          gte(commission.createdAt, releaseDate),
        ),
      );

    const pendingStatusResult = await db
      .select({
        total: sum(commission.amount),
      })
      .from(commission)
      .where(
        and(
          eq(commission.userId, session.userId),
          eq(commission.status, "pending"),
        ),
      );

    const totalEarnedResult = await db
      .select({
        total: sum(commission.amount),
      })
      .from(commission)
      .where(
        and(
          eq(commission.userId, session.userId),
          sql`${commission.status} != 'cancelled'`,
        ),
      );

    // Buscar saques pendentes ou aprovados (ainda não refletidos em totalWithdrawn)
    const pendingWithdrawalsResult = await db
      .select({
        total: sum(withdrawal.amount),
      })
      .from(withdrawal)
      .where(
        and(
          eq(withdrawal.userId, session.userId),
          sql`${withdrawal.status} IN ('pending', 'approved')`,
        ),
      );

    const availableAmount = Number(availableResult[0]?.total || 0);
    const pendingWithdrawals = Number(pendingWithdrawalsResult[0]?.total || 0);

    const totalPaidWithdrawn = Number(balanceData[0].totalWithdrawn || 0);

    // Disponível real = Comissões liberadas - Saques em andamento - Saques já pagos
    const availableBalance = Math.max(
      0,
      availableAmount - pendingWithdrawals - totalPaidWithdrawn,
    ).toFixed(2);

    const pendingFromRecent = pendingResult[0]?.total || "0";
    const pendingFromStatus = pendingStatusResult[0]?.total || "0";
    const pendingBalance = (
      Number(pendingFromRecent) + Number(pendingFromStatus)
    ).toFixed(2);
    const totalEarned = totalEarnedResult[0]?.total || "0";

    return {
      success: true,
      data: {
        availableBalance,
        pendingBalance,
        totalWithdrawn: balanceData[0].totalWithdrawn,
        totalEarned,
      },
    };
  } catch (error) {
    console.error("[Transactions] Error getting balance summary:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao buscar saldo",
    };
  }
}
