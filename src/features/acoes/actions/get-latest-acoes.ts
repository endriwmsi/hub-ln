"use server";

import { desc } from "drizzle-orm";
import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import { acao } from "@/core/db/schema";

export interface LatestAcao {
  id: string;
  nome: string;
  dataInicio: Date;
  dataFim: Date;
  statusSpc: "aguardando_baixas" | "baixas_iniciadas" | "baixas_completas";
  statusBoaVista: "aguardando_baixas" | "baixas_iniciadas" | "baixas_completas";
  statusSerasa: "aguardando_baixas" | "baixas_iniciadas" | "baixas_completas";
  statusCenprotNacional:
    | "aguardando_baixas"
    | "baixas_iniciadas"
    | "baixas_completas";
  statusCenprotSp:
    | "aguardando_baixas"
    | "baixas_iniciadas"
    | "baixas_completas";
  statusOutros: "aguardando_baixas" | "baixas_iniciadas" | "baixas_completas";
  createdAt: Date;
}

export interface GetLatestAcoesResponse {
  success: boolean;
  data?: LatestAcao[];
  error?: string;
}

/**
 * Busca as últimas 5 ações criadas
 */
export async function getLatestAcoes(
  limit = 5,
): Promise<GetLatestAcoesResponse> {
  try {
    // Verifica se o usuário está autenticado
    await verifySession();

    const acoes = await db.query.acao.findMany({
      columns: {
        id: true,
        nome: true,
        dataInicio: true,
        dataFim: true,
        statusSpc: true,
        statusBoaVista: true,
        statusSerasa: true,
        statusCenprotNacional: true,
        statusCenprotSp: true,
        statusOutros: true,
        createdAt: true,
      },
      orderBy: desc(acao.createdAt),
      limit,
    });

    return {
      success: true,
      data: acoes,
    };
  } catch (error) {
    console.error("Erro ao buscar últimas ações:", error);
    return {
      success: false,
      error: "Erro ao buscar últimas ações",
    };
  }
}
