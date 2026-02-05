/** biome-ignore-all lint/suspicious/noArrayIndexKey: It's just a skeleton component */
"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { getUserServicePrices } from "../actions";
import { ServiceCardWithPrice } from "./service-card-with-price";

export function ServicesGridWithPrice() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["userServicePrices"],
    queryFn: async () => {
      const result = await getUserServicePrices();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

  const handlePriceUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ["userServicePrices"] });
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={`skeleton-${i}`}
            className="rounded-xl border p-6 space-y-4"
          >
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Erro ao carregar serviços. Tente novamente.
        </p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Nenhum serviço disponível no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((service) => (
        <ServiceCardWithPrice
          key={service.id}
          service={service}
          onPriceUpdated={handlePriceUpdated}
        />
      ))}
    </div>
  );
}
