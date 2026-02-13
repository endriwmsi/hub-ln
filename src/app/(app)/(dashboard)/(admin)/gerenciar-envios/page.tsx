import { ClipboardList } from "lucide-react";
import { Suspense } from "react";
import {
  getServiceRequests,
  type ServiceRequestFilters,
  ServiceRequestsFilters,
  ServiceRequestsPagination,
  ServiceRequestsTable,
} from "@/features/service-requests";
import { getServices } from "@/features/services";
import { Skeleton } from "@/shared/components/ui/skeleton";

type GerenciarEnviosPageProps = {
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

async function EnviosContent({ searchParams }: GerenciarEnviosPageProps) {
  const params = await searchParams;

  // Preparar filtros (sem userId para ver todos)
  const filters: ServiceRequestFilters = {
    search: params.search,
    status: params.status as ServiceRequestFilters["status"],
    serviceId: params.serviceId,
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
    <div className="container space-y-6 gap-6 py-4 md:gap-8 md:py-6 px-6">
      <ServiceRequestsFilters services={services} />

      <ServiceRequestsTable requests={requests} showUser />

      <ServiceRequestsPagination
        total={pagination.total}
        totalPages={pagination.totalPages}
      />
    </div>
  );
}

export default async function GerenciarEnviosPage(
  props: GerenciarEnviosPageProps,
) {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <ClipboardList className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Gerenciar Solicitações
          </h1>
          <p className="text-muted-foreground">
            Visualize e gerencie todas as solicitações de serviço
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
