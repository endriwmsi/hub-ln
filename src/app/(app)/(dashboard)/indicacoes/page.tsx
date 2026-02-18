import { Network } from "lucide-react";
import type { Metadata } from "next";
import { verifySession } from "@/core/auth/dal";
import { ReferralsContent } from "@/features/referrals/components/referrals-content";

export const metadata: Metadata = {
  title: "Indicações",
  description: "Gerencie suas indicações e visualize sua rede de parceiros",
};

export default async function ReferralsPage() {
  const { user } = await verifySession();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Network className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Indicações</h1>
          <p className="text-muted-foreground">
            Compartilhe seu link e acompanhe sua rede de parceiros
          </p>
        </div>
      </div>

      <ReferralsContent
        currentUserId={user.id}
        isAdmin={user.role === "admin"}
      />
    </div>
  );
}
