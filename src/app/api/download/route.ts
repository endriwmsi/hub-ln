import { type NextRequest, NextResponse } from "next/server";
import { getUser } from "@/core/auth/dal";

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Pegar URL da imagem dos query params
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get("url");
    const fileName = searchParams.get("fileName");

    if (!imageUrl) {
      return NextResponse.json(
        { error: "URL da imagem não fornecida" },
        { status: 400 },
      );
    }

    // Fazer fetch da imagem do S3
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error("Erro ao buscar imagem");
    }

    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();

    // Mapear Content-Type para extensão correta
    const contentType = response.headers.get("Content-Type") || blob.type;
    const extensionMap: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
    };

    // Se fileName foi passado, usar ele; caso contrário, gerar baseado no content-type
    let finalFileName = fileName;
    if (finalFileName && contentType) {
      const correctExtension = extensionMap[contentType];
      if (correctExtension) {
        // Substituir extensão pelo Content-Type real
        finalFileName = finalFileName.replace(
          /\.[^.]+$/,
          `.${correctExtension}`,
        );
      }
    }

    // Retornar com headers corretos para forçar download
    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": contentType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${finalFileName || "download"}"`,
        "Content-Length": blob.size.toString(),
      },
    });
  } catch (error) {
    console.error("Erro no download:", error);
    return NextResponse.json(
      { error: "Erro ao fazer download" },
      { status: 500 },
    );
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
