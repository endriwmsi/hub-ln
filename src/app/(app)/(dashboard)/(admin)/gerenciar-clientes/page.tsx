import { ClientsTableContainer } from "@/features/clients";
import { getServices } from "@/features/services/actions";

export default async function GerenciarClientesPage() {
  // Buscar serviços para filtros
  const servicesData = await getServices(false);
  const services = servicesData.map((s) => ({ id: s.id, title: s.title }));

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Gerenciar Clientes
        </h1>
        <p className="text-muted-foreground">
          Visualize e gerencie todos os clientes de todas as ações e envios
        </p>
      </div>

      <ClientsTableContainer services={services} />
    </div>
  );
}
