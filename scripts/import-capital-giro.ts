import "dotenv/config";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { db } from "../src/core/db";
import type {
  PaymentStatus,
  ServiceRequestStatus,
} from "../src/core/db/schema/service-request.schema";
import { serviceRequest } from "../src/core/db/schema/service-request.schema";

/**
 * Script de importação de solicitações de capital de giro para service_request
 *
 * Converte dados de capital_giro.json para o formato de service_request,
 * vinculando ao serviço de Capital de Giro.
 *
 * Uso: pnpm tsx scripts/import-capital-giro.ts
 */

interface CapitalGiroData {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  email: string;
  estado_civil: string;
  cpf: string;
  endereco_pessoa: string;
  cidade_pessoa: string;
  estado_pessoa: string;
  razao_social: string;
  cnpj: string;
  faturamento: string;
  endereco_empresa: string;
  cidade_empresa: string;
  estado_empresa: string;
  tem_restricao: string;
  valor_restricao: string;
  status: string;
  created_at: string;
  updated_at: string;
  is_downloaded: boolean;
  downloaded_at: string | null;
  estado_nascimento: string;
  nome_partner: string;
  documento_url: string | null;
}

interface ImportStats {
  total: number;
  success: number;
  failed: number;
  skipped: number;
  errors: Array<{ id: string; error: string }>;
}

// Constantes
const SERVICE_ID = "019c8116-30d7-7850-b181-2921a33ce29c"; // Capital de Giro

/**
 * Mapeia status antigo para novo enum
 */
function mapStatus(oldStatus: string): ServiceRequestStatus {
  const statusMap: Record<string, ServiceRequestStatus> = {
    pending: "pending",
    analyzing: "processing",
    approved: "completed",
    rejected: "rejected",
    cancelled: "cancelled",
  };
  return statusMap[oldStatus.toLowerCase()] || "pending";
}

/**
 * Mapeia status de pagamento
 */
function mapPaymentStatus(status: string): PaymentStatus {
  // Para capital de giro, assumimos que não há pagamento on-line
  // Status "approved" pode indicar pagamento confirmado posteriormente
  if (status === "approved" || status === "completed") {
    return "confirmed";
  }
  return "pending";
}

/**
 * Extrai nome do arquivo da URL
 */
function extractFileName(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const parts = pathname.split("/");
    const filename = parts[parts.length - 1];
    // Remove o timestamp do início se existir (formato: 1234567890_filename.ext)
    return filename.replace(/^\d+[_-]/, "");
  } catch {
    return "documento.pdf";
  }
}

/**
 * Extrai extensão e determina tipo MIME
 */
function getMimeType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    pdf: "application/pdf",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
  return mimeTypes[ext || ""] || "application/octet-stream";
}

/**
 * Converte documento_url para o formato de array documents
 */
function convertDocumentUrl(
  documentoUrl: string | null,
  createdAt: string,
): Array<{
  url: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
}> {
  if (!documentoUrl) {
    return [];
  }

  const filename = extractFileName(documentoUrl);
  const mimeType = getMimeType(filename);

  return [
    {
      url: documentoUrl,
      name: filename,
      size: 0, // Não temos o tamanho real, então usamos 0
      type: mimeType,
      uploadedAt: new Date(createdAt).toISOString(),
    },
  ];
}

async function importCapitalGiro() {
  console.log("🚀 Iniciando importação de Capital de Giro...\n");

  const stats: ImportStats = {
    total: 0,
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  try {
    // Ler arquivo JSON
    const dataPath = resolve(process.cwd(), "capital_giro.json");

    console.log("📂 Lendo arquivo capital_giro.json...");
    const data: CapitalGiroData[] = JSON.parse(readFileSync(dataPath, "utf-8"));

    console.log(`   ✓ ${data.length} solicitações encontradas\n`);

    stats.total = data.length;

    // Processar solicitações em lotes
    const batchSize = 50;
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);

      console.log(
        `📦 Processando lote ${Math.floor(i / batchSize) + 1} (${i + 1}-${Math.min(i + batchSize, data.length)}/${data.length})...`,
      );

      for (const item of batch) {
        try {
          // Montar formData no formato especificado
          const formData = {
            nome_completo: item.name,
            telefone: item.phone,
            email: item.email,
            estado_civil: item.estado_civil,
            cpf: item.cpf,
            endereco_pf: item.endereco_pessoa,
            estado_pf: item.estado_pessoa,
            razao_social: item.razao_social,
            cnpj: item.cnpj,
            faturamento: item.faturamento,
            endereco_pj: item.endereco_empresa,
            estado_pj: item.estado_empresa,
            restricao: item.tem_restricao,
            valor_restricao: item.valor_restricao || "R$ 0,00",
          };

          // Converter documento_url para formato documents
          const documents = convertDocumentUrl(
            item.documento_url,
            item.created_at,
          );

          // Determinar se foi pago (approved = pago)
          const isPaid = item.status === "approved";

          // Preparar dados para inserção
          const newServiceRequest = {
            id: item.id, // Manter ID original
            userId: item.user_id,
            serviceId: SERVICE_ID,
            acaoId: null, // Capital de giro não está vinculado a ações específicas
            formData: formData,
            documents: documents,
            quantity: 1, // Cada solicitação é 1 item
            totalPrice: "0.00", // Preço será definido posteriormente
            status: mapStatus(item.status),
            notes: item.nome_partner
              ? `Parceiro: ${item.nome_partner}`
              : undefined,
            paid: isPaid,
            paidAt: isPaid ? new Date(item.updated_at) : undefined,
            paymentStatus: mapPaymentStatus(item.status),
            itemsStatus: [], // Capital de giro não usa itemsStatus
            createdAt: new Date(item.created_at),
            updatedAt: new Date(item.updated_at),
          };

          // Inserir no banco
          await db.insert(serviceRequest).values(newServiceRequest);

          stats.success++;
          console.log(
            `   ✓ ${item.id} - ${item.name} (${item.status}) ${documents.length > 0 ? "com documento" : "sem documento"}`,
          );
        } catch (error) {
          stats.failed++;
          const errorMsg =
            error instanceof Error ? error.message : "Erro desconhecido";
          stats.errors.push({
            id: item.id,
            error: errorMsg,
          });
          console.error(`   ✗ Erro ao importar ${item.id}: ${errorMsg}`);
        }
      }

      console.log(""); // Linha em branco entre lotes
    }

    // Relatório final
    console.log("\n📊 RESUMO DA IMPORTAÇÃO");
    console.log("─".repeat(50));
    console.log(`Total de solicitações:    ${stats.total}`);
    console.log(`✓ Importadas com sucesso: ${stats.success}`);
    console.log(`✗ Falhas:                 ${stats.failed}`);
    console.log(`⊘ Ignoradas:              ${stats.skipped}`);
    console.log("─".repeat(50));

    if (stats.errors.length > 0) {
      console.log("\n❌ ERROS ENCONTRADOS:");
      for (const error of stats.errors) {
        console.log(`   • ${error.id}: ${error.error}`);
      }
    }

    console.log("\n✨ Importação concluída!");
    process.exit(0);
  } catch (error) {
    console.error(
      "\n❌ Erro fatal durante a importação:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
}

// Executar importação
importCapitalGiro();
