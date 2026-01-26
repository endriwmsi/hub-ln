"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/core/db";
import { services } from "@/core/db/schema";
import { type UpdateServiceInput, updateServiceSchema } from "../schemas";

export async function updateService(input: UpdateServiceInput) {
  const validated = updateServiceSchema.safeParse(input);

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.flatten().fieldErrors,
    };
  }

  const { id, ...data } = validated.data;

  const [service] = await db
    .update(services)
    .set(data)
    .where(eq(services.id, id))
    .returning();

  if (!service) {
    return { success: false, error: "Serviço não encontrado" };
  }

  revalidatePath("/servicos");
  revalidatePath("/admin/servicos");

  return { success: true, data: service };
}
