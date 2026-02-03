"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/core/auth/dal";
import { db } from "@/core/db";
import { serviceRequest } from "@/core/db/schema";
import type { ActionResponse } from "@/shared/lib/server-actions";

type ItemIdentifier = {
  requestId: string;
  itemIndex: number;
};

type BulkStatusUpdate = {
  items: ItemIdentifier[];
  status: "aguardando" | "baixas_completas" | "baixas_negadas";
  observacao?: string;
};

type ItemStatus = {
  nome: string;
  documento: string;
  status: "aguardando" | "baixas_completas" | "baixas_negadas";
  observacao?: string;
  processedAt?: string;
};

/**
 * Inicializa ou retorna o array de itemsStatus baseado no formData
 */
function getOrInitializeItemsStatus(
  formData: Record<string, unknown>,
  existingItemsStatus: ItemStatus[] | null,
): ItemStatus[] {
  const isBulkUpload = formData?.uploadType === "bulk";

  if (isBulkUpload) {
    const items =
      (formData?.items as Array<{ nome: string; documento: string }>) || [];

    // Se itemsStatus já existe e tem o mesmo tamanho, usar ele
    if (existingItemsStatus && existingItemsStatus.length === items.length) {
      return existingItemsStatus;
    }

    // Inicializar itemsStatus baseado nos items do formData
    return items.map((item, index) => ({
      nome: item.nome,
      documento: item.documento,
      status: existingItemsStatus?.[index]?.status || "aguardando",
      observacao: existingItemsStatus?.[index]?.observacao,
      processedAt: existingItemsStatus?.[index]?.processedAt,
    }));
  }

  // Envio único
  const nome = (formData?.nome as string) || "";
  const documento = (formData?.documento as string) || "";

  if (existingItemsStatus && existingItemsStatus.length === 1) {
    return existingItemsStatus;
  }

  return [
    {
      nome,
      documento,
      status: existingItemsStatus?.[0]?.status || "aguardando",
      observacao: existingItemsStatus?.[0]?.observacao,
      processedAt: existingItemsStatus?.[0]?.processedAt,
    },
  ];
}

/**
 * Atualiza o status de múltiplos itens de diferentes envios
 * Usado para edição em bulk na página da ação
 */
export async function updateBulkItemsStatus(
  update: BulkStatusUpdate,
): Promise<ActionResponse<{ updated: number }>> {
  try {
    await requireAdmin();

    const { items, status, observacao } = update;

    if (!items.length) {
      return { success: false, error: "Nenhum item selecionado" };
    }

    // Agrupar itens por requestId
    const itemsByRequest = new Map<string, number[]>();
    for (const item of items) {
      const indexes = itemsByRequest.get(item.requestId) || [];
      indexes.push(item.itemIndex);
      itemsByRequest.set(item.requestId, indexes);
    }

    let totalUpdated = 0;

    // Processar cada request
    for (const [requestId, indexes] of itemsByRequest) {
      // Buscar a solicitação
      const requestData = await db
        .select({
          id: serviceRequest.id,
          formData: serviceRequest.formData,
          itemsStatus: serviceRequest.itemsStatus,
          acaoId: serviceRequest.acaoId,
        })
        .from(serviceRequest)
        .where(eq(serviceRequest.id, requestId))
        .limit(1);

      if (!requestData[0]) continue;

      const formData = requestData[0].formData as Record<string, unknown>;
      const existingItemsStatus = requestData[0].itemsStatus as
        | ItemStatus[]
        | null;

      // Inicializar ou obter itemsStatus
      const currentItems = getOrInitializeItemsStatus(
        formData,
        existingItemsStatus,
      );

      // Atualizar os itens específicos
      for (const index of indexes) {
        if (index >= 0 && index < currentItems.length) {
          currentItems[index] = {
            ...currentItems[index],
            status,
            observacao: observacao || currentItems[index].observacao,
            processedAt: new Date().toISOString(),
          };
          totalUpdated++;
        }
      }

      // Salvar no banco
      await db
        .update(serviceRequest)
        .set({ itemsStatus: currentItems })
        .where(eq(serviceRequest.id, requestId));

      // Revalidar páginas
      revalidatePath(`/envios/${requestId}`);
      if (requestData[0].acaoId) {
        revalidatePath(`/gerenciar-acoes/${requestData[0].acaoId}`);
      }
    }

    revalidatePath("/envios");
    revalidatePath("/gerenciar-acoes");

    return {
      success: true,
      data: { updated: totalUpdated },
    };
  } catch (error) {
    console.error("[BulkItems] Error updating items status:", error);
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
 * Atualiza o status de um único item
 */
export async function updateSingleItemStatus(
  requestId: string,
  itemIndex: number,
  status: "aguardando" | "baixas_completas" | "baixas_negadas",
  observacao?: string,
): Promise<ActionResponse<{ updated: boolean }>> {
  try {
    await requireAdmin();

    // Buscar a solicitação
    const requestData = await db
      .select({
        id: serviceRequest.id,
        formData: serviceRequest.formData,
        itemsStatus: serviceRequest.itemsStatus,
        acaoId: serviceRequest.acaoId,
      })
      .from(serviceRequest)
      .where(eq(serviceRequest.id, requestId))
      .limit(1);

    if (!requestData[0]) {
      return { success: false, error: "Solicitação não encontrada" };
    }

    const formData = requestData[0].formData as Record<string, unknown>;
    const existingItemsStatus = requestData[0].itemsStatus as
      | ItemStatus[]
      | null;

    // Inicializar ou obter itemsStatus
    const currentItems = getOrInitializeItemsStatus(
      formData,
      existingItemsStatus,
    );

    if (itemIndex < 0 || itemIndex >= currentItems.length) {
      return { success: false, error: "Índice do item inválido" };
    }

    // Atualizar o item
    currentItems[itemIndex] = {
      ...currentItems[itemIndex],
      status,
      observacao: observacao || currentItems[itemIndex].observacao,
      processedAt: new Date().toISOString(),
    };

    // Salvar no banco
    await db
      .update(serviceRequest)
      .set({ itemsStatus: currentItems })
      .where(eq(serviceRequest.id, requestId));

    // Revalidar páginas
    revalidatePath(`/envios/${requestId}`);
    if (requestData[0].acaoId) {
      revalidatePath(`/gerenciar-acoes/${requestData[0].acaoId}`);
    }

    return {
      success: true,
      data: { updated: true },
    };
  } catch (error) {
    console.error("[SingleItem] Error updating item status:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro ao atualizar status do item",
    };
  }
}
