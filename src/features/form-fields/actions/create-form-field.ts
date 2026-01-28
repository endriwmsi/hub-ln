"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/core/db";
import type { FormField } from "@/core/db/schema";
import { formField } from "@/core/db/schema";
import type { ActionResponse } from "@/shared/lib/server-actions";
import { type CreateFormFieldInput, createFormFieldSchema } from "../schemas";

export async function createFormField(
  input: CreateFormFieldInput,
): Promise<ActionResponse<FormField>> {
  try {
    const validatedInput = createFormFieldSchema.parse(input);

    const newField = await db
      .insert(formField)
      .values({
        serviceId: validatedInput.serviceId,
        name: validatedInput.name,
        label: validatedInput.label,
        placeholder: validatedInput.placeholder || null,
        type: validatedInput.type,
        required: validatedInput.required,
        order: validatedInput.order,
        options: validatedInput.options || null,
      })
      .returning();

    revalidatePath("/configuracoes/servicos");
    revalidatePath("/servicos");

    return { success: true, data: newField[0] };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Erro ao criar campo" };
  }
}
