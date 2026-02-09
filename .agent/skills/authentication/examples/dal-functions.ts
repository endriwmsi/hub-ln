import "server-only";
import { cache } from "react";
import { auth } from "./config";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/core/db";
import { subscriptions } from "@/features/subscriptions/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Verifica se há uma sessão ativa.
 * Redireciona para /login se não autenticado.
 */
export const verifySession = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return { isAuth: true, userId: session.user.id };
});

/**
 * Requer role de admin.
 * Redireciona para /dashboard se não for admin.
 */
export const requireAdmin = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return session;
});

/**
 * Requer assinatura ativa.
 * Redireciona para /assinaturas se não tiver assinatura.
 */
export const requireActiveSubscription = cache(async () => {
  const { userId } = await verifySession();

  const subscription = await db.query.subscriptions.findFirst({
    where: and(
      eq(subscriptions.userId, userId),
      eq(subscriptions.status, "active")
    ),
  });

  if (!subscription) {
    redirect("/assinaturas");
  }

  return subscription;
});
