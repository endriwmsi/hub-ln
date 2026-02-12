"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/core/db";
import { services, user, userServicePrice } from "@/core/db/schema";
import { createNotification } from "@/features/notifications/actions/create-notification";
import { getUserReferrals } from "../lib/get-user-referrals";

/**
 * Invalida em cascata os preços de revenda dos usuários
 * indicados quando o indicador atualiza seu preço.
 *
 * Lógica:
 * - Se novo preço do indicador > preço de revenda do indicado → invalidar e notificar
 * - Se novo preço do indicador ≤ preço de revenda do indicado → apenas atualizar costPrice
 */
export async function invalidateReferralPrices(
  userId: string,
  serviceId: string,
  newResalePrice: number,
): Promise<void> {
  try {
    // Buscar o usuário que atualizou o preço
    const updater = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!updater?.referralCode) {
      return;
    }

    // Buscar todos os usuários indicados por ele (recursivamente)
    const referralIds = await getUserReferrals(updater.referralCode);

    if (referralIds.length === 0) {
      return;
    }

    // Buscar o serviço para exibir nas notificações
    const service = await db.query.services.findFirst({
      where: eq(services.id, serviceId),
    });

    if (!service) {
      return;
    }

    // Processar cada referral
    for (const referralId of referralIds) {
      // Buscar o preço atual do referral para este serviço
      const referralPrice = await db.query.userServicePrice.findFirst({
        where: and(
          eq(userServicePrice.userId, referralId),
          eq(userServicePrice.serviceId, serviceId),
        ),
      });

      // Se o referral não tem preço configurado, não há nada a fazer
      if (!referralPrice) {
        continue;
      }

      const currentResalePrice = Number(referralPrice.resalePrice);

      // Se o preço de revenda do referral é menor que o novo preço, invalidar
      if (currentResalePrice < newResalePrice) {
        // Invalidar o preço (setar resalePrice como null)
        await db
          .update(userServicePrice)
          .set({
            resalePrice: null,
            costPrice: newResalePrice.toFixed(2),
          })
          .where(eq(userServicePrice.id, referralPrice.id));

        // Notificar o usuário sobre a invalidação
        await createNotification({
          userId: referralId,
          type: "system",
          title: "Preço de serviço invalidado",
          message: `O serviço "${service.title}" teve seu preço de custo alterado para R$ ${newResalePrice.toFixed(2)}. Seu preço de revenda de R$ ${currentResalePrice.toFixed(2)} foi invalidado pois está abaixo do novo valor mínimo. Por favor, configure um novo preço.`,
          link: "/servicos",
          relatedId: serviceId,
        });
      } else {
        // Apenas atualizar o costPrice
        await db
          .update(userServicePrice)
          .set({
            costPrice: newResalePrice.toFixed(2),
          })
          .where(eq(userServicePrice.id, referralPrice.id));

        // Notificar o usuário sobre a atualização do costPrice
        await createNotification({
          userId: referralId,
          type: "system",
          title: "Preço de custo atualizado",
          message: `O serviço "${service.title}" teve seu preço de custo alterado para R$ ${newResalePrice.toFixed(2)}. Seu preço de revenda de R$ ${currentResalePrice.toFixed(2)} foi mantido.`,
          link: "/servicos",
          relatedId: serviceId,
        });
      }
    }
  } catch (error) {
    console.error("[Services] Error invalidating referral prices:", error);
    // Não propaga o erro para não bloquear a atualização do preço principal
  }
}
