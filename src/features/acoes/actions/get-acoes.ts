"use server";

import { and, asc, count, desc, eq, ilike, or } from "drizzle-orm";
import { requireAdmin } from "@/core/auth/dal";
import { db } from "@/core/db";
import { acao } from "@/core/db/schema";
import { type AcaoFilters, acaoFiltersSchema } from "../schemas";

export async function getAcoes(filters: AcaoFilters) {
  try {
    // Verifica se o usuário é admin
    await requireAdmin();

    // Valida os filtros
    const validated = acaoFiltersSchema.parse(filters);

    const {
      search,
      visivel,
      permiteEnvios,
      sortBy = "createdAt",
      sortOrder = "desc",
      page,
      pageSize,
    } = validated;

    // Construir condições de filtro
    const conditions = [];

    // Filtro de busca (nome)
    if (search) {
      conditions.push(or(ilike(acao.nome, `%${search}%`)));
    }

    // Filtro de visibilidade
    if (visivel && visivel !== "all") {
      conditions.push(eq(acao.visivel, visivel === "true"));
    }

    // Filtro de permissão de envios
    if (permiteEnvios && permiteEnvios !== "all") {
      conditions.push(eq(acao.permiteEnvios, permiteEnvios === "true"));
    }

    // Construir a query com filtros
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Definir ordem de classificação
    const orderColumn = {
      createdAt: acao.createdAt,
      nome: acao.nome,
      dataInicio: acao.dataInicio,
      dataFim: acao.dataFim,
    }[sortBy];

    const orderDirection = sortOrder === "asc" ? asc : desc;

    // Buscar ações com paginação
    const offset = (page - 1) * pageSize;

    const [acoes, [{ total }]] = await Promise.all([
      db.query.acao.findMany({
        where: whereClause,
        orderBy: orderDirection(orderColumn),
        limit: pageSize,
        offset,
        with: {
          createdBy: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      db.select({ total: count() }).from(acao).where(whereClause),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return {
      success: true,
      data: {
        acoes,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
        },
      },
    };
  } catch (error) {
    console.error("Erro ao buscar ações:", error);
    return {
      success: false,
      error: "Erro ao buscar ações",
    };
  }
}

export type GetAcoesResponse = Awaited<ReturnType<typeof getAcoes>>;
