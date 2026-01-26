"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/core/auth/dal";
import { db } from "@/core/db";
import { acao } from "@/core/db/schema";
import { type UpdateAcaoInput, updateAcaoSchema } from "../schemas";

export async function updateAcao(input: UpdateAcaoInput) {
  try {
    // Verifica se o usuário é admin
    await requireAdmin();

    // Valida os dados de entrada
    const validated = updateAcaoSchema.parse(input);

    const { id, ...updateData } = validated;

    // Remove campos undefined
    const cleanedData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined),
    );

    if (Object.keys(cleanedData).length === 0) {
      return {
        success: false,
        error: "Nenhum campo para atualizar",
      };
    }

    // Atualiza a ação
    const [acaoAtualizada] = await db
      .update(acao)
      .set({
        ...cleanedData,
        updatedAt: new Date(),
      })
      .where(eq(acao.id, id))
      .returning();

    if (!acaoAtualizada) {
      return {
        success: false,
        error: "Ação não encontrada",
      };
    }

    revalidatePath("/acoes");

    return {
      success: true,
      data: acaoAtualizada,
      message: "Ação atualizada com sucesso",
    };
  } catch (error) {
    console.error("Erro ao atualizar ação:", error);
    return {
      success: false,
      error: "Erro ao atualizar ação",
    };
  }
}

export type UpdateAcaoResponse = Awaited<ReturnType<typeof updateAcao>>;
