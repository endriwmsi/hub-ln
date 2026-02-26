import "dotenv/config";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { eq, or } from "drizzle-orm";
import { db } from "../src/core/db";
import { user } from "../src/core/db/schema/user.schema";

/**
 * Script de importação de usuários do arquivo user.json
 *
 * Este script lê o arquivo user.json e importa os usuários para o banco de dados,
 * mapeando os campos do formato antigo para o novo schema.
 *
 * Uso: pnpm tsx scripts/import-users.ts
 */

interface OldUserFormat {
  id: string;
  name: string;
  email: string;
  email_verified: boolean;
  phone: string;
  image: string | null;
  cpf: string;
  cnpj: string;
  created_at: string;
  updated_at: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  uf: string;
  cep: string;
  referral_code: string;
  referred_by: string | null;
  is_admin: boolean;
  role: "user" | "admin";
  banned: boolean;
  ban_reason: string | null;
  ban_expires: string | null;
  is_subscribed: boolean;
  abacate_pay_customer_id: string | null;
}

interface ImportStats {
  total: number;
  success: number;
  failed: number;
  skipped: number;
  errors: Array<{ user: string; error: string }>;
}

async function importUsers() {
  console.log("🚀 Iniciando importação de usuários...\n");

  const stats: ImportStats = {
    total: 0,
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  try {
    // Ler arquivo JSON
    const filePath = resolve(process.cwd(), "./scripts/tables/user.json");
    const fileContent = readFileSync(filePath, "utf-8");
    const oldUsers: OldUserFormat[] = JSON.parse(fileContent);

    stats.total = oldUsers.length;
    console.log(
      `📂 Arquivo lido com sucesso: ${stats.total} usuários encontrados\n`,
    );

    // Processar usuários em lotes
    const batchSize = 50;
    for (let i = 0; i < oldUsers.length; i += batchSize) {
      const batch = oldUsers.slice(i, i + batchSize);
      console.log(
        `📦 Processando lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(oldUsers.length / batchSize)}...`,
      );

      for (const oldUser of batch) {
        try {
          // Verificar se o usuário já existe (por email, cpf ou cnpj)
          const existingUser = await db.query.user.findFirst({
            where: or(
              eq(user.email, oldUser.email),
              eq(user.cpf, oldUser.cpf),
              eq(user.cnpj, oldUser.cnpj),
            ),
          });

          if (existingUser) {
            console.log(`⏭️  Usuário já existe: ${oldUser.email}`);
            stats.skipped++;
            continue;
          }

          // Mapear para o novo formato
          const newUser = {
            id: oldUser.id, // Mantém o ID original
            name: oldUser.name,
            email: oldUser.email.toLowerCase().trim(),
            emailVerified: oldUser.email_verified,
            image: oldUser.image,
            phone: oldUser.phone?.replace(/\D/g, "") || null, // Remove caracteres não numéricos
            cpf: oldUser.cpf?.replace(/\D/g, "") || "", // Remove caracteres não numéricos
            cnpj: oldUser.cnpj?.replace(/\D/g, "") || "", // Remove caracteres não numéricos

            // Endereço
            street: oldUser.street || null,
            number: oldUser.number || null,
            complement: oldUser.complement || null,
            neighborhood: oldUser.neighborhood || null,
            city: oldUser.city || null,
            uf: oldUser.uf || null,
            cep: oldUser.cep?.replace(/\D/g, "") || null,

            // Timestamps
            createdAt: new Date(oldUser.created_at),
            updatedAt: new Date(oldUser.updated_at),

            // Role - prioriza o campo role se existir, senão usa is_admin
            role: (oldUser.role || (oldUser.is_admin ? "admin" : "user")) as
              | "user"
              | "admin",

            // Status de aprovação - usuários antigos são aprovados automaticamente
            approved: true,

            // Banimento
            banned: oldUser.banned || false,
            banReason: oldUser.ban_reason || null,
            banExpires: oldUser.ban_expires
              ? new Date(oldUser.ban_expires)
              : null,

            // Referrals
            referralCode: oldUser.referral_code,
            referredBy: oldUser.referred_by || null,

            // Integração AbacatePay
            abacatePayCustomerId: oldUser.abacate_pay_customer_id || null,

            // PIX Key - não existe no JSON antigo
            pixKey: null,
          };

          // Inserir no banco
          await db.insert(user).values(newUser);

          console.log(`✅ Importado: ${oldUser.email}`);
          stats.success++;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          console.error(
            `❌ Erro ao importar ${oldUser.email}: ${errorMessage}`,
          );
          stats.failed++;
          stats.errors.push({
            user: oldUser.email,
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
  console.log(`Total de usuários no arquivo: ${stats.total}`);
  console.log(`✅ Importados com sucesso: ${stats.success}`);
  console.log(`⏭️  Ignorados (já existem): ${stats.skipped}`);
  console.log(`❌ Falhas: ${stats.failed}`);
  console.log("=".repeat(60));

  // Salvar log de erros se houver
  if (stats.errors.length > 0) {
    const errorLogPath = resolve(process.cwd(), "import-errors.json");
    writeFileSync(errorLogPath, JSON.stringify(stats.errors, null, 2));
    console.log(`\n⚠️  Log de erros salvo em: ${errorLogPath}`);
  }

  console.log("\n✨ Importação concluída!\n");
}

// Executar importação
importUsers()
  .then(() => {
    console.log("🎉 Processo finalizado com sucesso!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Erro crítico:", error);
    process.exit(1);
  });
