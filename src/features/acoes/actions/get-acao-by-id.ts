"use server";

import { eq } from "drizzle-orm";
import { requireAdmin } from "@/core/auth/dal";
import { db } from "@/core/db";
import { acao } from "@/core/db/schema";

export async function getAcaoById(id: string) {
  try {
    await requireAdmin();

    if (!id) {
      return {
        success: false,
        error: "ID é obrigatório",
      };
    }

    const acaoEncontrada = await db.query.acao.findFirst({
      where: eq(acao.id, id),
      with: {
        createdBy: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!acaoEncontrada) {
      return {
        success: false,
        error: "Ação não encontrada",
      };
    }

    return {
      success: true,
      data: acaoEncontrada,
    };
  } catch (error) {
    console.error("Erro ao buscar ação:", error);
    return {
      success: false,
      error: "Erro ao buscar ação",
    };
  }
}

export type GetAcaoByIdResponse = Awaited<ReturnType<typeof getAcaoById>>;
