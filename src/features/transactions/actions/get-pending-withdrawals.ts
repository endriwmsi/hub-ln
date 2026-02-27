"use server";

import { desc, eq } from "drizzle-orm";
import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import { user, withdrawal } from "@/core/db/schema";
import type { ActionResponse } from "@/shared/lib/server-actions";

type PendingWithdrawal = {
  id: string;
  amount: string;
  status: string;
  requestedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    pixKey: string | null;
  };
};

type GetPendingWithdrawalsResult = {
  withdrawals: PendingWithdrawal[];
};

/**
 * Admin: obtém lista de saques pendentes
 */
export async function getPendingWithdrawals(): Promise<
  ActionResponse<GetPendingWithdrawalsResult>
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

    // Buscar saques pendentes com dados do usuário
    const withdrawals = await db
      .select({
        id: withdrawal.id,
        amount: withdrawal.amount,
        status: withdrawal.status,
        requestedAt: withdrawal.requestedAt,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          pixKey: user.pixKey,
        },
      })
      .from(withdrawal)
      .leftJoin(user, eq(withdrawal.userId, user.id))
      .where(eq(withdrawal.status, "pending"))
      .orderBy(desc(withdrawal.requestedAt));

    return {
      success: true,
      data: {
        withdrawals: withdrawals.map((w) => ({
          ...w,
          user: w.user as {
            id: string;
            name: string;
            email: string;
            pixKey: string | null;
          },
        })),
      },
    };
  } catch (error) {
    console.error("[Transactions] Error getting pending withdrawals:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro ao buscar saques pendentes",
    };
  }
}
