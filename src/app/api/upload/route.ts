import { type NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

import { getUser } from "@/core/auth/dal";
import { uploadToS3 } from "@/lib/s3";

// Tipos de arquivos permitidos
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const ALLOWED_DOCUMENT_TYPES = [...ALLOWED_IMAGE_TYPES, "application/pdf"];
const ALLOWED_EXCEL_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se é parse de Excel ou upload normal
    const { searchParams } = new URL(request.url);
    const parseExcel = searchParams.get("parse") === "true";

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 },
      );
    }

    // Validar tamanho
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Máximo 10MB" },
        { status: 400 },
      );
    }

    // Se for para parsear Excel
    if (parseExcel) {
      if (!ALLOWED_EXCEL_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: "Formato inválido. Use arquivos Excel (.xlsx, .xls)" },
          { status: 400 },
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const workbook = XLSX.read(buffer, { type: "buffer" });

      // Pegar primeira planilha
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Converter para JSON
      const data = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
      }) as unknown[][];

      // Verificar se tem dados
      if (data.length < 2) {
        return NextResponse.json(
          { error: "Planilha vazia ou sem dados suficientes" },
          { status: 400 },
        );
      }

      // Verificar cabeçalho esperado: Nome, Documento
      const header = data[0] as string[];
      const nomeIdx = header.findIndex((h) =>
        h?.toString().toLowerCase().includes("nome"),
      );
      const docIdx = header.findIndex(
        (h) =>
          h?.toString().toLowerCase().includes("documento") ||
          h?.toString().toLowerCase().includes("cpf") ||
          h?.toString().toLowerCase().includes("cnpj"),
      );

      if (nomeIdx === -1 || docIdx === -1) {
        return NextResponse.json(
          {
            error:
              "Cabeçalho inválido. A planilha deve ter colunas 'Nome' e 'Documento'",
          },
          { status: 400 },
        );
      }

      // Extrair dados (ignorando cabeçalho)
      const items = data
        .slice(1)
        .map((row) => {
          const rowData = row as (string | number | undefined)[];
          return {
            nome: rowData[nomeIdx]?.toString() || "",
            documento: rowData[docIdx]?.toString() || "",
          };
        })
        .filter((item) => item.nome && item.documento);

      if (items.length === 0) {
        return NextResponse.json(
          { error: "Nenhum registro válido encontrado na planilha" },
          { status: 400 },
        );
      }

      // Log para verificar os registros importados
      console.log("========== REGISTROS IMPORTADOS DO EXCEL ==========");
      console.log(`Total de registros: ${items.length}`);
      console.log("Dados:", JSON.stringify(items, null, 2));
      console.log("===================================================");

      return NextResponse.json({
        success: true,
        data: items,
        count: items.length,
      });
    }

    // Upload normal de arquivo
    if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato inválido. Use JPEG, PNG, WebP ou PDF" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const folder = `documents/${user.id}`;

    const url = await uploadToS3({
      file: buffer,
      fileName: file.name,
      contentType: file.type,
      folder,
    });

    return NextResponse.json({
      success: true,
      url,
      name: file.name,
      type: file.type,
      size: file.size,
    });
  } catch (error) {
    console.error("Erro no upload:", error);
    return NextResponse.json(
      { error: "Erro ao processar arquivo" },
      { status: 500 },
    );
  }
}

// Route segment config for App Router
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
