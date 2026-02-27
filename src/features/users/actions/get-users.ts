"use server";

import { and, asc, desc, ilike, or, sql } from "drizzle-orm";
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
      activeStatus,
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
    // activeStatus será ordenado manualmente depois
    const orderColumn =
      sortBy === "activeStatus"
        ? user.createdAt // fallback, não será usado
        : {
            createdAt: user.createdAt,
            name: user.name,
            email: user.email,
          }[sortBy];

    const orderDirection = sortOrder === "asc" ? asc : desc;

    // Buscar usuários com subscription usando query relational do Drizzle
    // Isso evita N+1 queries e é muito mais eficiente
    const allUsersQuery = await db.query.user.findMany({
      where: whereClause,
      with: {
        subscription: true,
      },
      orderBy: orderDirection(orderColumn),
    });

    // Buscar referrers em uma única query
    const referralCodes = allUsersQuery
      .map((u) => u.referredBy)
      .filter((code): code is string => !!code);

    const referrers =
      referralCodes.length > 0
        ? await db.query.user.findMany({
            where: sql`${user.referralCode} IN (${sql.join(
              referralCodes.map((code) => sql`${code}`),
              sql`, `,
            )})`,
            columns: {
              id: true,
              name: true,
              email: true,
              referralCode: true,
            },
          })
        : [];

    // Criar mapa de referrers para acesso O(1)
    const referrerMap = new Map(referrers.map((r) => [r.referralCode, r]));

    // Combinar dados
    const allUsers = allUsersQuery.map((u) => ({
      ...u,
      referrer: u.referredBy ? referrerMap.get(u.referredBy) || null : null,
    }));

    // Filtrar por status ativo (baseado na subscription)
    let filteredUsers = allUsers;
    if (activeStatus && activeStatus !== "all") {
      filteredUsers = allUsers.filter((u) => {
        const isActive =
          u.subscription?.status === "active" ||
          u.subscription?.status === "trial";
        return activeStatus === "active" ? isActive : !isActive;
      });
    }

    // Ordenar por status ativo se solicitado
    if (sortBy === "activeStatus") {
      filteredUsers.sort((a, b) => {
        const aIsActive =
          a.subscription?.status === "active" ||
          a.subscription?.status === "trial";
        const bIsActive =
          b.subscription?.status === "active" ||
          b.subscription?.status === "trial";

        // desc = inativos primeiro, asc = ativos primeiro
        if (sortOrder === "desc") {
          return aIsActive === bIsActive ? 0 : aIsActive ? 1 : -1;
        } else {
          return aIsActive === bIsActive ? 0 : aIsActive ? -1 : 1;
        }
      });
    }

    // Aplicar paginação
    const total = filteredUsers.length;
    const totalPages = Math.ceil(total / pageSize);
    const offset = (page - 1) * pageSize;
    const users = filteredUsers.slice(offset, offset + pageSize);

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
