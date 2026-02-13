import { notFound } from "next/navigation";
import { getAcoesAtivas } from "@/features/acoes/actions";
import { getFormFieldsByServiceId } from "@/features/form-fields";
import {
  DynamicFormRenderer,
  ServiceRequestModeSelector,
} from "@/features/service-requests";
import { AcaoSelector } from "@/features/service-requests/components";
import { getServiceBySlug, getUserServicePrices } from "@/features/services";
import { SubscriptionGuard } from "@/features/subscriptions";
import { formatCurrency } from "@/shared";

type SolicitarServicoPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    acao?: string;
  }>;
};

export default async function SolicitarServicoPage({
  params,
  searchParams,
}: SolicitarServicoPageProps) {
  const { slug } = await params;
  const { acao: acaoId } = await searchParams;
  const service = await getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  // Buscar campos do formulário
  const formFields = await getFormFieldsByServiceId(service.id);

  // Buscar preço de revenda do usuário
  const pricesResult = await getUserServicePrices();
  const userPrice = pricesResult.success
    ? pricesResult.data?.find((p) => p.id === service.id)
    : null;

  // Preço a exibir: costPrice (o que o usuário PAGA) - não o resalePrice
  const displayPrice = userPrice?.costPrice || service.basePrice;

  // Determinar qual tipo de formulário exibir
  const isSimpleService = service.type === "simple";
  const hasFormFields = formFields.length > 0;

  // Buscar ações ativas apenas para serviços do tipo "simple" (limpa nome)
  const acoesAtivas = isSimpleService ? await getAcoesAtivas() : [];

  // Verificar se tem ação selecionada (apenas para serviços simple)
  const selectedAcao = acoesAtivas.find((a) => a.id === acaoId);

  // Para serviços "simple", precisa de ação. Para outros, não precisa.
  const needsAcao = isSimpleService;

  return (
    <SubscriptionGuard>
      <div className="container space-y-6 gap-6 py-4 md:gap-8 md:py-6 px-6">
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
            <h2 className="text-xl font-semibold">{service.title}</h2>
            {service.description && (
              <p className="text-muted-foreground mt-1">
                {service.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Valor por unidade</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(displayPrice)}
              </p>
            </div>
          </div>
        </div>

        {/* Seletor de Ação - apenas para serviços do tipo "simple" (limpa nome) */}
        {isSimpleService && (
          <AcaoSelector
            acoes={acoesAtivas}
            selectedAcaoId={acaoId}
            serviceSlug={slug}
          />
        )}

        {/* Renderizar formulário */}
        {needsAcao && !acaoId ? (
          <div className="rounded-lg border p-6 text-center bg-muted/50">
            <p className="text-muted-foreground">
              Selecione uma ação acima para continuar com o envio.
            </p>
          </div>
        ) : needsAcao && !selectedAcao ? (
          <div className="rounded-lg border p-6 text-center bg-destructive/10">
            <p className="text-destructive">
              A ação selecionada não está mais disponível.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Por favor, selecione outra ação.
            </p>
          </div>
        ) : isSimpleService ? (
          <ServiceRequestModeSelector
            service={service}
            acaoId={acaoId}
            costPrice={displayPrice}
          />
        ) : hasFormFields ? (
          <DynamicFormRenderer
            service={service}
            fields={formFields}
            costPrice={displayPrice}
          />
        ) : (
          <ServiceRequestModeSelector
            service={service}
            costPrice={displayPrice}
          />
        )}
      </div>
    </SubscriptionGuard>
  );
}
