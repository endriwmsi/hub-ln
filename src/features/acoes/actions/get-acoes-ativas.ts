"use server";

import { and, asc, eq, gte, isNull, lte, or } from "drizzle-orm";
import { db } from "@/core/db";
import { acao } from "@/core/db/schema";

export type AcaoAtiva = {
  id: string;
  nome: string;
  dataInicio: Date | null;
  dataFim: Date | null;
};

/**
 * Busca ações ativas que permitem envios
 * Usado para o usuário selecionar a ação ao fazer um envio
 */
export async function getAcoesAtivas(): Promise<AcaoAtiva[]> {
  const now = new Date();

  const acoes = await db
    .select({
      id: acao.id,
      nome: acao.nome,
      dataInicio: acao.dataInicio,
      dataFim: acao.dataFim,
    })
    .from(acao)
    .where(
      and(
        eq(acao.visivel, true),
        eq(acao.permiteEnvios, true),
        // Data início: null ou <= agora
        or(isNull(acao.dataInicio), lte(acao.dataInicio, now)),
        // Data fim: null ou >= agora
        or(isNull(acao.dataFim), gte(acao.dataFim, now)),
      ),
    )
    .orderBy(asc(acao.nome));

  return acoes;
}
