import { CreativesGrid } from "@/features/creatives";
import { SubscriptionGuard } from "@/features/subscriptions";

export default function CriativosPage() {
  return (
    <SubscriptionGuard>
      <div className="container py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Criativos</h1>
          <p className="text-muted-foreground">
            Baixe criativos prontos para suas redes sociais
          </p>
        </div>

        <CreativesGrid />
      </div>
    </SubscriptionGuard>
  );
}
