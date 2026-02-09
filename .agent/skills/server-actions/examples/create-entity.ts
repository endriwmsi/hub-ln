"use server";

import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import { entities } from "../db/schema";
import { createEntitySchema } from "../schemas";
import { revalidatePath } from "next/cache";

export async function createEntity(input: unknown) {
  // 1. Verificar autenticação
  const { userId } = await verifySession();

  // 2. Validar input com Zod
  const validatedData = createEntitySchema.parse(input);

  // 3. Inserir no banco
  const [entity] = await db
    .insert(entities)
    .values({
      ...validatedData,
      createdById: userId,
    })
    .returning();

  // 4. Revalidar cache da página
  revalidatePath("/entities");

  // 5. Retornar resultado
  return { success: true, data: entity };
}
