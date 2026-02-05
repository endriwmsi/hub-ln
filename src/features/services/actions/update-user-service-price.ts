"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import type { UserServicePrice } from "@/core/db/schema";
import { services, user, userServicePrice } from "@/core/db/schema";
import type { ActionResponse } from "@/shared/lib/server-actions";

// Schema de validação
const updatePriceSchema = z.object({
  serviceId: z.string().min(1, "Serviço é obrigatório"),
  resalePrice: z.number().positive("Preço deve ser positivo"),
});

export type UpdateUserServicePriceInput = z.infer<typeof updatePriceSchema>;

/**
 * Atualiza ou cria o preço de revenda do usuário para um serviço.
 *
 * Validações:
 * 1. O preço de revenda deve ser >= costPrice (preço do indicador)
 * 2. Atualiza ou insere na tabela userServicePrice
 */
export async function updateUserServicePrice(
  input: UpdateUserServicePriceInput,
): Promise<ActionResponse<UserServicePrice>> {
  try {
    const session = await verifySession();

    // Validar input
    const validation = updatePriceSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0].message,
      };
    }

    const { serviceId, resalePrice } = validation.data;

    // Buscar o serviço
    const service = await db.query.services.findFirst({
      where: eq(services.id, serviceId),
    });

    if (!service) {
      return {
        success: false,
        error: "Serviço não encontrado",
      };
    }

    // Buscar o usuário atual
    const currentUser = await db.query.user.findFirst({
      where: eq(user.id, session.userId),
    });

    if (!currentUser) {
      return {
        success: false,
        error: "Usuário não encontrado",
      };
    }

    // Determinar o preço de custo (do indicador ou base)
    let costPrice = Number(service.basePrice);

    if (currentUser.referredBy) {
      // Buscar o indicador
      const referrer = await db.query.user.findFirst({
        where: eq(user.referralCode, currentUser.referredBy),
      });

      if (referrer) {
        // Buscar preço de revenda do indicador
        const referrerPrice = await db.query.userServicePrice.findFirst({
          where: and(
            eq(userServicePrice.userId, referrer.id),
            eq(userServicePrice.serviceId, serviceId),
          ),
        });

        if (referrerPrice) {
          costPrice = Number(referrerPrice.resalePrice);
        }
      }
    }

    // Validar que o preço de revenda é >= costPrice
    if (resalePrice < costPrice) {
      return {
        success: false,
        error: `O preço de revenda deve ser no mínimo R$ ${costPrice.toFixed(2)}`,
      };
    }

    // Verificar se já existe registro
    const existingPrice = await db.query.userServicePrice.findFirst({
      where: and(
        eq(userServicePrice.userId, session.userId),
        eq(userServicePrice.serviceId, serviceId),
      ),
    });

    let result: UserServicePrice;

    if (existingPrice) {
      // Atualizar
      const [updated] = await db
        .update(userServicePrice)
        .set({
          resalePrice: resalePrice.toFixed(2),
          costPrice: costPrice.toFixed(2),
        })
        .where(eq(userServicePrice.id, existingPrice.id))
        .returning();

      result = updated;
    } else {
      // Inserir
      const [inserted] = await db
        .insert(userServicePrice)
        .values({
          userId: session.userId,
          serviceId,
          resalePrice: resalePrice.toFixed(2),
          costPrice: costPrice.toFixed(2),
        })
        .returning();

      result = inserted;
    }

    // Revalidar página de serviços
    revalidatePath("/servicos");

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("[Services] Error updating user service price:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro ao atualizar preço de revenda",
    };
  }
}
