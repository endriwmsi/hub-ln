"use client";

import { CreditCard, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ServiceRequestsTable } from "@/features/service-requests";
import { Button } from "@/shared/components/ui/button";
import {
  type CreatePixPaymentResult,
  createPixPaymentForRequests,
} from "../actions";
import { PaymentModal } from "./payment-modal";

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
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<CreatePixPaymentResult | null>(
    null,
  );

  // Calcular total selecionado
  const selectedRequests = requests.filter((r) => selectedIds.includes(r.id));
  const totalSelected = selectedRequests.reduce(
    (acc, r) => acc + parseFloat(r.totalPrice),
    0,
  );

  // Criar pagamento Pix
  const handleCreatePayment = () => {
    if (selectedIds.length === 0) {
      toast.error("Selecione pelo menos um envio para pagar");
      return;
    }

    startTransition(async () => {
      const result = await createPixPaymentForRequests(selectedIds);

      if (!result.success) {
        toast.error(result.error || "Erro ao criar pagamento");
        return;
      }

      if (result.data) {
        setPaymentData(result.data);
        setIsPaymentModalOpen(true);
      }
    });
  };

  // Callback quando pagamento é confirmado
  const handlePaymentConfirmed = () => {
    // Limpar seleção
    setSelectedIds([]);

    // Atualizar a página para refletir o novo status
    router.refresh();
  };

  // Fechar modal
  const handleCloseModal = () => {
    setIsPaymentModalOpen(false);
    setPaymentData(null);
  };

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
          <Button size="sm" onClick={handleCreatePayment} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Realizar Pagamento
              </>
            )}
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

      {/* Modal de Pagamento */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={handleCloseModal}
        paymentData={paymentData}
        onPaymentConfirmed={handlePaymentConfirmed}
      />
    </div>
  );
}
