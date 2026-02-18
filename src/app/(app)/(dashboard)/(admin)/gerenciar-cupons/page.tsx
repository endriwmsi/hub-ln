"use client";

import { Loader2 } from "lucide-react";
import {
  CouponsTable,
  CreateCouponDialog,
  useCoupons,
} from "@/features/coupons";

export default function CuponsAdminPage() {
  const { data: coupons, isLoading, error } = useCoupons();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gerenciar Cupons
          </h1>
          <p className="text-muted-foreground mt-1">
            Crie e gerencie cupons de desconto para seus indicados
          </p>
        </div>
        <CreateCouponDialog />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-destructive">Erro ao carregar cupons</p>
          <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
        </div>
      ) : (
        <CouponsTable coupons={coupons || []} />
      )}
    </div>
  );
}
