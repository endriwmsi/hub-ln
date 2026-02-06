import { verifySession } from "@/core/auth/dal";
import { PendingWithdrawals } from "./pending-withdrawals";

export default async function PendingWithdrawalsSection() {
  const session = await verifySession();

  // Apenas admin vê
  if (session.user.role !== "admin") {
    return null;
  }

  return (
    <div className="mb-6">
      <PendingWithdrawals />
    </div>
  );
}
