"use server";

import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "../../lib/auth";

/**
 * Verifica se há uma sessão ativa
 * Redireciona para /login se não houver sessão
 */
export const verifySession = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return { isAuth: true, userId: session.user.id, user: session.user };
});

/**
 * Obtém a sessão atual (pode ser null)
 * Não faz redirect
 */
export const getSession = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
});

/**
 * Requer que o usuário seja admin
 * Redireciona para /dashboard se não for admin
 */
export const requireAdmin = cache(async () => {
  const { user } = await verifySession();

  // @ts-expect-error - role field will be added to schema
  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  return user;
});

/**
 * Requer que o usuário tenha assinatura ativa
 * Redireciona para /assinaturas se não tiver
 */
export const requireActiveSubscription = cache(async () => {
  const { userId } = await verifySession();

  // TODO: Implement subscription check
  // const subscription = await db.query.subscriptions.findFirst({
  //   where: and(
  //     eq(subscriptions.userId, userId),
  //     eq(subscriptions.status, "active")
  //   ),
  // });

  // if (!subscription) {
  //   redirect("/assinaturas");
  // }

  // return subscription;

  return { userId };
});
