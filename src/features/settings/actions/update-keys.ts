"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import { user } from "@/core/db/schema";
import type { UpdatePixKeyInput } from "../schemas";
import { updatePixKeySchema } from "../schemas";

export async function updatePixKey(data: UpdatePixKeyInput) {
  try {
    const { userId } = await verifySession();

    const validated = updatePixKeySchema.parse(data);

    await db
      .update(user)
      .set({
        pixKey: validated.key,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));

    revalidatePath("/configuracoes/integracoes", "page");

    return {
      success: true,
      message: "Chave atualizada com sucesso",
    };
  } catch (error) {
    console.error("Erro ao atualizar chave:", error);
    return {
      success: false,
      message: "Erro ao atualizar chave",
    };
  }
}
