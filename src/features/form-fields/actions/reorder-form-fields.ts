"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/core/db";
import { formField } from "@/core/db/schema";
import type { ActionResponse } from "@/shared/lib/server-actions";
import { type ReorderFieldsInput, reorderFieldsSchema } from "../schemas";

export async function reorderFormFields(
  input: ReorderFieldsInput,
): Promise<ActionResponse<{ success: boolean }>> {
  try {
    const validatedInput = reorderFieldsSchema.parse(input);

    // Atualizar a ordem de cada campo
    await db.transaction(async (tx) => {
      for (const fieldOrder of validatedInput.fieldOrders) {
        await tx
          .update(formField)
          .set({ order: fieldOrder.order })
          .where(eq(formField.id, fieldOrder.id));
      }
    });

    revalidatePath("/configuracoes/servicos");
    revalidatePath("/servicos");

    return { success: true, data: { success: true } };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Erro ao reordenar campos" };
  }
}
