"use server";

import { desc, eq } from "drizzle-orm";
import { getUser } from "@/core/auth/dal";
import { db } from "@/core/db";
import { subscription } from "@/core/db/schema";

export async function checkSubscriptionStatus() {
  const user = await getUser();

  if (!user) {
    return { success: false, message: "Usuário não autenticado" };
  }

  try {
    const [userSubscription] = await db
      .select()
      .from(subscription)
      .where(eq(subscription.userId, user.id))
      .orderBy(desc(subscription.createdAt))
      .limit(1);

    if (!userSubscription) {
      return {
        success: true,
        data: {
          hasSubscription: false,
          status: null,
          isExpired: true,
        },
      };
    }

    const now = new Date();
    let isExpired = false;

    // Verificar se está em trial e se expirou
    if (
      userSubscription.status === "trial" &&
      userSubscription.trialExpiresAt
    ) {
      isExpired = now > userSubscription.trialExpiresAt;
    }

    // Verificar se está ativo e se a data de término passou
    if (userSubscription.status === "active" && userSubscription.endDate) {
      isExpired = now > userSubscription.endDate;
    }

    // Se expirou, atualizar status no banco
    if (
      isExpired &&
      userSubscription.status !== "expired" &&
      userSubscription.status !== "canceled"
    ) {
      await db
        .update(subscription)
        .set({ status: "expired" })
        .where(eq(subscription.id, userSubscription.id));

      return {
        success: true,
        data: {
          hasSubscription: true,
          status: "expired",
          isExpired: true,
          trialExpiresAt: userSubscription.trialExpiresAt,
          endDate: userSubscription.endDate,
        },
      };
    }

    return {
      success: true,
      data: {
        hasSubscription: true,
        status: userSubscription.status,
        isExpired,
        trialExpiresAt: userSubscription.trialExpiresAt,
        endDate: userSubscription.endDate,
      },
    };
  } catch (error) {
    console.error("Erro ao verificar assinatura:", error);
    return {
      success: false,
      message: "Erro ao verificar status da assinatura",
    };
  }
}
