import "dotenv/config";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { eq } from "drizzle-orm";
import { db } from "../src/core/db";
import { acao } from "../src/core/db/schema/acao.schema";
import { services } from "../src/core/db/schema/service.schema";
import type {
  ItemStatus,
  PaymentStatus,
  ServiceRequestStatus,
} from "../src/core/db/schema/service-request.schema";
import { serviceRequest } from "../src/core/db/schema/service-request.schema";
import { user } from "../src/core/db/schema/user.schema";

/**
 * Script de importação de submissions antigas para service_request
 *
 * Converte dados de submission.json e submission_client.json para o novo formato
 * de service_request, vinculando às ações corretas baseado na data de criação.
 *
 * Uso: pnpm tsx scripts/import-service-requests.ts
 */

interface OldSubmission {
  id: string;
  user_id: string;
  product_id: number;
  title: string;
  total_amount: string;
  unit_price: string;
  quantity: number;
  status: string;
  notes: string | null;
  is_paid: boolean;
  payment_id: string | null;
  payment_status: string | null;
  payment_date: string | null;
  payment_url: string | null;
  qr_code_data: string | null;
  created_at: string;
  updated_at: string;
  coupon_id: string | null;
  is_downloaded: boolean;
  downloaded_at: string | null;
}

interface OldSubmissionClient {
  id: string;
  submission_id: string;
  name: string;
  document: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface ImportStats {
  total: number;
  success: number;
  failed: number;
  skipped: number;
  errors: Array<{ submission: string; error: string }>;
}

// Constantes
const SERVICE_ID = "019c00c8-224d-79ea-a353-9a0c1f171b5d";
const ACAO_ID_ANTES = "019c9a49-b4f8-7fe0-b046-6fc5c8936349"; // Antes de 19/01/2026 23:59:59
const ACAO_ID_DEPOIS = "019c9a4a-45fd-7b58-bbfb-e36b2bd7ed14"; // Depois de 19/01/2026 23:59:59
const DATE_CUTOFF = new Date("2026-01-19T23:59:59.999Z");

/**
 * Mapeia status antigo para novo enum
 */
function mapSubmissionStatus(oldStatus: string): ServiceRequestStatus {
  const statusMap: Record<string, ServiceRequestStatus> = {
    aguardando: "pending",
    processando: "processing",
    concluido: "completed",
    cancelado: "cancelled",
    rejeitado: "rejected",
    pending: "pending",
    processing: "processing",
    completed: "completed",
    cancelled: "cancelled",
    rejected: "rejected",
  };
  return statusMap[oldStatus.toLowerCase()] || "pending";
}

/**
 * Mapeia status de pagamento antigo para novo enum
 */
function mapPaymentStatus(oldStatus: string | null): PaymentStatus {
  if (!oldStatus) return "pending";

  const statusMap: Record<string, PaymentStatus> = {
    RECEIVED: "confirmed",
    PENDING: "pending",
    CONFIRMED: "confirmed",
    OVERDUE: "overdue",
    REFUNDED: "refunded",
    FAILED: "failed",
  };
  return statusMap[oldStatus.toUpperCase()] || "pending";
}

/**
 * Mapeia status do cliente para novo enum
 */
function mapItemStatus(oldStatus: string): ItemStatus {
  const statusMap: Record<string, ItemStatus> = {
    aguardando: "aguardando",
    pending: "aguardando",
    baixas_completas: "baixas_completas",
    completed: "baixas_completas",
    baixas_negadas: "baixas_negadas",
    denied: "baixas_negadas",
  };
  return statusMap[oldStatus.toLowerCase()] || "aguardando";
}

/**
 * Determina qual ação vincular baseado na data de criação
 */
function getAcaoId(createdAt: string): string {
  const createdDate = new Date(createdAt);
  return createdDate <= DATE_CUTOFF ? ACAO_ID_ANTES : ACAO_ID_DEPOIS;
}

async function importServiceRequests() {
  console.log(
    "🚀 Iniciando importação de submissions para service_request...\n",
  );

  const stats: ImportStats = {
    total: 0,
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  try {
    // Ler arquivos JSON
    const submissionsPath = resolve(
      process.cwd(),
      "./scripts/tables/submission.json",
    );
    const clientsPath = resolve(
      process.cwd(),
      "./scripts/tables/submission_client.json",
    );

    console.log("📂 Lendo arquivos JSON...");
    const submissions: OldSubmission[] = JSON.parse(
      readFileSync(submissionsPath, "utf-8"),
    );
    const clients: OldSubmissionClient[] = JSON.parse(
      readFileSync(clientsPath, "utf-8"),
    );

    console.log(`   ✓ ${submissions.length} submissions encontradas`);
    console.log(`   ✓ ${clients.length} clientes encontrados\n`);

    // Agrupar clientes por submission_id
    const clientsBySubmission = new Map<string, OldSubmissionClient[]>();
    for (const client of clients) {
      const existing = clientsBySubmission.get(client.submission_id) || [];
      existing.push(client);
      clientsBySubmission.set(client.submission_id, existing);
    }

    stats.total = submissions.length;

    // Processar submissions em lotes
    const batchSize = 50;
    for (let i = 0; i < submissions.length; i += batchSize) {
      const batch = submissions.slice(i, i + batchSize);

      console.log(
        `📦 Processando lote ${Math.floor(i / batchSize) + 1} (${i + 1}-${Math.min(i + batchSize, submissions.length)}/${submissions.length})...`,
      );

      for (const submission of batch) {
        try {
          // Obter clientes desta submission
          const submissionClients =
            clientsBySubmission.get(submission.id) || [];

          // Determinar ação baseado na data
          const acaoId = getAcaoId(submission.created_at);

          // Criar formData com os items (clientes)
          // Se apenas 1 cliente, usar objeto direto. Se múltiplos, usar array "items"
          const formData =
            submissionClients.length === 1
              ? {
                  nome: submissionClients[0].name,
                  documento: submissionClients[0].document,
                }
              : {
                  items: submissionClients.map((client) => ({
                    nome: client.name,
                    documento: client.document,
                  })),
                  uploadType: "bulk",
                };

          // Montar itemsStatus com status de processamento de cada cliente
          const itemsStatus = submissionClients.map((client) => {
            const item: {
              nome: string;
              status: ItemStatus;
              documento: string;
              processedAt?: string;
            } = {
              nome: client.name,
              status: mapItemStatus(client.status),
              documento: client.document,
            };

            // Adicionar processedAt apenas se foi processado (updated_at diferente de created_at)
            if (client.updated_at !== client.created_at) {
              item.processedAt = new Date(client.updated_at).toISOString();
            }

            return item;
          });

          // Verificar se o registro já existe
          const existingRecord = await db
            .select()
            .from(serviceRequest)
            .where(eq(serviceRequest.id, submission.id))
            .limit(1);

          if (existingRecord.length > 0) {
            stats.skipped++;
            console.log(`   ⊘ ${submission.id} já existe - ignorado`);
            continue;
          }

          // Verificar se user_id existe
          const userExists = await db
            .select()
            .from(user)
            .where(eq(user.id, submission.user_id))
            .limit(1);

          if (userExists.length === 0) {
            throw new Error(`user_id ${submission.user_id} não encontrado`);
          }

          // Verificar se service_id existe
          const serviceExists = await db
            .select()
            .from(services)
            .where(eq(services.id, SERVICE_ID))
            .limit(1);

          if (serviceExists.length === 0) {
            throw new Error(`service_id ${SERVICE_ID} não encontrado`);
          }

          // Verificar se acao_id existe
          const acaoExists = await db
            .select()
            .from(acao)
            .where(eq(acao.id, acaoId))
            .limit(1);

          if (acaoExists.length === 0) {
            throw new Error(`acao_id ${acaoId} não encontrado`);
          }

          // Preparar dados para inserção
          const newServiceRequest = {
            id: submission.id, // Manter ID original
            userId: submission.user_id,
            serviceId: SERVICE_ID,
            acaoId: acaoId,
            formData: formData,
            documents: [],
            quantity: submissionClients.length || submission.quantity,
            totalPrice: submission.total_amount,
            status: mapSubmissionStatus(submission.status),
            notes: submission.notes ?? null,
            paid: submission.is_paid,
            paidAt: submission.payment_date
              ? new Date(submission.payment_date)
              : null,
            couponCode: submission.coupon_id ?? null,
            asaasPaymentId: submission.payment_id ?? null,
            paymentStatus: mapPaymentStatus(submission.payment_status),
            itemsStatus: itemsStatus,
            createdAt: new Date(submission.created_at),
            updatedAt: new Date(submission.updated_at),
          };

          // Inserir no banco
          await db.insert(serviceRequest).values(newServiceRequest);

          stats.success++;
          console.log(
            `   ✓ ${submission.id} (${submissionClients.length} clientes) - Ação: ${acaoId === ACAO_ID_ANTES ? "ANTES" : "DEPOIS"} de 19/01`,
          );
        } catch (error) {
          stats.failed++;
          let errorMsg = "Erro desconhecido";

          if (error instanceof Error) {
            errorMsg = error.message;
            // Se for erro do Drizzle/PostgreSQL, tentar extrair mais informações
            if ("code" in error && typeof error.code === "string") {
              errorMsg = `[${error.code}] ${error.message}`;
            }
          }

          stats.errors.push({
            submission: submission.id,
            error: errorMsg,
          });
          console.error(`   ✗ Erro ao importar ${submission.id}: ${errorMsg}`);
        }
      }

      console.log(""); // Linha em branco entre lotes
    }

    // Relatório final
    console.log("\n📊 RESUMO DA IMPORTAÇÃO");
    console.log("─".repeat(50));
    console.log(`Total de submissions:     ${stats.total}`);
    console.log(`✓ Importadas com sucesso: ${stats.success}`);
    console.log(`✗ Falhas:                 ${stats.failed}`);
    console.log(`⊘ Ignoradas:              ${stats.skipped}`);
    console.log("─".repeat(50));

    if (stats.errors.length > 0) {
      console.log("\n❌ ERROS ENCONTRADOS:");
      for (const error of stats.errors) {
        console.log(`   • ${error.submission}: ${error.error}`);
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
importServiceRequests();
