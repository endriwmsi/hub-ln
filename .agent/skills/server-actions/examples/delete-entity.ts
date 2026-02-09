"use server";

import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import { entities } from "../db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function deleteEntity(id: string) {
  // 1. Verificar autenticação
  const { userId } = await verifySession();

  // 2. Verificar se existe e ownership
  const existing = await db.query.entities.findFirst({
    where: eq(entities.id, id),
  });

  if (!existing) {
    return { success: false, error: "Entidade não encontrada" };
  }

  if (existing.createdById !== userId) {
    return { success: false, error: "Sem permissão para deletar" };
  }

  // 3. Deletar do banco
  await db.delete(entities).where(eq(entities.id, id));

  // 4. Revalidar cache
  revalidatePath("/entities");

  return { success: true };
}
