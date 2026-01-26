"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/core/db";
import { services } from "@/core/db/schema";

export async function deleteService(id: string) {
  const [service] = await db
    .delete(services)
    .where(eq(services.id, id))
    .returning();

  if (!service) {
    return { success: false, error: "Serviço não encontrado" };
  }

  revalidatePath("/servicos");
  revalidatePath("/admin/servicos");

  return { success: true };
}
