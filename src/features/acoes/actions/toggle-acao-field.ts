"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/core/auth/dal";
import { db } from "@/core/db";
import { acao } from "@/core/db/schema";
import { type ToggleAcaoFieldInput, toggleAcaoFieldSchema } from "../schemas";

export async function toggleAcaoField(input: ToggleAcaoFieldInput) {
  try {
    // Verifica se o usuário é admin
    await requireAdmin();

    // Valida os dados de entrada
    const validated = toggleAcaoFieldSchema.parse(input);

    const { id, field, value } = validated;

    // Atualiza o campo específico
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

    const fieldLabels = {
      visivel: "Visibilidade",
      permiteEnvios: "Permissão de envios",
    };

    return {
      success: true,
      data: acaoAtualizada,
      message: `${fieldLabels[field]} ${value ? "ativada" : "desativada"} com sucesso`,
    };
  } catch (error) {
    console.error("Erro ao atualizar campo da ação:", error);
    return {
      success: false,
      error: "Erro ao atualizar campo da ação",
    };
  }
}

export type ToggleAcaoFieldResponse = Awaited<
  ReturnType<typeof toggleAcaoField>
>;
