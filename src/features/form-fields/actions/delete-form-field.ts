"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/core/db";
import { formField } from "@/core/db/schema";
import type { ActionResponse } from "@/shared/lib/server-actions";

export async function deleteFormField(
  id: string,
): Promise<ActionResponse<{ id: string }>> {
  try {
    const deletedField = await db
      .delete(formField)
      .where(eq(formField.id, id))
      .returning({ id: formField.id });

    if (!deletedField[0]) {
      return { success: false, error: "Campo não encontrado" };
    }

    revalidatePath("/configuracoes/servicos");
    revalidatePath("/servicos");

    return { success: true, data: deletedField[0] };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Erro ao deletar campo" };
  }
}
