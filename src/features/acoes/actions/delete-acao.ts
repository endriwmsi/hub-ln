"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/core/auth/dal";
import { db } from "@/core/db";
import { acao } from "@/core/db/schema";

export async function deleteAcao(id: string) {
  try {
    // Verifica se o usuário é admin
    await requireAdmin();

    if (!id) {
      return {
        success: false,
        error: "ID é obrigatório",
      };
    }

    // Deleta a ação
    const [acaoDeletada] = await db
      .delete(acao)
      .where(eq(acao.id, id))
      .returning();

    if (!acaoDeletada) {
      return {
        success: false,
        error: "Ação não encontrada",
      };
    }

    revalidatePath("/acoes");

    return {
      success: true,
      message: "Ação excluída com sucesso",
    };
  } catch (error) {
    console.error("Erro ao excluir ação:", error);
    return {
      success: false,
      error: "Erro ao excluir ação",
    };
  }
}

export type DeleteAcaoResponse = Awaited<ReturnType<typeof deleteAcao>>;
