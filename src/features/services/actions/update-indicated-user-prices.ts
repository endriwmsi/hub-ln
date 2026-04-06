"use server";

import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import { services, user, userServicePrice } from "@/core/db/schema";
import type { ActionResponse } from "@/shared/lib/server-actions";
import { cascadeCostPrices } from "./cascade-cost-prices";

const updatePricesSchema = z.object({
  serviceId: z.string().min(1, "Serviço é obrigatório"),
  targetUserIds: z.array(z.string()).min(1, "Selecione pelo menos um usuário"),
  newCostPrice: z.number().positive("Preço deve ser positivo"),
});

export type UpdateIndicatedUserPricesInput = z.infer<typeof updatePricesSchema>;

export async function updateIndicatedUserPrices(
  input: UpdateIndicatedUserPricesInput,
): Promise<ActionResponse<void>> {
  try {
    const session = await verifySession();

    // Validar input
    const validation = updatePricesSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0].message,
      };
    }

    const { serviceId, targetUserIds, newCostPrice } = validation.data;

    // Buscar o usuário atual
    const currentUser = await db.query.user.findFirst({
      where: eq(user.id, session.userId),
    });

    if (!currentUser) {
      return { success: false, error: "Usuário não encontrado" };
    }

    const isAdmin = currentUser.role === "admin";

    // Buscar o serviço
    const service = await db.query.services.findFirst({
      where: eq(services.id, serviceId),
    });

    if (!service) {
      return { success: false, error: "Serviço não encontrado" };
    }

    // Determinar o mínimo permitido para o newCostPrice
    let minimumAllowedPrice = Number(service.basePrice);

    if (!isAdmin) {
      // Se não for admin, o preço mínimo que ele pode configurar para o indicado
      // é o seu próprio preço de custo daquele serviço.
      // E verificar se os targetUsers são realmente indicados dele.

      const targetUsers = await db.query.user.findMany({
        where: inArray(user.id, targetUserIds),
      });

      for (const tUser of targetUsers) {
        if (tUser.referredBy !== currentUser.referralCode) {
          return {
            success: false,
            error: `O usuário ${tUser.name} não é seu indicado direto.`,
          };
        }
      }

      // Buscar o preço de custo do referenciador
      const referrerPriceConfig = await db.query.userServicePrice.findFirst({
        where: (table, { and, eq }) =>
          and(eq(table.userId, currentUser.id), eq(table.serviceId, serviceId)),
      });

      if (referrerPriceConfig) {
        minimumAllowedPrice = Number(referrerPriceConfig.costPrice);
      }
    }

    if (newCostPrice < minimumAllowedPrice) {
      return {
        success: false,
        error: `O valor não pode ser menor que R$ ${minimumAllowedPrice.toFixed(2)}`,
      };
    }

    // Atualizar ou inserir para cada targetUserId
    for (const targetId of targetUserIds) {
      const existingPrice = await db.query.userServicePrice.findFirst({
        where: (table, { and, eq }) =>
          and(eq(table.userId, targetId), eq(table.serviceId, serviceId)),
      });

      if (existingPrice) {
        const updateData: { costPrice: string; resalePrice?: string } = {
          costPrice: newCostPrice.toFixed(2),
        };

        const currentResale = existingPrice.resalePrice
          ? Number(existingPrice.resalePrice)
          : 0;
        if (currentResale < newCostPrice) {
          updateData.resalePrice = newCostPrice.toFixed(2);
        }

        await db
          .update(userServicePrice)
          .set(updateData)
          .where(eq(userServicePrice.id, existingPrice.id));
      } else {
        await db.insert(userServicePrice).values({
          userId: targetId,
          serviceId,
          costPrice: newCostPrice.toFixed(2),
          resalePrice: newCostPrice.toFixed(2),
        });
      }

      // Propaga atualizações para os indicados desse usuário se o preço subir
      cascadeCostPrices(targetId, serviceId, newCostPrice).catch((e) =>
        console.error("Erro ao propagar atualização", e),
      );
    }

    revalidatePath("/indicacoes");
    revalidatePath("/servicos");
    revalidatePath(`/gerenciar-servicos/${serviceId}`);

    return { success: true };
  } catch (error) {
    console.error("[Services] Error updating user prices:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao atualizar preços",
    };
  }
}
