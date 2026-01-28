"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import type { ServiceRequest } from "@/core/db/schema";
import { serviceRequest, services } from "@/core/db/schema";
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

    // Calcular preço total (preço base * quantidade)
    const totalPrice =
      Number(service[0].basePrice) * (validatedInput.quantity || 1);

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
