"use server";

import { eq } from "drizzle-orm";
import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import { services, user, userServicePrice } from "@/core/db/schema";
import type { ActionResponse } from "@/shared/lib/server-actions";

export type UserWithServicePrice = {
  id: string;
  name: string;
  email: string;
  cpf: string;
  role: string;
  referralCode: string;
  referredBy: string | null;
  costPrice: string;
  isCustomPrice: boolean;
};

export async function getUsersWithServicePrice(
  serviceId: string,
): Promise<ActionResponse<UserWithServicePrice[]>> {
  try {
    const session = await verifySession();
    const currentUser = await db.query.user.findFirst({
      where: eq(user.id, session.userId),
    });

    if (!currentUser || currentUser.role !== "admin") {
      return { success: false, error: "Não autorizado" };
    }

    const service = await db.query.services.findFirst({
      where: eq(services.id, serviceId),
    });

    if (!service) {
      return { success: false, error: "Serviço não encontrado" };
    }

    // Buscar todos os usuários
    const allUsers = await db.select().from(user);

    // Buscar todos os preços configurados para este serviço
    const allPrices = await db
      .select()
      .from(userServicePrice)
      .where(eq(userServicePrice.serviceId, serviceId));

    // Mapear preços por usuário para acesso rápido
    const pricesByUserId = new Map(
      allPrices.map((p) => [p.userId, p]),
    );

    // Mapear usuários por referralCode para acesso rápido
    const usersByReferralCode = new Map(
      allUsers.map((u) => [u.referralCode, u]),
    );

    // Função auxiliar para calcular o preço recursivamente caso não tenha um customPrice
    const resolveCostPrice = (
      userId: string,
      visited = new Set<string>(),
    ): string => {
      if (visited.has(userId)) return service.basePrice;
      visited.add(userId);

      const customPrice = pricesByUserId.get(userId);
      if (customPrice) return customPrice.costPrice;

      const currentUserNode = allUsers.find((u) => u.id === userId);
      if (currentUserNode?.referredBy) {
        const referrer = usersByReferralCode.get(currentUserNode.referredBy);
        if (referrer) {
          return resolveCostPrice(referrer.id, visited);
        }
      }

      return service.basePrice;
    };

    const result: UserWithServicePrice[] = allUsers.map((u) => {
      const customPrice = pricesByUserId.get(u.id);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        cpf: u.cpf,
        role: u.role,
        referralCode: u.referralCode,
        referredBy: u.referredBy,
        costPrice: resolveCostPrice(u.id),
        isCustomPrice: !!customPrice,
      };
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("[Services] Error getting users with service price:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao buscar usuários",
    };
  }
}
