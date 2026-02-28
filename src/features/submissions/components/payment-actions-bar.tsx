"use client";

import { CreditCard, Loader2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import {
  type CreatePixPaymentResult,
  createPixPaymentForRequests,
} from "@/features/service-requests/actions";
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
    <Button
      onClick={handleCreatePayment}
      disabled={isPending}
      className="w-full sm:w-auto"
    >
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
  );
}
