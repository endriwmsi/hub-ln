"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/core/auth/dal";
import { db } from "@/core/db";
import { acao } from "@/core/db/schema";
import {
  orgaoLabels,
  statusOrgaoLabels,
  type UpdateAcaoStatusInput,
  updateAcaoStatusSchema,
} from "../schemas";

export async function updateAcaoStatus(input: UpdateAcaoStatusInput) {
  try {
    // Verifica se o usuário é admin
    await requireAdmin();

    // Valida os dados de entrada
    const validated = updateAcaoStatusSchema.parse(input);

    const { id, field, value } = validated;

    // Atualiza o status específico
    const [acaoAtualizada] = await db
      .update(acao)
      .set({
        [field]: value,
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
      message: `Status de ${orgaoLabels[field]} alterado para "${statusOrgaoLabels[value]}"`,
    };
  } catch (error) {
    console.error("Erro ao atualizar status da ação:", error);
    return {
      success: false,
      error: "Erro ao atualizar status da ação",
    };
  }
}

export type UpdateAcaoStatusResponse = Awaited<
  ReturnType<typeof updateAcaoStatus>
>;
