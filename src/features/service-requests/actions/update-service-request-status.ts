"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import type { ServiceRequest } from "@/core/db/schema";
import { serviceRequest } from "@/core/db/schema";
import type { ActionResponse } from "@/shared/lib/server-actions";
import {
  type UpdateServiceRequestStatusInput,
  updateServiceRequestStatusSchema,
} from "../schemas";

export async function updateServiceRequestStatus(
  input: UpdateServiceRequestStatusInput,
): Promise<ActionResponse<ServiceRequest>> {
  try {
    const session = await verifySession();
    const validatedInput = updateServiceRequestStatusSchema.parse(input);

    // Buscar o registro atual para verificar se está pago
    const existingRequest = await db
      .select()
      .from(serviceRequest)
      .where(eq(serviceRequest.id, validatedInput.id))
      .limit(1);

    if (!existingRequest[0]) {
      return { success: false, error: "Solicitação não encontrada" };
    }

    // Verificar se o registro está pago e o usuário não é admin
    if (existingRequest[0].paid && session.user.role !== "admin") {
      return {
        success: false,
        error: "Não é possível alterar um envio que já foi pago",
      };
    }

    const updateData: {
      status: typeof validatedInput.status;
      notes?: string;
      processedAt?: Date;
      processedById?: string;
    } = {
      status: validatedInput.status,
    };

    if (validatedInput.notes) {
      updateData.notes = validatedInput.notes;
    }

    // Se o status for concluído ou rejeitado, registrar quem processou
    if (
      validatedInput.status === "completed" ||
      validatedInput.status === "rejected"
    ) {
      updateData.processedAt = new Date();
      updateData.processedById = session.userId;
    }

    const updatedRequest = await db
      .update(serviceRequest)
      .set(updateData)
      .where(eq(serviceRequest.id, validatedInput.id))
      .returning();

    if (!updatedRequest[0]) {
      return { success: false, error: "Solicitação não encontrada" };
    }

    revalidatePath("/envios");
    revalidatePath("/configuracoes/solicitacoes");

    return { success: true, data: updatedRequest[0] };
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Erro ao atualizar status" };
  }
}
