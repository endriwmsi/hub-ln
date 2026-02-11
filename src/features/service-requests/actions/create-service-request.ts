"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import type { ServiceRequest } from "@/core/db/schema";
import {
  serviceRequest,
  services,
  user,
  userServicePrice,
} from "@/core/db/schema";
import type { ActionResponse } from "@/shared/lib/server-actions";
import {
  type CreateServiceRequestInput,
  createServiceRequestSchema,
} from "../schemas";

export async function createServiceRequest(
  input: CreateServiceRequestInput,
): Promise<ActionResponse<ServiceRequest>> {
  try {
    const session = await verifySession();
    const validatedInput = createServiceRequestSchema.parse(input);

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

    // Determinar preço a usar: preço do indicador (costPrice) > preço base
    // O usuário sempre paga o preço do indicador, não o seu próprio resalePrice
    let unitPrice = Number(service[0].basePrice);

    if (currentUser?.referredBy) {
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

    // Calcular preço total
    const totalPrice = unitPrice * (validatedInput.quantity || 1);

    const newRequest = await db
      .insert(serviceRequest)
      .values({
        userId: session.userId,
        serviceId: validatedInput.serviceId,
        acaoId: validatedInput.acaoId,
        formData: validatedInput.formData,
        documents: validatedInput.documents || [],
        quantity: validatedInput.quantity || 1,
        totalPrice: totalPrice.toFixed(2),
        status: "pending",
      })
      .returning();

    revalidatePath("/envios");
    revalidatePath("/configuracoes/solicitacoes");

    return { success: true, data: newRequest[0] };
  } catch (error) {
    console.error("Erro ao criar solicitação:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Erro ao criar solicitação" };
  }
}
