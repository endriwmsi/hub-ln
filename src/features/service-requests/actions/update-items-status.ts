"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/core/auth/dal";
import { db } from "@/core/db";
import { serviceRequest } from "@/core/db/schema";
import type { ActionResponse } from "@/shared/lib/server-actions";

export type ItemStatusUpdate = {
  index: number;
  status: "aguardando" | "baixas_completas" | "baixas_negadas";
  observacao?: string;
};

/**
 * Atualiza o status de um ou mais itens de um envio em lote
 * Apenas admins podem atualizar o status dos itens
 */
export async function updateItemsStatus(
  requestId: string,
  updates: ItemStatusUpdate[],
): Promise<ActionResponse<{ updated: number }>> {
  try {
    await requireAdmin();

    // Buscar a solicitação
    const requestData = await db
      .select({
        id: serviceRequest.id,
        itemsStatus: serviceRequest.itemsStatus,
      })
      .from(serviceRequest)
      .where(eq(serviceRequest.id, requestId))
      .limit(1);

    if (!requestData[0]) {
      return { success: false, error: "Solicitação não encontrada" };
    }

    const currentItems = (requestData[0].itemsStatus || []) as Array<{
      nome: string;
      documento: string;
      status: "aguardando" | "baixas_completas" | "baixas_negadas";
      observacao?: string;
      processedAt?: string;
    }>;

    if (currentItems.length === 0) {
      return { success: false, error: "Esta solicitação não possui itens" };
    }

    // Aplicar atualizações
    let updatedCount = 0;
    for (const update of updates) {
      if (update.index >= 0 && update.index < currentItems.length) {
        currentItems[update.index] = {
          ...currentItems[update.index],
          status: update.status,
          observacao: update.observacao,
          processedAt: new Date().toISOString(),
        };
        updatedCount++;
      }
    }

    // Salvar no banco
    await db
      .update(serviceRequest)
      .set({
        itemsStatus: currentItems,
      })
      .where(eq(serviceRequest.id, requestId));

    revalidatePath("/envios");
    revalidatePath(`/envios/${requestId}`);
    revalidatePath("/configuracoes/solicitacoes");

    return {
      success: true,
      data: { updated: updatedCount },
    };
  } catch (error) {
    console.error("[Items] Error updating items status:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro ao atualizar status dos itens",
    };
  }
}

/**
 * Atualiza o status de todos os itens de um envio de uma vez
 */
export async function updateAllItemsStatus(
  requestId: string,
  status: "aguardando" | "baixas_completas" | "baixas_negadas",
  observacao?: string,
): Promise<ActionResponse<{ updated: number }>> {
  try {
    await requireAdmin();

    // Buscar a solicitação
    const requestData = await db
      .select({
        id: serviceRequest.id,
        itemsStatus: serviceRequest.itemsStatus,
      })
      .from(serviceRequest)
      .where(eq(serviceRequest.id, requestId))
      .limit(1);

    if (!requestData[0]) {
      return { success: false, error: "Solicitação não encontrada" };
    }

    const currentItems = (requestData[0].itemsStatus || []) as Array<{
      nome: string;
      documento: string;
      status: "aguardando" | "baixas_completas" | "baixas_negadas";
      observacao?: string;
      processedAt?: string;
    }>;

    if (currentItems.length === 0) {
      return { success: false, error: "Esta solicitação não possui itens" };
    }

    // Atualizar todos os itens
    const updatedItems = currentItems.map((item) => ({
      ...item,
      status,
      observacao: observacao || item.observacao,
      processedAt: new Date().toISOString(),
    }));

    // Salvar no banco
    await db
      .update(serviceRequest)
      .set({
        itemsStatus: updatedItems,
      })
      .where(eq(serviceRequest.id, requestId));

    revalidatePath("/envios");
    revalidatePath(`/envios/${requestId}`);
    revalidatePath("/configuracoes/solicitacoes");

    return {
      success: true,
      data: { updated: updatedItems.length },
    };
  } catch (error) {
    console.error("[Items] Error updating all items status:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro ao atualizar status dos itens",
    };
  }
}
