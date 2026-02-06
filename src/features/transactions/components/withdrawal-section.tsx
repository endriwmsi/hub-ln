import { verifySession } from "@/core/auth/dal";
import { getBalanceSummary } from "../actions";
import { WithdrawalDialog } from "./withdrawal-dialog";

export default async function WithdrawalSection() {
  const session = await verifySession();

  // Admin não pode sacar
  if (session.user.role === "admin") {
    return null;
  }

  const result = await getBalanceSummary();

  if (!result.success || !result.data) {
    return null;
  }

  return <WithdrawalDialog availableBalance={result.data.availableBalance} />;
}
