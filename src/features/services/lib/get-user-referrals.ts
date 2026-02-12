import { eq } from "drizzle-orm";
import { db } from "@/core/db";
import { user } from "@/core/db/schema";

/**
 * Busca recursivamente todos os usuários indicados por um usuário (diretos e indiretos)
 * @param referralCode - Código de referência do usuário
 * @returns Array com IDs de todos os usuários na cadeia de indicações
 */
export async function getUserReferrals(
  referralCode: string,
): Promise<string[]> {
  const referrals: string[] = [];
  const queue: string[] = [referralCode];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const currentCode = queue.shift();
    if (!currentCode) continue;

    if (visited.has(currentCode)) {
      continue;
    }

    visited.add(currentCode);

    // Buscar todos os usuários que foram indicados por este código
    const directReferrals = await db
      .select()
      .from(user)
      .where(eq(user.referredBy, currentCode));

    for (const referral of directReferrals) {
      referrals.push(referral.id);

      // Adicionar o código de referência do usuário à fila para buscar seus indicados
      if (referral.referralCode) {
        queue.push(referral.referralCode);
      }
    }
  }

  return referrals;
}
