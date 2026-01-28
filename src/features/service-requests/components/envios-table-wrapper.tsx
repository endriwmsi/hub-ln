"use client";

import { CreditCard } from "lucide-react";
import { useState } from "react";
import { ServiceRequestsTable } from "@/features/service-requests";
import { Button } from "@/shared/components/ui/button";

type ServiceRequestTableItem = {
  id: string;
  quantity: number;
  totalPrice: string;
  status: "pending" | "processing" | "completed" | "cancelled" | "rejected";
  paid: boolean;
  paidAt: Date | null;
  createdAt: Date;
  service: {
    id: string;
    title: string;
    slug: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
  acao?: {
    id: string;
    nome: string;
  } | null;
};

type EnviosTableWrapperProps = {
  requests: ServiceRequestTableItem[];
  showUser?: boolean;
};

export function EnviosTableWrapper({
  requests,
  showUser = false,
}: EnviosTableWrapperProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Calcular total selecionado
  const selectedRequests = requests.filter((r) => selectedIds.includes(r.id));
  const totalSelected = selectedRequests.reduce(
    (acc, r) => acc + parseFloat(r.totalPrice),
    0,
  );

  return (
    <div className="space-y-4">
      {/* Barra de ações quando há seleção */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              {selectedIds.length} envio(s) selecionado(s)
            </span>
            <span className="text-sm text-muted-foreground">
              Total:{" "}
              <span className="font-semibold text-foreground">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(totalSelected)}
              </span>
            </span>
          </div>
          <Button size="sm">
            <CreditCard className="mr-2 h-4 w-4" />
            Ir para Pagamento
          </Button>
        </div>
      )}

      <ServiceRequestsTable
        requests={requests}
        showUser={showUser}
        showCheckbox={true}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />
    </div>
  );
}
