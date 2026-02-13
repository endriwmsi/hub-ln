"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/core/auth/dal";
import { db } from "@/core/db";
import { creative } from "@/core/db/schema/creative.schema";
import { deleteFromS3 } from "@/lib/s3";

export async function deleteCreative(id: string) {
  // Verificar se usuário é admin
  await requireAdmin();

  try {
    // Buscar o criativo para pegar a URL da imagem
    const selectedCreative = await db
      .select()
      .from(creative)
      .where(eq(creative.id, id))
      .limit(1)
      .then((res) => res[0]);

    if (!selectedCreative) {
      return {
        success: false,
        error: "Criativo não encontrado",
      };
    }

    // Deletar do banco
    await db
      .delete(creative)
      .where(eq(creative.id, selectedCreative.id))
      .returning();

    // Deletar do S3
    try {
      await deleteFromS3(selectedCreative.imageUrl);
    } catch (s3Error) {
      console.error("Erro ao deletar do S3:", s3Error);
      // Não falhar a operação se o S3 falhar
    }

    revalidatePath("/criativos");
    revalidatePath("/dashboard/criativos");

    return { success: true, data: selectedCreative };
  } catch (error) {
    console.error("Erro ao deletar criativo:", error);
    return {
      success: false,
      error: "Erro ao deletar criativo",
    };
  }
}
