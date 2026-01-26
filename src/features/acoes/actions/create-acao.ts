"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/core/auth/dal";
import { db } from "@/core/db";
import { acao } from "@/core/db/schema";
import { type CreateAcaoInput, createAcaoSchema } from "../schemas";

export async function createAcao(input: CreateAcaoInput) {
  try {
    // Verifica se o usuário é admin
    const user = await requireAdmin();

    // Valida os dados de entrada
    const validated = createAcaoSchema.parse(input);

    // Cria a nova ação
    const [novaAcao] = await db
      .insert(acao)
      .values({
        nome: validated.nome,
        dataInicio: validated.dataInicio,
        dataFim: validated.dataFim,
        statusSpc: validated.statusSpc,
        statusBoaVista: validated.statusBoaVista,
        statusSerasa: validated.statusSerasa,
        statusCenprotNacional: validated.statusCenprotNacional,
        statusCenprotSp: validated.statusCenprotSp,
        statusOutros: validated.statusOutros,
        visivel: validated.visivel,
        permiteEnvios: validated.permiteEnvios,
        createdById: user.id,
      })
      .returning();

    revalidatePath("/acoes");

    return {
      success: true,
      data: novaAcao,
      message: "Ação criada com sucesso",
    };
  } catch (error) {
    console.error("Erro ao criar ação:", error);

    if (error instanceof Error && error.message.includes("refine")) {
      return {
        success: false,
        error: "Data de fim deve ser maior ou igual à data de início",
      };
    }

    return {
      success: false,
      error: "Erro ao criar ação",
    };
  }
}

export type CreateAcaoResponse = Awaited<ReturnType<typeof createAcao>>;
