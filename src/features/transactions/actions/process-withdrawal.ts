"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import { user, userBalance, withdrawal } from "@/core/db/schema";
import { createNotification } from "@/features/notifications";
import type { ActionResponse } from "@/shared/lib/server-actions";

type ProcessWithdrawalResult = {
  withdrawalId: string;
};

/**
 * Admin processa (marca como pago) uma solicitação de saque
 */
export async function processWithdrawal(
  withdrawalId: string,
  notes?: string,
): Promise<ActionResponse<ProcessWithdrawalResult>> {
  try {
    const session = await verifySession();

    // Verificar se é admin
    if (session.user.role !== "admin") {
      return {
        success: false,
        error: "Acesso não autorizado",
      };
    }

    // Buscar o saque
    const [withdrawalData] = await db
      .select()
      .from(withdrawal)
      .where(eq(withdrawal.id, withdrawalId))
      .limit(1);

    if (!withdrawalData) {
      return {
        success: false,
        error: "Solicitação de saque não encontrada",
      };
    }

    if (withdrawalData.status === "paid") {
      return {
        success: false,
        error: "Este saque já foi processado",
      };
    }

    if (withdrawalData.status === "rejected") {
      return {
        success: false,
        error: "Este saque foi rejeitado",
      };
    }

    // Atualizar status do saque para 'paid'
    await db
      .update(withdrawal)
      .set({
        status: "paid",
        processedAt: new Date(),
        processedById: session.userId,
        notes: notes || "Pago via transferência",
      })
      .where(eq(withdrawal.id, withdrawalId));

    // Atualizar o saldo do usuário (incrementar totalWithdrawn)
    const [currentBalance] = await db
      .select()
      .from(userBalance)
      .where(eq(userBalance.userId, withdrawalData.userId))
      .limit(1);

    if (currentBalance) {
      const newTotalWithdrawn = (
        Number(currentBalance.totalWithdrawn) + Number(withdrawalData.amount)
      ).toFixed(2);

      await db
        .update(userBalance)
        .set({
          totalWithdrawn: newTotalWithdrawn,
        })
        .where(eq(userBalance.userId, withdrawalData.userId));
    }

    // Buscar nome do usuário para a notificação
    const [userData] = await db
      .select({ name: user.name })
      .from(user)
      .where(eq(user.id, withdrawalData.userId))
      .limit(1);

    // Criar notificação para o usuário
    await createNotification({
      userId: withdrawalData.userId,
      type: "withdrawal_paid",
      title: "Saque Pago!",
      message: `Seu saque de R$ ${withdrawalData.amount} foi processado com sucesso.`,
      link: "/transacoes",
      relatedId: withdrawalId,
    });

    revalidatePath("/transacoes");

    return {
      success: true,
      data: {
        withdrawalId,
      },
    };
  } catch (error) {
    console.error("[Transactions] Error processing withdrawal:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao processar saque",
    };
  }
}
