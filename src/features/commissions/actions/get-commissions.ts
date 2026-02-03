"use server";

import { and, desc, eq, sql, sum } from "drizzle-orm";
import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import { commission, userBalance } from "@/core/db/schema";
import type { ActionResponse } from "@/shared/lib/server-actions";

export type UserBalanceSummary = {
  availableBalance: string;
  pendingBalance: string;
  totalWithdrawn: string;
  totalEarned: string;
};

/**
 * Obtém o resumo do saldo do usuário
 */
export async function getUserBalanceSummary(): Promise<
  ActionResponse<UserBalanceSummary>
> {
  try {
    const session = await verifySession();

    // Buscar saldo
    const balanceData = await db
      .select()
      .from(userBalance)
      .where(eq(userBalance.userId, session.userId))
      .limit(1);

    // Se não existe, criar registro
    if (!balanceData[0]) {
      await db.insert(userBalance).values({
        userId: session.userId,
        availableBalance: "0",
        pendingBalance: "0",
        totalWithdrawn: "0",
      });

      return {
        success: true,
        data: {
          availableBalance: "0.00",
          pendingBalance: "0.00",
          totalWithdrawn: "0.00",
          totalEarned: "0.00",
        },
      };
    }

    // Calcular total ganho (soma de todas as comissões)
    const totalEarnedResult = await db
      .select({
        total: sum(commission.amount),
      })
      .from(commission)
      .where(eq(commission.userId, session.userId));

    const totalEarned = totalEarnedResult[0]?.total || "0";

    return {
      success: true,
      data: {
        availableBalance: balanceData[0].availableBalance,
        pendingBalance: balanceData[0].pendingBalance,
        totalWithdrawn: balanceData[0].totalWithdrawn,
        totalEarned,
      },
    };
  } catch (error) {
    console.error("[Commissions] Error getting balance summary:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao buscar saldo",
    };
  }
}

export type CommissionItem = {
  id: string;
  amount: string;
  status: "pending" | "available" | "paid" | "cancelled";
  description: string | null;
  level: string;
  createdAt: Date;
  payer: {
    id: string;
    name: string;
    email: string;
  };
  serviceRequest: {
    id: string;
    totalPrice: string;
  };
};

export type GetCommissionsResult = {
  data: CommissionItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

/**
 * Lista as comissões do usuário
 */
export async function getUserCommissions(params?: {
  status?: "pending" | "available" | "paid" | "cancelled" | "all";
  page?: number;
  pageSize?: number;
}): Promise<ActionResponse<GetCommissionsResult>> {
  try {
    const session = await verifySession();
    const { status = "all", page = 1, pageSize = 10 } = params || {};

    // Construir condições
    const conditions = [eq(commission.userId, session.userId)];

    if (status && status !== "all") {
      conditions.push(eq(commission.status, status));
    }

    // Buscar comissões com paginação
    const commissions = await db.query.commission.findMany({
      where: and(...conditions),
      orderBy: [desc(commission.createdAt)],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      with: {
        payer: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        serviceRequest: {
          columns: {
            id: true,
            totalPrice: true,
          },
        },
      },
    });

    // Contar total
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(commission)
      .where(and(...conditions));

    const total = countResult[0]?.count || 0;

    return {
      success: true,
      data: {
        data: commissions as CommissionItem[],
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    };
  } catch (error) {
    console.error("[Commissions] Error getting commissions:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao buscar comissões",
    };
  }
}
