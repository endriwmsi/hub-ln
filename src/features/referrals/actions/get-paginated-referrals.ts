"use server";

import { and, count, eq, ilike, inArray, or, type SQL, sql } from "drizzle-orm";
import { getUser } from "@/core/auth/dal";
import { db } from "@/core/db";
import { user, userServicePrice } from "@/core/db/schema";

export interface PaginatedReferralsFilter {
  page: number;
  pageSize: number;
  search?: string;
}

export async function getPaginatedReferrals({
  page,
  pageSize,
  search,
}: PaginatedReferralsFilter) {
  try {
    const currentUser = await getUser();
    if (!currentUser) {
      return { success: false, error: "Não autenticado" };
    }

    const isAdmin = currentUser.role === "admin";
    const offset = (page - 1) * pageSize;

    // Condição base: Admin vê todos exceto a si próprio (ou até a si se preferir, mas vamos excluir o próprio admin pra ficar limpo?
    // Na verdade, admin pode ver ele próprio se tiver na lista global).
    // O usuário normal vê apenas quem foi indicado por ele.
    let baseWhere: SQL<unknown> | undefined;
    if (!isAdmin) {
      if (!currentUser.referralCode) {
        // Se o usuário sequer tem um código de indicação, ele não indicou ninguem.
        return { success: true, data: [], total: 0, totalPages: 0 };
      }
      baseWhere = eq(user.referredBy, currentUser.referralCode);
    }

    // Condição de Busca (Search)
    let searchCondition: SQL<unknown> | undefined;
    if (search && search.trim() !== "") {
      const qs = `%${search.trim()}%`;
      searchCondition = or(
        ilike(user.name, qs),
        ilike(user.email, qs),
        ilike(user.referralCode, qs),
      );
    }

    // Combinar condições
    const finalWhere =
      baseWhere && searchCondition
        ? and(baseWhere, searchCondition)
        : baseWhere || searchCondition;

    // 1. Contar o total de registros (para paginação)
    const totalQuery = await db
      .select({ count: count() })
      .from(user)
      .where(finalWhere);

    const totalItems = totalQuery[0]?.count || 0;

    // 2. Buscar os registros da página
    const usersData = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        createdAt: user.createdAt,
        approved: user.approved,
      })
      .from(user)
      .where(finalWhere)
      .limit(pageSize)
      .offset(offset)
      .orderBy(user.createdAt);

    if (usersData.length === 0) {
      return {
        success: true,
        data: [],
        total: totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      };
    }

    // 3. Contar quantos indicados indiretos cada usuário listado tem.
    // Para simplificar, faremos uma query secundária pra cada usuário listado buscando `count(user.id) where referredBy in (usadosDaPagina)`.
    const referralCodes = usersData
      .map((u) => u.referralCode)
      .filter(Boolean) as string[];

    const childrenCountsByCode = new Map<string, number>();

    if (referralCodes.length > 0) {
      // Usar query com group by para contar filhos de todos os processados.
      const childrenCounts = await db
        .select({
          referredBy: user.referredBy,
          count: sql<number>`cast(count(${user.id}) as integer)`,
        })
        .from(user)
        .where(inArray(user.referredBy, referralCodes))
        .groupBy(user.referredBy);

      for (const row of childrenCounts) {
        if (row.referredBy) {
          childrenCountsByCode.set(row.referredBy, row.count);
        }
      }
    }

    // 4. Resolver o preço de cada serviço para os usuários da página
    const allUsers = await db
      .select({
        id: user.id,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
      })
      .from(user);

    const allServices = await db.query.services.findMany();
    const allPrices = await db.select().from(userServicePrice);

    const pricesMap = new Map<string, string>();
    for (const p of allPrices) {
      pricesMap.set(`${p.userId}:${p.serviceId}`, p.costPrice.toString());
    }

    const usersByReferralCode = new Map(
      allUsers.map((u) => [u.referralCode, u]),
    );

    const resolveCostPrice = (
      userId: string,
      serviceId: string,
      basePrice: string,
      visited = new Set<string>(),
    ): string => {
      if (visited.has(userId)) return basePrice;
      visited.add(userId);

      const customPrice = pricesMap.get(`${userId}:${serviceId}`);
      if (customPrice) return customPrice;

      const userNode = allUsers.find((u) => u.id === userId);
      if (userNode?.referredBy) {
        const referrer = usersByReferralCode.get(userNode.referredBy);
        if (referrer) {
          return resolveCostPrice(referrer.id, serviceId, basePrice, visited);
        }
      }

      return basePrice;
    };

    // Mapper final com o count anexado e prices mapeados.
    const mappedData = usersData.map((u) => {
      const prices: Record<string, string> = {};
      for (const svc of allServices) {
        prices[svc.id] = resolveCostPrice(
          u.id,
          svc.id,
          svc.basePrice.toString(),
        );
      }
      return {
        ...u,
        childrenCount: u.referralCode
          ? childrenCountsByCode.get(u.referralCode) || 0
          : 0,
        prices,
      };
    });

    return {
      success: true,
      data: mappedData,
      total: totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
    };
  } catch (error) {
    console.error("Erro ao buscar indicações paginadas:", error);
    return { success: false, error: "Erro interno do servidor" };
  }
}
