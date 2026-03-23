"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/core/auth/dal";
import { db } from "@/core/db";
import { serviceRequest } from "@/core/db/schema";
import type { ActionResponse } from "@/shared/lib/server-actions";

type DeleteItemInput = {
  requestId: string;
  itemIndex: number;
};

export async function deleteAcaoItem(
  input: DeleteItemInput,
): Promise<ActionResponse<{ deleted: boolean }>> {
  try {
    await requireAdmin();

    const { requestId, itemIndex } = input;

    const requestData = await db
      .select({
        id: serviceRequest.id,
        formData: serviceRequest.formData,
        itemsStatus: serviceRequest.itemsStatus,
        quantity: serviceRequest.quantity,
        totalPrice: serviceRequest.totalPrice,
        paid: serviceRequest.paid,
        acaoId: serviceRequest.acaoId,
        unitPrice: serviceRequest.totalPrice,
      })
      .from(serviceRequest)
      .where(eq(serviceRequest.id, requestId))
      .limit(1);

    if (!requestData[0]) {
      return { success: false, error: "Solicitação não encontrada" };
    }

    const request = requestData[0];
    const formData = request.formData as Record<string, unknown>;
    const isBulkUpload = formData?.uploadType === "bulk";

    if (request.paid) {
      return {
        success: false,
        error: "Não é possível excluir itens de solicitações já pagas",
      };
    }

    if (isBulkUpload) {
      const items =
        (formData?.items as Array<{ nome: string; documento: string }>) || [];
      const currentItemsStatus = (request.itemsStatus || []) as Array<{
        nome: string;
        documento: string;
        status: "aguardando" | "baixas_completas" | "baixas_negadas";
        observacao?: string;
        processedAt?: string;
        extracted?: boolean;
        extractedAt?: string;
      }>;

      if (itemIndex < 0 || itemIndex >= items.length) {
        return { success: false, error: "Índice do item inválido" };
      }

      const itemsToKeep = items.filter((_, i) => i !== itemIndex);
      const itemsStatusToKeep = currentItemsStatus.filter(
        (_, i) => i !== itemIndex,
      );

      if (itemsToKeep.length === 0) {
        await db.delete(serviceRequest).where(eq(serviceRequest.id, requestId));
      } else {
        const unitPrice = Number(request.totalPrice) / request.quantity;
        const newQuantity = itemsToKeep.length;
        const newTotalPrice = unitPrice * newQuantity;

        await db
          .update(serviceRequest)
          .set({
            formData: { ...formData, items: itemsToKeep },
            itemsStatus: itemsStatusToKeep,
            quantity: newQuantity,
            totalPrice: newTotalPrice.toFixed(2),
          })
          .where(eq(serviceRequest.id, requestId));
      }
    } else {
      await db.delete(serviceRequest).where(eq(serviceRequest.id, requestId));
    }

    revalidatePath("/envios");
    revalidatePath("/gerenciar-acoes");
    if (request.acaoId) {
      revalidatePath(`/gerenciar-acoes/${request.acaoId}`);
    }

    return { success: true, data: { deleted: true } };
  } catch (error) {
    console.error("[DeleteItem] Error deleting item:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao excluir item",
    };
  }
}
