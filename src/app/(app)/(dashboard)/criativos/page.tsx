import { CreativesGrid } from "@/features/creatives";
import { SubscriptionGuard } from "@/features/subscriptions";

export default function CriativosPage() {
  return (
    <SubscriptionGuard>
      <div className="container space-y-6 gap-6 py-4 md:gap-8 md:py-6 px-6">
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
