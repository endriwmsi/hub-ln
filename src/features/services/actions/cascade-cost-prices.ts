"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/core/db";
import { services, user, userServicePrice } from "@/core/db/schema";
import { createNotification } from "@/features/notifications/actions/create-notification";

/**
 * Propaga a atualização do preço de custo de um usuário para baixo (em cascata)
 * na cadeia de indicações, garantindo que nenhum usuário tenha um preço de custo
 * menor que o de quem o indicou.
 */
export async function cascadeCostPrices(
  changedUserId: string,
  serviceId: string,
  newCostPrice: number,
): Promise<void> {
  try {
    // Buscar o usuário que teve o preço alterado
    const changedUser = await db.query.user.findFirst({
      where: eq(user.id, changedUserId),
    });

    if (!changedUser?.referralCode) {
      return;
    }

    const service = await db.query.services.findFirst({
      where: eq(services.id, serviceId),
    });

    if (!service) return;

    // Fila para processamento em largura (BFS)
    // Array<{ referralCode_of_parent, parent_new_cost }>
    const queue: Array<{ parentCode: string; parentCost: number }> = [
      { parentCode: changedUser.referralCode, parentCost: newCostPrice },
    ];

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) continue;

      // Buscar todos os indicados DIRETOS pelo código atual
      const directReferrals = await db
        .select()
        .from(user)
        .where(eq(user.referredBy, current.parentCode));

      for (const referral of directReferrals) {
        // Obter o preço atual do indicado
        const referralPrice = await db.query.userServicePrice.findFirst({
          where: and(
            eq(userServicePrice.userId, referral.id),
            eq(userServicePrice.serviceId, serviceId),
          ),
        });

        const currentCost = referralPrice ? Number(referralPrice.costPrice) : Number(service.basePrice);

        // Se o custo atual for menor que o custo do pai (que foi atualizado)
        if (currentCost < current.parentCost) {
          if (referralPrice) {
            const updateData: { costPrice: string; resalePrice?: string } = {
              costPrice: current.parentCost.toFixed(2),
            };

            const currentResale = referralPrice.resalePrice
              ? Number(referralPrice.resalePrice)
              : 0;
            if (currentResale < current.parentCost) {
              updateData.resalePrice = current.parentCost.toFixed(2);
            }

            await db
              .update(userServicePrice)
              .set(updateData)
              .where(eq(userServicePrice.id, referralPrice.id));
          } else {
            await db.insert(userServicePrice).values({
              userId: referral.id,
              serviceId,
              costPrice: current.parentCost.toFixed(2),
              resalePrice: current.parentCost.toFixed(2),
            });
          }

          // Notificar o usuário
          await createNotification({
            userId: referral.id,
            type: "system",
            title: "Preço de serviço alterado",
            message: `O seu custo para o serviço "${service.title}" foi ajustado automaticamente para R$ ${current.parentCost.toFixed(2)} devido a uma atualização do seu indicador.`,
            link: "/servicos",
            relatedId: serviceId,
          });

          // Continuar propagando de forma recursiva (se esse indicado tiver os próprios indicados)
          if (referral.referralCode) {
            queue.push({
              parentCode: referral.referralCode,
              parentCost: current.parentCost,
            });
          }
        }
      }
    }
  } catch (error) {
    console.error("[Services] Error cascading cost prices:", error);
  }
}
