"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import {
  serviceRequest,
  services,
  user,
  userServicePrice,
} from "@/core/db/schema";
import type { ActionResponse } from "@/shared/lib/server-actions";
import { type BulkUploadInput, bulkUploadSchema } from "../schemas";

type BulkUploadResult = {
  created: number;
  totalPrice: number;
};

export async function createBulkServiceRequests(
  input: BulkUploadInput,
): Promise<ActionResponse<BulkUploadResult>> {
  try {
    const session = await verifySession();
    const validatedInput = bulkUploadSchema.parse(input);

    // Buscar serviço para calcular preço
    const service = await db
      .select()
      .from(services)
      .where(eq(services.id, validatedInput.serviceId))
      .limit(1);

    if (!service[0]) {
      return { success: false, error: "Serviço não encontrado" };
    }

    // Buscar usuário atual para obter o indicador
    const currentUser = await db.query.user.findFirst({
      where: eq(user.id, session.userId),
    });

    // Determinar preço a usar: preço de revenda do usuário > preço do indicador > preço base
    let unitPrice = Number(service[0].basePrice);

    if (currentUser) {
      // Primeiro, tentar buscar preço de revenda do próprio usuário
      const userPrice = await db.query.userServicePrice.findFirst({
        where: and(
          eq(userServicePrice.userId, session.userId),
          eq(userServicePrice.serviceId, validatedInput.serviceId),
        ),
      });

      if (userPrice) {
        // Usuário tem preço de revenda definido
        unitPrice = Number(userPrice.resalePrice);
      } else if (currentUser.referredBy) {
        // Buscar preço do indicador
        const referrer = await db.query.user.findFirst({
          where: eq(user.referralCode, currentUser.referredBy),
        });

        if (referrer) {
          const referrerPrice = await db.query.userServicePrice.findFirst({
            where: and(
              eq(userServicePrice.userId, referrer.id),
              eq(userServicePrice.serviceId, validatedInput.serviceId),
            ),
          });

          if (referrerPrice) {
            unitPrice = Number(referrerPrice.resalePrice);
          }
        }
      }
    }

    const quantity = validatedInput.items.length;
    const totalPrice = unitPrice * quantity;

    // Criar uma solicitação única com todos os itens
    const formData = {
      items: validatedInput.items,
      uploadType: "bulk",
    };

    await db.insert(serviceRequest).values({
      userId: session.userId,
      serviceId: validatedInput.serviceId,
      acaoId: validatedInput.acaoId,
      formData,
      documents: [],
      quantity,
      totalPrice: totalPrice.toFixed(2),
      status: "pending",
    });

    revalidatePath("/envios");
    revalidatePath("/configuracoes/solicitacoes");

    return {
      success: true,
      data: {
        created: quantity,
        totalPrice,
      },
    };
  } catch (error) {
    console.error("Erro ao criar solicitações em lote:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Erro ao criar solicitações em lote" };
  }
}
