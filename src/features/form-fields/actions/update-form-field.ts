"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/core/db";
import type { FormField } from "@/core/db/schema";
import { formField } from "@/core/db/schema";
import type { ActionResponse } from "@/shared/lib/server-actions";
import { type UpdateFormFieldInput, updateFormFieldSchema } from "../schemas";

export async function updateFormField(
  input: UpdateFormFieldInput,
): Promise<ActionResponse<FormField>> {
  try {
    const validatedInput = updateFormFieldSchema.parse(input);
    const { id, ...updateData } = validatedInput;

    // Remover campos undefined
    const cleanData = Object.fromEntries(
      Object.entries(updateData).filter(([, v]) => v !== undefined),
    );

    const updatedField = await db
      .update(formField)
      .set(cleanData)
      .where(eq(formField.id, id))
      .returning();

    if (!updatedField[0]) {
      return { success: false, error: "Campo não encontrado" };
    }

    revalidatePath("/configuracoes/servicos");
    revalidatePath("/servicos");

    return { success: true, data: updatedField[0] };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Erro ao atualizar campo" };
  }
}
