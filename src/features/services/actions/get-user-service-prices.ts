"use server";

import { eq } from "drizzle-orm";
import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import { services, user, userServicePrice } from "@/core/db/schema";
import type { ActionResponse } from "@/shared/lib/server-actions";

export type ServiceWithPrice = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  basePrice: string;
  type: string;
  requiresDocument: boolean;
  // Preço que o usuário paga (definido pelo indicador, ou herdado do custo do indicador, ou base)
  costPrice: string;
};

/**
 * Busca todos os serviços com o preço de custo para o usuário atual.
 *
 * A lógica é:
 * 1. Verifica se tem um preço customizado definido
 * 2. Se não, herda o preço de custo do referenciador
 * 3. Se não houver referenciador, usa o preço base
 */
export async function getUserServicePrices(): Promise<
  ActionResponse<ServiceWithPrice[]>
> {
  try {
    const session = await verifySession();

    // Buscar o usuário atual com o código do indicador
    const currentUser = await db.query.user.findFirst({
      where: eq(user.id, session.userId),
    });

    if (!currentUser) {
      return {
        success: false,
        error: "Usuário não encontrado",
      };
    }

    // Buscar todos os serviços ativos
    const allServices = await db
      .select()
      .from(services)
      .where(eq(services.isActive, true));

    // Buscar o indicador pelo referralCode
    let referrer: typeof currentUser | undefined;
    if (currentUser.referredBy) {
      referrer = await db.query.user.findFirst({
        where: eq(user.referralCode, currentUser.referredBy),
      });
    }

    // Buscar preços de custo do indicador (se existir)
    const referrerPrices = referrer
      ? await db
          .select()
          .from(userServicePrice)
          .where(eq(userServicePrice.userId, referrer.id))
      : [];

    // Buscar preços de revenda do usuário atual
    const userPrices = await db
      .select()
      .from(userServicePrice)
      .where(eq(userServicePrice.userId, session.userId));

    // Montar resultado
    const result: ServiceWithPrice[] = allServices.map((service) => {
      const userPrice = userPrices.find((p) => p.serviceId === service.id);

      // Preço de custo do usuário:
      // Se não tiver registro ainda, herda do custo do indicador ou do preço base
      const referrerPrice = referrerPrices.find(
        (p) => p.serviceId === service.id,
      );
      const costPrice =
        userPrice?.costPrice ?? referrerPrice?.costPrice ?? service.basePrice;

      return {
        id: service.id,
        title: service.title,
        slug: service.slug,
        description: service.description,
        basePrice: service.basePrice,
        type: service.type,
        requiresDocument: service.requiresDocument,
        costPrice,
      };
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("[Services] Error getting user service prices:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro ao buscar preços de serviços",
    };
  }
}
