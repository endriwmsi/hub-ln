"use client";

import { CreditCard, Loader2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import {
  type CreatePixPaymentResult,
  createPixPaymentForRequests,
} from "@/features/service-requests/actions";
import { formatCurrency } from "@/shared";
import { Button } from "@/shared/components/ui/button";
import type { Submission } from "../types";

type PaymentActionsBarProps = {
  selectedSubmissions: Submission[];
  onPaymentCreated: (paymentData: CreatePixPaymentResult) => void;
};

export function PaymentActionsBar({
  selectedSubmissions,
  onPaymentCreated,
}: PaymentActionsBarProps) {
  const [isPending, startTransition] = useTransition();

  const totalSelected = selectedSubmissions.reduce(
    (acc, s) => acc + parseFloat(s.totalPrice),
    0,
  );

  const handleCreatePayment = () => {
    if (selectedSubmissions.length === 0) {
      toast.error("Selecione pelo menos um envio para pagar");
      return;
    }

    startTransition(async () => {
      const result = await createPixPaymentForRequests(
        selectedSubmissions.map((s) => s.id),
      );

      if (!result.success) {
        toast.error(result.error || "Erro ao criar pagamento");
        return;
      }

      if (result.data) {
        onPaymentCreated(result.data);
      }
    });
  };

  if (selectedSubmissions.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">
          {selectedSubmissions.length} envio(s) selecionado(s)
        </span>
        <span className="text-sm text-muted-foreground">
          Total:{" "}
          <span className="font-semibold text-foreground">
            {formatCurrency(totalSelected.toFixed(2))}
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
  );
}
