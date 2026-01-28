"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/core/db";
import { services } from "@/core/db/schema";
import { type CreateServiceInput, createServiceSchema } from "../schemas";

export async function createService(input: CreateServiceInput) {
  const validated = createServiceSchema.safeParse(input);

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.flatten().fieldErrors,
    };
  }

  const [service] = await db
    .insert(services)
    .values({
      title: validated.data.title,
      slug: validated.data.slug,
      description: validated.data.description,
      basePrice: validated.data.basePrice,
      isActive: validated.data.isActive,
      type: validated.data.type || "simple",
      requiresDocument: validated.data.requiresDocument || false,
    })
    .returning();

  revalidatePath("/servicos");
  revalidatePath("/admin/servicos");
  revalidatePath("/gerenciar-servicos");

  return { success: true, data: service };
}
