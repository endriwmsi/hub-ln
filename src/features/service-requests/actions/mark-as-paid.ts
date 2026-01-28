"use server";

import { inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import { serviceRequest } from "@/core/db/schema";
import type { ActionResponse } from "@/shared/lib/server-actions";

type MarkAsPaidResult = {
  updated: number;
};

export async function markServiceRequestsAsPaid(
  ids: string[],
): Promise<ActionResponse<MarkAsPaidResult>> {
  try {
    const session = await verifySession();

    if (!ids.length) {
      return { success: false, error: "Nenhum envio selecionado" };
    }

    // Buscar os registros para verificar se pertencem ao usuário
    const existingRequests = await db
      .select()
      .from(serviceRequest)
      .where(inArray(serviceRequest.id, ids));

    if (existingRequests.length === 0) {
      return { success: false, error: "Nenhuma solicitação encontrada" };
    }

    // Verificar se todos os registros pertencem ao usuário (se não for admin)
    const isAdmin = session.user.role === "admin";
    if (!isAdmin) {
      const notOwned = existingRequests.filter(
        (r) => r.userId !== session.userId,
      );
      if (notOwned.length > 0) {
        return {
          success: false,
          error: "Você não tem permissão para marcar essas solicitações",
        };
      }
    }

    // Filtrar apenas os que ainda não estão pagos
    const unpaidIds = existingRequests.filter((r) => !r.paid).map((r) => r.id);

    if (unpaidIds.length === 0) {
      return {
        success: false,
        error: "Todos os envios selecionados já estão pagos",
      };
    }

    // Atualizar os registros
    await db
      .update(serviceRequest)
      .set({
        paid: true,
        paidAt: new Date(),
      })
      .where(inArray(serviceRequest.id, unpaidIds));

    revalidatePath("/envios");
    revalidatePath("/configuracoes/solicitacoes");

    return {
      success: true,
      data: {
        updated: unpaidIds.length,
      },
    };
  } catch (error) {
    console.error("Erro ao marcar como pago:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Erro ao marcar como pago" };
  }
}
