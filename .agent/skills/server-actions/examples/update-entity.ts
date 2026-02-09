"use server";

import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import { entities } from "../db/schema";
import { updateEntitySchema } from "../schemas";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function updateEntity(id: string, input: unknown) {
  // 1. Verificar autenticação
  const { userId } = await verifySession();

  // 2. Validar input
  const validatedData = updateEntitySchema.parse(input);

  // 3. Verificar ownership (opcional)
  const existing = await db.query.entities.findFirst({
    where: eq(entities.id, id),
  });

  if (!existing) {
    return { success: false, error: "Entidade não encontrada" };
  }

  if (existing.createdById !== userId) {
    return { success: false, error: "Sem permissão para editar" };
  }

  // 4. Atualizar no banco
  const [updated] = await db
    .update(entities)
    .set({
      ...validatedData,
      updatedAt: new Date(),
    })
    .where(eq(entities.id, id))
    .returning();

  // 5. Revalidar cache
  revalidatePath("/entities");

  return { success: true, data: updated };
}
