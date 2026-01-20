"use server";

import { and, asc, count, desc, ilike, or, sql } from "drizzle-orm";
import { requireAdmin } from "@/core/auth/dal";
import { db } from "@/core/db";
import { user } from "@/core/db/schema";
import { type UserFilters, userFiltersSchema } from "../schemas";

export async function getUsers(filters: UserFilters) {
  try {
    // Verifica se o usuário é admin
    await requireAdmin();

    // Valida os filtros
    const validated = userFiltersSchema.parse(filters);

    const {
      search,
      role,
      sortBy = "createdAt",
      sortOrder = "desc",
      page,
      pageSize,
    } = validated;

    // Construir condições de filtro
    const conditions = [];

    // Filtro de busca (nome, email, telefone, cpf, cnpj)
    if (search) {
      conditions.push(
        or(
          ilike(user.name, `%${search}%`),
          ilike(user.email, `%${search}%`),
          ilike(user.phone, `%${search}%`),
          ilike(user.cpf, `%${search}%`),
          ilike(user.cnpj, `%${search}%`),
        ),
      );
    }

    // Filtro de role
    if (role && role !== "all") {
      conditions.push(sql`${user.role} = ${role}`);
    }

    // Construir a query com filtros
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Definir ordem de classificação
    const orderColumn = {
      createdAt: user.createdAt,
      name: user.name,
      email: user.email,
    }[sortBy];

    const orderDirection = sortOrder === "asc" ? asc : desc;

    // Buscar usuários com paginação
    const offset = (page - 1) * pageSize;

    const [users, [{ total }]] = await Promise.all([
      db.query.user.findMany({
        where: whereClause,
        orderBy: orderDirection(orderColumn),
        limit: pageSize,
        offset,
      }),
      db.select({ total: count() }).from(user).where(whereClause),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return {
      success: true,
      data: {
        users,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
        },
      },
    };
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return {
      success: false,
      error: "Erro ao buscar usuários",
    };
  }
}

export type GetUsersResponse = Awaited<ReturnType<typeof getUsers>>;
