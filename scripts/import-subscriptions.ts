import "dotenv/config";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { eq } from "drizzle-orm";
import { db } from "../src/core/db";
import { subscription } from "../src/core/db/schema/subscription.schema";

/**
 * Script de importação de subscriptions do arquivo subscription.json
 *
 * Este script lê o arquivo subscription.json e importa as assinaturas para o banco de dados,
 * mapeando os campos do formato antigo para o novo schema.
 *
 * Uso: pnpm tsx scripts/import-subscriptions.ts
 */

interface OldSubscriptionFormat {
  id: string;
  user_id: string;
  abacate_pay_billing_id: string;
  pix_qr_code_created_at: string | null;
  status: "trial" | "pending" | "active" | "past_due" | "canceled" | "expired";
  start_date: string;
  end_date: string | null;
  trial_expires_at: string | null;
  canceled_at?: string | null;
  created_at: string;
  updated_at: string;
}

interface ImportStats {
  total: number;
  success: number;
  failed: number;
  skipped: number;
  errors: Array<{ subscription: string; error: string }>;
}

/**
 * Converte string vazia em null
 */
function nullIfEmpty(value: string | null | undefined): string | null {
  if (!value || value.trim() === "") return null;
  return value;
}

/**
 * Converte string ISO para Date, ou null se inválido
 */
function parseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    return Number.isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

async function importSubscriptions() {
  console.log("🚀 Iniciando importação de subscriptions...\n");

  const stats: ImportStats = {
    total: 0,
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  try {
    // Ler arquivo JSON
    const filePath = resolve(
      process.cwd(),
      "./scripts/tables/subscription.json",
    );
    const fileContent = readFileSync(filePath, "utf-8");
    const oldSubscriptions: OldSubscriptionFormat[] = JSON.parse(fileContent);

    stats.total = oldSubscriptions.length;
    console.log(
      `📂 Arquivo lido com sucesso: ${stats.total} subscriptions encontradas\n`,
    );

    // Processar subscriptions em lotes
    const batchSize = 50;
    for (let i = 0; i < oldSubscriptions.length; i += batchSize) {
      const batch = oldSubscriptions.slice(i, i + batchSize);
      console.log(
        `📦 Processando lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(oldSubscriptions.length / batchSize)}...`,
      );

      for (const oldSubscription of batch) {
        try {
          // Verificar se a subscription já existe (por id)
          const existingSubscription = await db.query.subscription.findFirst({
            where: eq(subscription.id, oldSubscription.id),
          });

          if (existingSubscription) {
            console.log(`⏭️  Subscription já existe: ${oldSubscription.id}`);
            stats.skipped++;
            continue;
          }

          // Mapear para o novo formato
          const newSubscription = {
            id: oldSubscription.id, // Mantém o ID original
            userId: oldSubscription.user_id,
            pixId: nullIfEmpty(oldSubscription.abacate_pay_billing_id), // IMPORTANTE: abacate_pay_billing_id → pixId
            pixQrCodeCreatedAt: parseDate(
              oldSubscription.pix_qr_code_created_at,
            ),
            status: oldSubscription.status,
            startDate: parseDate(oldSubscription.start_date) || new Date(),
            endDate: parseDate(oldSubscription.end_date),
            trialExpiresAt: parseDate(oldSubscription.trial_expires_at),
            canceledAt: parseDate(oldSubscription.canceled_at),
            createdAt: parseDate(oldSubscription.created_at) || new Date(),
            updatedAt: parseDate(oldSubscription.updated_at) || new Date(),
          };

          // Inserir no banco
          await db.insert(subscription).values(newSubscription);

          console.log(`✅ Importada: ${oldSubscription.id}`);
          stats.success++;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          console.error(`❌ Erro ao importar ${oldSubscription.id}:`);

          if (error instanceof Error) {
            console.error(`   Mensagem: ${error.message}`);
            const err = error as unknown as Record<string, unknown>;
            if ("code" in error) {
              console.error(`   Código: ${err.code}`);
            }
            if ("detail" in error) {
              console.error(`   Detalhe: ${err.detail}`);
            }
          }

          stats.failed++;
          stats.errors.push({
            subscription: oldSubscription.id,
            error: errorMessage,
          });
        }
      }

      // Pequena pausa entre lotes para não sobrecarregar o banco
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  } catch (error) {
    console.error("\n❌ Erro fatal durante importação:", error);
    throw error;
  }

  // Relatório final
  console.log("\n" + "=".repeat(60));
  console.log("📊 RELATÓRIO DE IMPORTAÇÃO");
  console.log("=".repeat(60));
  console.log(`Total de subscriptions no arquivo: ${stats.total}`);
  console.log(`✅ Importadas com sucesso: ${stats.success}`);
  console.log(`⏭️  Ignoradas (já existem): ${stats.skipped}`);
  console.log(`❌ Falhas: ${stats.failed}`);
  console.log("=".repeat(60));

  // Salvar log de erros se houver
  if (stats.errors.length > 0) {
    const errorLogPath = resolve(
      process.cwd(),
      "import-subscriptions-errors.json",
    );
    writeFileSync(errorLogPath, JSON.stringify(stats.errors, null, 2));
    console.log(`\n⚠️  Log de erros salvo em: ${errorLogPath}`);
  }

  console.log("\n✨ Importação concluída!\n");
}

// Executar importação
importSubscriptions()
  .then(() => {
    console.log("🎉 Processo finalizado com sucesso!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Erro crítico:", error);
    process.exit(1);
  });
