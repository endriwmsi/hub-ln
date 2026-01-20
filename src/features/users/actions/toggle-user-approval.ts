"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/core/auth/dal";
import { db } from "@/core/db";
import { user } from "@/core/db/schema";

export async function toggleUserApproval(userId: string, approved: boolean) {
  try {
    // Verifica se o usuário é admin
    await requireAdmin();

    // Atualiza o status de aprovação
    await db
      .update(user)
      .set({
        approved,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));

    revalidatePath("/usuarios");

    return {
      success: true,
      message: approved
        ? "Usuário aprovado com sucesso"
        : "Aprovação do usuário removida",
    };
  } catch (error) {
    console.error("Erro ao atualizar aprovação do usuário:", error);
    return {
      success: false,
      message: "Erro ao atualizar aprovação do usuário",
    };
  }
}
