"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import { user } from "@/core/db/schema";
import { deleteFromS3, uploadToS3 } from "@/lib/s3";

export async function uploadAvatar(formData: FormData) {
  try {
    const { userId } = await verifySession();

    const file = formData.get("avatar") as File;
    if (!file) {
      return {
        success: false,
        message: "Nenhum arquivo selecionado",
      };
    }

    // Validar tipo e tamanho
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return {
        success: false,
        message: "Formato inválido. Use JPEG, PNG ou WebP",
      };
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        message: "Arquivo muito grande. Máximo 5MB",
      };
    }

    // Converter arquivo para Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Buscar usuário atual para deletar avatar antigo se existir
    const currentUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    // Upload para S3
    const imageUrl = await uploadToS3({
      file: buffer,
      fileName: file.name,
      contentType: file.type,
      folder: "avatars",
    });

    // Atualizar banco de dados
    await db
      .update(user)
      .set({
        image: imageUrl,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));

    // Deletar avatar antigo se existir e não for URL externa
    if (currentUser?.image && process.env.AWS_S3_BUCKET_NAME) {
      if (currentUser.image.includes(process.env.AWS_S3_BUCKET_NAME)) {
        try {
          await deleteFromS3(currentUser.image);
        } catch (error) {
          console.error("Erro ao deletar avatar antigo:", error);
          // Não falhar a operação se não conseguir deletar o arquivo antigo
        }
      }
    }

    revalidatePath("/", "layout");

    return {
      success: true,
      message: "Avatar atualizado com sucesso",
      imageUrl,
    };
  } catch (error) {
    console.error("Erro ao fazer upload do avatar:", error);
    return {
      success: false,
      message: "Erro ao fazer upload do avatar",
    };
  }
}

export async function deleteAvatar() {
  try {
    const { userId } = await verifySession();

    // Buscar usuário atual
    const currentUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!currentUser?.image) {
      return {
        success: false,
        message: "Nenhum avatar para deletar",
      };
    }

    // Deletar do S3 se for uma URL do bucket
    if (currentUser.image && process.env.AWS_S3_BUCKET_NAME) {
      if (currentUser.image.includes(process.env.AWS_S3_BUCKET_NAME)) {
        await deleteFromS3(currentUser.image);
      }
    }

    // Atualizar banco de dados
    await db
      .update(user)
      .set({
        image: null,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));

    revalidatePath("/", "layout");

    return {
      success: true,
      message: "Avatar removido com sucesso",
    };
  } catch (error) {
    console.error("Erro ao deletar avatar:", error);
    return {
      success: false,
      message: "Erro ao deletar avatar",
    };
  }
}
