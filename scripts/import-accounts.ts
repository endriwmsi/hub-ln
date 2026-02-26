import "dotenv/config";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { eq } from "drizzle-orm";
import { db } from "../src/core/db";
import { account } from "../src/core/db/schema/account.schema";

/**
 * Script de importação de accounts do arquivo accounts.json
 *
 * Este script lê o arquivo accounts.json e importa as contas para o banco de dados,
 * mapeando os campos do formato antigo para o novo schema.
 *
 * Uso: pnpm tsx scripts/import-accounts.ts
 */

interface OldAccountFormat {
  id: string;
  account_id: string;
  provider_id: string;
  user_id: string;
  access_token: string | null;
  refresh_token: string | null;
  id_token: string | null;
  access_token_expires_at: string | null;
  refresh_token_expires_at: string | null;
  scope: string | null;
  password: string | null;
  created_at: string;
  updated_at: string;
}

interface ImportStats {
  total: number;
  success: number;
  failed: number;
  skipped: number;
  errors: Array<{ account: string; error: string }>;
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

async function importAccounts() {
  console.log("🚀 Iniciando importação de accounts...\n");

  const stats: ImportStats = {
    total: 0,
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  try {
    // Ler arquivo JSON
    const filePath = resolve(process.cwd(), "./scripts/tables/accounts.json");
    const fileContent = readFileSync(filePath, "utf-8");
    const oldAccounts: OldAccountFormat[] = JSON.parse(fileContent);

    stats.total = oldAccounts.length;
    console.log(
      `📂 Arquivo lido com sucesso: ${stats.total} accounts encontradas\n`,
    );

    // Processar accounts em lotes
    const batchSize = 50;
    for (let i = 0; i < oldAccounts.length; i += batchSize) {
      const batch = oldAccounts.slice(i, i + batchSize);
      console.log(
        `📦 Processando lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(oldAccounts.length / batchSize)}...`,
      );

      for (const oldAccount of batch) {
        try {
          // Verificar se a account já existe (por id)
          const existingAccount = await db.query.account.findFirst({
            where: eq(account.id, oldAccount.id),
          });

          if (existingAccount) {
            console.log(`⏭️  Account já existe: ${oldAccount.id}`);
            stats.skipped++;
            continue;
          }

          // Mapear para o novo formato
          const newAccount = {
            id: oldAccount.id, // Mantém o ID original
            accountId: oldAccount.account_id,
            providerId: oldAccount.provider_id,
            userId: oldAccount.user_id,
            accessToken: nullIfEmpty(oldAccount.access_token),
            refreshToken: nullIfEmpty(oldAccount.refresh_token),
            idToken: nullIfEmpty(oldAccount.id_token),
            accessTokenExpiresAt: parseDate(oldAccount.access_token_expires_at),
            refreshTokenExpiresAt: parseDate(
              oldAccount.refresh_token_expires_at,
            ),
            scope: nullIfEmpty(oldAccount.scope),
            password: nullIfEmpty(oldAccount.password),
            createdAt: parseDate(oldAccount.created_at) || new Date(),
            updatedAt: parseDate(oldAccount.updated_at) || new Date(),
          };

          // Inserir no banco
          await db.insert(account).values(newAccount);

          console.log(`✅ Importada: ${oldAccount.id}`);
          stats.success++;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          console.error(`❌ Erro ao importar ${oldAccount.id}:`);

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
            account: oldAccount.id,
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
  console.log(`Total de accounts no arquivo: ${stats.total}`);
  console.log(`✅ Importadas com sucesso: ${stats.success}`);
  console.log(`⏭️  Ignoradas (já existem): ${stats.skipped}`);
  console.log(`❌ Falhas: ${stats.failed}`);
  console.log("=".repeat(60));

  // Salvar log de erros se houver
  if (stats.errors.length > 0) {
    const errorLogPath = resolve(process.cwd(), "import-accounts-errors.json");
    writeFileSync(errorLogPath, JSON.stringify(stats.errors, null, 2));
    console.log(`\n⚠️  Log de erros salvo em: ${errorLogPath}`);
  }

  console.log("\n✨ Importação concluída!\n");
}

// Executar importação
importAccounts()
  .then(() => {
    console.log("🎉 Processo finalizado com sucesso!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Erro crítico:", error);
    process.exit(1);
  });
