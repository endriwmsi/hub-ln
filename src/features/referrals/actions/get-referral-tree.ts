"use server";

import { eq } from "drizzle-orm";
import { getUser, requireAdmin } from "@/core/auth/dal";
import { db } from "@/core/db";
import { user } from "@/core/db/schema/user.schema";
import type { ReferralNode, ReferralStats } from "../types";

/**
 * Busca a árvore de indicações de um usuário específico
 * Admins podem buscar de qualquer usuário
 * Usuários comuns só podem buscar a própria árvore
 */
export async function getReferralTree(targetUserId?: string) {
  try {
    const currentUser = await getUser();
    if (!currentUser) {
      return { error: "Não autenticado" };
    }

    // Se targetUserId for fornecido, verificar se é admin
    if (targetUserId && targetUserId !== currentUser.id) {
      if (currentUser.role !== "admin") {
        return { error: "Acesso negado" };
      }
    }

    // Usar o userId do target ou do usuário atual
    const userId = targetUserId || currentUser.id;

    // Buscar o usuário alvo
    const targetUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
      columns: {
        id: true,
        name: true,
        email: true,
        referralCode: true,
        referredBy: true,
        createdAt: true,
        approved: true,
      },
    });

    if (!targetUser) {
      return { error: "Usuário não encontrado" };
    }

    // Buscar todos os usuários para construir a árvore
    const allUsers = await db.query.user.findMany({
      columns: {
        id: true,
        name: true,
        email: true,
        referralCode: true,
        referredBy: true,
        createdAt: true,
        approved: true,
      },
    });

    // Construir a árvore recursivamente
    const buildTree = (currentCode: string, depth = 0): ReferralNode | null => {
      const currentUser = allUsers.find((u) => u.referralCode === currentCode);
      if (!currentUser || depth > 10) return null; // Limite de profundidade para evitar loops

      const children = allUsers
        .filter((u) => u.referredBy === currentCode)
        .map((u) => buildTree(u.referralCode, depth + 1))
        .filter((node): node is ReferralNode => node !== null);

      return {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        referralCode: currentUser.referralCode,
        referredBy: currentUser.referredBy,
        createdAt: currentUser.createdAt,
        approved: currentUser.approved,
        children,
      };
    };

    const tree = buildTree(targetUser.referralCode);

    if (!tree) {
      return { error: "Erro ao construir árvore" };
    }

    // Calcular estatísticas
    const calculateStats = (
      node: ReferralNode,
      isRoot = true,
    ): ReferralStats => {
      const directReferrals = node.children.length;

      let indirectReferrals = 0;
      let approvedReferrals = node.children.filter((c) => c.approved).length;

      for (const child of node.children) {
        const childStats = calculateStats(child, false);
        indirectReferrals += childStats.totalReferrals;
        approvedReferrals += childStats.approvedReferrals;
      }

      const totalReferrals = directReferrals + indirectReferrals;

      return {
        totalReferrals,
        directReferrals,
        indirectReferrals,
        approvedReferrals: isRoot ? approvedReferrals : 0,
      };
    };

    const stats = calculateStats(tree);

    return {
      data: {
        tree,
        stats,
        referralCode: targetUser.referralCode,
        referralLink: `${process.env.NEXT_PUBLIC_APP_URL}/register?ref=${targetUser.referralCode}`,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar árvore de indicações:", error);
    return { error: "Erro ao buscar árvore de indicações" };
  }
}

/**
 * Busca lista de todos os usuários (apenas para admins)
 * Para o seletor de usuário
 */
export async function getAllUsersForAdmin() {
  try {
    await requireAdmin();

    const users = await db.query.user.findMany({
      columns: {
        id: true,
        name: true,
        email: true,
        referralCode: true,
      },
      orderBy: (user, { asc }) => [asc(user.name)],
    });

    return { data: users };
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return { error: "Erro ao buscar usuários" };
  }
}
