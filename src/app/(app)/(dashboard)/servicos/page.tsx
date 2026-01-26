import { ServicesGrid } from "@/features/services";
import { SubscriptionGuard } from "@/features/subscriptions";

export default function ServicosPage() {
  return (
    <SubscriptionGuard>
      <div className="container py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Serviços</h1>
          <p className="text-muted-foreground">
            Escolha um serviço para solicitar
          </p>
        </div>

        <ServicesGrid />
      </div>
    </SubscriptionGuard>
  );
}
