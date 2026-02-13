"use server";

import { desc } from "drizzle-orm";
import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import { creative } from "@/core/db/schema";

export async function listCreatives() {
  await verifySession();

  try {
    const creatives = await db
      .select()
      .from(creative)
      .orderBy(desc(creative.createdAt));

    return { success: true, data: creatives };
  } catch (error) {
    console.error("Erro ao listar criativos:", error);
    return {
      success: false,
      error: "Erro ao carregar criativos",
    };
  }
}
