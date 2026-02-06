import { verifySession } from "@/core/auth/dal";
import { getAdminBalanceSummary, getBalanceSummary } from "../actions";
import { AdminBalanceCards } from "./admin-balance-cards";
import { BalanceCards } from "./balance-cards";

export default async function BalanceCardsSection() {
  const session = await verifySession();
  const isAdmin = session.user.role === "admin";

  if (isAdmin) {
    const result = await getAdminBalanceSummary();

    if (!result.success || !result.data) {
      return (
        <div className="text-center text-muted-foreground py-8">
          Erro ao carregar resumo financeiro
        </div>
      );
    }

    return <AdminBalanceCards data={result.data} />;
  }

  // Usuário normal
  const result = await getBalanceSummary();

  if (!result.success || !result.data) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Erro ao carregar saldo
      </div>
    );
  }

  return <BalanceCards data={result.data} />;
}
