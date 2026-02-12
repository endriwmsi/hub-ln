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
  // Preço que o usuário paga (do indicador ou base)
  costPrice: string;
  // Preço de revenda definido pelo usuário (null = invalidado)
  resalePrice: string | null;
  // Comissão estimada por nome
  commissionPerItem: string;
  // Indica se o preço está válido ou precisa ser reconfigurado
  isValid: boolean;
};

/**
 * Busca todos os serviços com os preços de custo e revenda do usuário.
 *
 * A lógica é:
 * 1. Buscar o preço de revenda do indicador (referred_by) como costPrice
 * 2. Buscar o preço de revenda do próprio usuário
 * 3. Se o usuário não tiver preço definido, sugere o costPrice como mínimo
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

    // Buscar preços de revenda do indicador (se existir)
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
      // Preço do indicador (ou preço base se não tiver indicador)
      const referrerPrice = referrerPrices.find(
        (p) => p.serviceId === service.id,
      );
      const costPrice = referrerPrice?.resalePrice ?? service.basePrice;

      // Preço de revenda do usuário
      const userPrice = userPrices.find((p) => p.serviceId === service.id);
      const resalePrice = userPrice?.resalePrice ?? null;

      // Verifica se o preço está válido
      const isValid = resalePrice !== null;

      // Comissão = resalePrice - costPrice (se tiver resalePrice)
      const commission = resalePrice
        ? (Number(resalePrice) - Number(costPrice)).toFixed(2)
        : "0.00";

      return {
        id: service.id,
        title: service.title,
        slug: service.slug,
        description: service.description,
        basePrice: service.basePrice,
        type: service.type,
        requiresDocument: service.requiresDocument,
        costPrice,
        resalePrice,
        commissionPerItem: commission,
        isValid,
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
