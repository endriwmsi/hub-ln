"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import { serviceRequest } from "@/core/db/schema";
import type { ActionResponse } from "@/shared/lib/server-actions";

export async function deleteServiceRequest(
  id: string,
): Promise<ActionResponse<{ deleted: boolean }>> {
  try {
    const session = await verifySession();

    // Buscar o registro atual
    const existingRequest = await db
      .select()
      .from(serviceRequest)
      .where(eq(serviceRequest.id, id))
      .limit(1);

    if (!existingRequest[0]) {
      return { success: false, error: "Solicitação não encontrada" };
    }

    // Verificar se o registro pertence ao usuário ou se é admin
    const isOwner = existingRequest[0].userId === session.userId;
    const isAdmin = session.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return {
        success: false,
        error: "Você não tem permissão para excluir esta solicitação",
      };
    }

    // Verificar se o registro está pago e o usuário não é admin
    if (existingRequest[0].paid && !isAdmin) {
      return {
        success: false,
        error: "Não é possível excluir um envio que já foi pago",
      };
    }

    await db.delete(serviceRequest).where(eq(serviceRequest.id, id));

    revalidatePath("/envios");
    revalidatePath("/configuracoes/solicitacoes");

    return { success: true, data: { deleted: true } };
  } catch (error) {
    console.error("Erro ao excluir solicitação:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Erro ao excluir solicitação" };
  }
}
