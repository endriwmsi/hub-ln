"use server";

import { eq } from "drizzle-orm";
import { requireAdmin } from "@/core/auth/dal";
import { db } from "@/core/db";
import { user } from "@/core/db/schema";

export async function getUserById(userId: string) {
  try {
    await requireAdmin();

    const userData = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!userData) {
      return {
        success: false,
        message: "Usuário não encontrado",
        data: null,
      };
    }

    return {
      success: true,
      data: userData,
    };
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return {
      success: false,
      message: "Erro ao buscar usuário",
      data: null,
    };
  }
}
