import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

if (
  !process.env.AWS_REGION ||
  !process.env.AWS_ACCESS_KEY_ID ||
  !process.env.AWS_SECRET_ACCESS_KEY ||
  !process.env.AWS_S3_BUCKET_NAME
) {
  throw new Error("AWS S3 environment variables are not configured");
}

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

export interface UploadOptions {
  file: Buffer;
  fileName: string;
  contentType: string;
  folder?: string;
}

/**
 * Faz upload de um arquivo para o S3
 */
export async function uploadToS3({
  file,
  fileName,
  contentType,
  folder = "uploads",
}: UploadOptions): Promise<string> {
  try {
    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = fileName.split(".").pop();
    const uniqueFileName = `${timestamp}-${randomString}.${extension}`;
    const key = `${folder}/${uniqueFileName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    });

    await s3Client.send(command);

    // Retornar URL pública do arquivo
    const publicUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    return publicUrl;
  } catch (error) {
    console.error("Erro ao fazer upload para S3:", error);
    throw new Error("Falha ao fazer upload da imagem");
  }
}

/**
 * Deleta um arquivo do S3
 */
export async function deleteFromS3(fileUrl: string): Promise<void> {
  try {
    // Extrair a key do URL
    const url = new URL(fileUrl);
    const key = url.pathname.substring(1); // Remove a barra inicial

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error("Erro ao deletar arquivo do S3:", error);
    throw new Error("Falha ao deletar imagem");
  }
}

/**
 * Valida se o arquivo é uma imagem válida
 */
export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Formato inválido. Use JPEG, PNG ou WebP",
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: "Arquivo muito grande. Máximo 5MB",
    };
  }

  return { valid: true };
}
