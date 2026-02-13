"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/core/auth/dal";
import { db } from "@/core/db";
import { creative } from "@/core/db/schema/creative.schema";
import { createCreativeSchema } from "../schemas";

export async function createCreative(input: unknown) {
  // Verificar se usuário é admin
  await requireAdmin();

  const validated = createCreativeSchema.safeParse(input);

  if (!validated.success) {
    return {
      success: false,
      error: validated.error,
    };
  }

  try {
    const [newCreative] = await db
      .insert(creative)
      .values({
        title: validated.data.title,
        description: validated.data.description,
        imageUrl: validated.data.imageUrl,
        category: validated.data.category,
      })
      .returning();

    revalidatePath("/criativos");
    revalidatePath("/dashboard/criativos");

    return { success: true, data: newCreative };
  } catch (error) {
    console.error("Erro ao criar criativo:", error);
    return {
      success: false,
      error: { _errors: ["Erro ao criar criativo"] },
    };
  }
}
