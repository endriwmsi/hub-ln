import { notFound } from "next/navigation";
import { getServiceBySlug } from "@/features/services";
import { SubscriptionGuard } from "@/features/subscriptions";

type SolicitarServicoPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function SolicitarServicoPage({
  params,
}: SolicitarServicoPageProps) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  return (
    <SubscriptionGuard>
      <div className="container py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Solicitar Serviço
          </h1>
          <p className="text-muted-foreground">
            Preencha os dados para solicitar o serviço
          </p>
        </div>

        <div className="rounded-lg border p-6 space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Serviço Selecionado</h2>
            <p className="text-muted-foreground">{service.title}</p>
          </div>

          {service.description && (
            <div>
              <h3 className="font-medium">Descrição</h3>
              <p className="text-muted-foreground">{service.description}</p>
            </div>
          )}

          <div>
            <h3 className="font-medium">Valor Base</h3>
            <p className="text-2xl font-bold text-primary">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(Number(service.basePrice))}
            </p>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Formulário de solicitação será implementado em breve...
            </p>
          </div>
        </div>
      </div>
    </SubscriptionGuard>
  );
}
