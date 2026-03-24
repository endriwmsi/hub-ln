import { ServicesGridWithPrice } from "@/features/services";
import { SubscriptionGuard } from "@/features/subscriptions";

export default function ServicosPage() {
  return (
    <SubscriptionGuard>
      <div className="container space-y-6 gap-6 py-4 md:gap-8 md:py-6 px-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Serviços</h1>
          <p className="text-muted-foreground">
            Escolha um serviço e defina seu preço de revenda
          </p>
        </div>

        <ServicesGridWithPrice />
      </div>
    </SubscriptionGuard>
  );
}
