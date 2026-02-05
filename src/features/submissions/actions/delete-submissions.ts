"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import { serviceRequest } from "@/core/db/schema";
import type { ActionResponse } from "@/shared/lib/server-actions";

type DeleteSubmissionsResult = {
  deleted: number;
};

export async function deleteSubmissions(
  ids: string[],
): Promise<ActionResponse<DeleteSubmissionsResult>> {
  try {
    const session = await verifySession();

    if (!ids.length) {
      return {
        success: false,
        error: "Nenhum envio selecionado para exclusão",
      };
    }

    // Buscar submissions para verificar se pertencem ao usuário e se não foram pagas
    const submissions = await db
      .select({
        id: serviceRequest.id,
        paid: serviceRequest.paid,
        userId: serviceRequest.userId,
      })
      .from(serviceRequest)
      .where(inArray(serviceRequest.id, ids));

    // Verificar se todas as submissions pertencem ao usuário (a menos que seja admin)
    const isAdmin = session.user.role === "admin";
    const unauthorized = submissions.filter(
      (s) => !isAdmin && s.userId !== session.userId,
    );

    if (unauthorized.length > 0) {
      return {
        success: false,
        error: "Você não tem permissão para excluir alguns desses envios",
      };
    }

    // Verificar se algum envio já foi pago
    const paidSubmissions = submissions.filter((s) => s.paid);
    if (paidSubmissions.length > 0) {
      return {
        success: false,
        error: `${paidSubmissions.length} envio(s) já foi/foram pago(s) e não pode(m) ser excluído(s)`,
      };
    }

    // Deletar apenas os envios não pagos que pertencem ao usuário
    const idsToDelete = submissions.map((s) => s.id);

    await db
      .delete(serviceRequest)
      .where(
        and(
          inArray(serviceRequest.id, idsToDelete),
          eq(serviceRequest.paid, false),
        ),
      );

    revalidatePath("/envios");

    return {
      success: true,
      data: {
        deleted: idsToDelete.length,
      },
    };
  } catch (error) {
    console.error("[Submissions] Error deleting submissions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao excluir envios",
    };
  }
}
