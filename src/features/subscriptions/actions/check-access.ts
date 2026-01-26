"use server";

import { desc, eq } from "drizzle-orm";
import { getUser } from "@/core/auth/dal";
import { db } from "@/core/db";
import { subscription } from "@/core/db/schema";

export async function checkAccess() {
  const user = await getUser();

  if (!user) {
    return { hasAccess: false, reason: "not_authenticated" };
  }

  try {
    // Buscar assinatura mais recente do usuário
    const [userSubscription] = await db
      .select()
      .from(subscription)
      .where(eq(subscription.userId, user.id))
      .orderBy(desc(subscription.createdAt))
      .limit(1);

    // Se não tem assinatura, bloquear acesso
    if (!userSubscription) {
      return { hasAccess: false, reason: "no_subscription" };
    }

    const now = new Date();

    // Verificar se está em trial
    if (userSubscription.status === "trial") {
      if (
        !userSubscription.trialExpiresAt ||
        now > userSubscription.trialExpiresAt
      ) {
        // Trial expirado
        await db
          .update(subscription)
          .set({ status: "expired" })
          .where(eq(subscription.id, userSubscription.id));

        return { hasAccess: false, reason: "trial_expired" };
      }

      // Trial ainda válido
      return { hasAccess: true, status: "trial" };
    }

    // Verificar se está ativo
    if (userSubscription.status === "active") {
      if (!userSubscription.endDate || now > userSubscription.endDate) {
        // Assinatura expirada
        await db
          .update(subscription)
          .set({ status: "expired" })
          .where(eq(subscription.id, userSubscription.id));

        return { hasAccess: false, reason: "subscription_expired" };
      }

      // Assinatura ativa
      return { hasAccess: true, status: "active" };
    }

    // Status cancelado ou expirado
    if (
      userSubscription.status === "canceled" ||
      userSubscription.status === "expired"
    ) {
      return { hasAccess: false, reason: "subscription_inactive" };
    }

    // Pagamento atrasado ainda tem acesso limitado
    if (userSubscription.status === "past_due") {
      return { hasAccess: true, status: "past_due", limited: true };
    }

    return { hasAccess: false, reason: "unknown" };
  } catch (error) {
    console.error("Erro ao verificar acesso:", error);
    return { hasAccess: false, reason: "error" };
  }
}
