"use server";

import { and, eq, lt, sum } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import { commission, user, withdrawal } from "@/core/db/schema";
import { createNotification } from "@/features/notifications";
import type { ActionResponse } from "@/shared/lib/server-actions";

// Número de dias para liberar comissão para saque
const COMMISSION_RELEASE_DAYS = 7;

// Schema de validação para solicitação de saque
const withdrawalRequestSchema = z.object({
  amount: z
    .number()
    .positive("Valor deve ser positivo")
    .min(10, "Valor mínimo para saque é R$ 10,00"),
});

export type WithdrawalRequestInput = z.infer<typeof withdrawalRequestSchema>;

/**
 * Calcula a data limite para comissões disponíveis (7 dias atrás)
 */
function getCommissionReleaseDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() - COMMISSION_RELEASE_DAYS);
  return date;
}

/**
 * Solicita um saque de comissões
 */
export async function requestWithdrawal(
  input: WithdrawalRequestInput,
): Promise<ActionResponse<{ withdrawalId: string }>> {
  try {
    const session = await verifySession();

    // Validar input
    const validation = withdrawalRequestSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0].message,
      };
    }

    const { amount } = validation.data;
    const releaseDate = getCommissionReleaseDate();

    // Calcular saldo disponível (comissões com 7+ dias)
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

    const availableBalance = Number(availableResult[0]?.total || 0);

    // Buscar saques pendentes
    const pendingWithdrawals = await db
      .select({
        total: sum(withdrawal.amount),
      })
      .from(withdrawal)
      .where(
        and(
          eq(withdrawal.userId, session.userId),
          eq(withdrawal.status, "pending"),
        ),
      );

    const pendingAmount = Number(pendingWithdrawals[0]?.total || 0);
    const actualAvailable = availableBalance - pendingAmount;

    // Verificar se tem saldo suficiente
    if (amount > actualAvailable) {
      return {
        success: false,
        error: `Saldo insuficiente. Disponível: R$ ${actualAvailable.toFixed(2)}`,
      };
    }

    // Criar solicitação de saque
    const [newWithdrawal] = await db
      .insert(withdrawal)
      .values({
        userId: session.userId,
        amount: amount.toFixed(2),
        status: "pending",
      })
      .returning({ id: withdrawal.id });

    // Buscar admins para notificar
    const admins = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.role, "admin"));

    // Notificar todos os admins
    await Promise.allSettled(
      admins.map((admin) =>
        createNotification({
          userId: admin.id,
          type: "withdrawal_request",
          title: "Saque Solicitado",
          message: `O usuário ${session.user.name || session.user.email} solicitou um saque de R$ ${amount.toFixed(2)}.`,
          relatedId: newWithdrawal.id,
          link: "/transacoes",
        }),
      ),
    );

    revalidatePath("/transacoes");

    return {
      success: true,
      data: {
        withdrawalId: newWithdrawal.id,
      },
    };
  } catch (error) {
    console.error("[Transactions] Error requesting withdrawal:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao solicitar saque",
    };
  }
}
