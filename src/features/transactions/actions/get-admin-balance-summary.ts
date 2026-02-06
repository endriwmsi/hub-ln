"use server";

import { and, eq, lt, sql, sum } from "drizzle-orm";
import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import {
  commission,
  serviceRequest,
  userBalance,
  withdrawal,
} from "@/core/db/schema";
import type { ActionResponse } from "@/shared/lib/server-actions";
import type { AdminBalanceSummary } from "../types";

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
 * Obtém o resumo financeiro para ADMIN
 * - Total recebido em service_requests pagos
 * - Total disponível para saque pelos usuários
 * - Total já sacado pelos usuários
 */
export async function getAdminBalanceSummary(): Promise<
  ActionResponse<AdminBalanceSummary>
> {
  try {
    const session = await verifySession();

    // Verificar se é admin
    if (session.user.role !== "admin") {
      return {
        success: false,
        error: "Acesso não autorizado",
      };
    }

    const releaseDate = getCommissionReleaseDate();

    // Total de service_requests pagos (totalPrice)
    const revenueResult = await db
      .select({
        total: sum(serviceRequest.totalPrice),
      })
      .from(serviceRequest)
      .where(eq(serviceRequest.paid, true));

    // Total de comissões disponíveis para saque (todos os usuários)
    // Comissões com status 'available' E createdAt < 7 dias atrás
    const usersWithdrawableResult = await db
      .select({
        total: sum(commission.amount),
      })
      .from(commission)
      .where(
        and(
          eq(commission.status, "available"),
          lt(commission.createdAt, releaseDate),
        ),
      );

    // Total já sacado por todos os usuários
    const usersWithdrawnResult = await db
      .select({
        total: sum(userBalance.totalWithdrawn),
      })
      .from(userBalance);

    // Total de comissões de usuários (todas as não canceladas)
    const usersCommissionsResult = await db
      .select({
        total: sum(commission.amount),
      })
      .from(commission)
      .where(sql`${commission.status} != 'cancelled'`);

    // Saques pendentes ou aprovados (ainda não refletidos em totalWithdrawn)
    const pendingWithdrawalsResult = await db
      .select({
        total: sum(withdrawal.amount),
      })
      .from(withdrawal)
      .where(sql`${withdrawal.status} IN ('pending', 'approved')`);

    // Calcular disponível real: comissões disponíveis - saques pendentes/aprovados
    const availableAmount = Number(usersWithdrawableResult[0]?.total || 0);
    const pendingWithdrawals = Number(pendingWithdrawalsResult[0]?.total || 0);
    const totalPaidWithdrawn = Number(usersWithdrawnResult[0]?.total || 0);

    const actualWithdrawable = Math.max(
      0,
      availableAmount - pendingWithdrawals - totalPaidWithdrawn,
    ).toFixed(2);

    return {
      success: true,
      data: {
        totalRevenue: revenueResult[0]?.total || "0",
        totalUsersWithdrawable: actualWithdrawable,
        totalUsersWithdrawn: usersWithdrawnResult[0]?.total || "0",
        totalUsersCommissions: usersCommissionsResult[0]?.total || "0",
      },
    };
  } catch (error) {
    console.error("[Transactions] Error getting admin balance summary:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro ao buscar resumo financeiro",
    };
  }
}
