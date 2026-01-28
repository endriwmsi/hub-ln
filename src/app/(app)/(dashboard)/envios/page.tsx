import { Send } from "lucide-react";
import { Suspense } from "react";
import { verifySession } from "@/core/auth/dal";
import {
  EnviosTableWrapper,
  getServiceRequests,
  type ServiceRequestFilters,
  ServiceRequestsFilters,
  ServiceRequestsPagination,
} from "@/features/service-requests";
import { getServices } from "@/features/services";
import { Skeleton } from "@/shared/components/ui/skeleton";

type EnviosPageProps = {
  searchParams: Promise<{
    search?: string;
    status?: string;
    serviceId?: string;
    page?: string;
    pageSize?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
};

async function EnviosContent({ searchParams }: EnviosPageProps) {
  const session = await verifySession();
  const params = await searchParams;

  // Preparar filtros
  const filters: ServiceRequestFilters = {
    search: params.search,
    status: params.status as ServiceRequestFilters["status"],
    serviceId: params.serviceId,
    userId: session.userId, // Filtrar apenas os envios do usuário logado
    sortBy: (params.sortBy as ServiceRequestFilters["sortBy"]) || "createdAt",
    sortOrder: (params.sortOrder as "asc" | "desc") || "desc",
    page: Number(params.page) || 1,
    pageSize: Number(params.pageSize) || 10,
  };

  // Buscar dados
  const [{ data: requests, pagination }, services] = await Promise.all([
    getServiceRequests(filters),
    getServices(),
  ]);

  return (
    <div className="space-y-4">
      <ServiceRequestsFilters services={services} />

      <EnviosTableWrapper requests={requests} />

      <ServiceRequestsPagination
        total={pagination.total}
        totalPages={pagination.totalPages}
      />
    </div>
  );
}

export default async function EnviosPage(props: EnviosPageProps) {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Send className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meus Envios</h1>
          <p className="text-muted-foreground">
            Acompanhe o status das suas solicitações de serviço
          </p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        }
      >
        <EnviosContent {...props} />
      </Suspense>
    </div>
  );
}
