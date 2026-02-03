"use client";

import { CheckCircle2, Copy, Loader2, QrCode, XCircle } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { formatCurrency } from "@/shared";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { type CreatePixPaymentResult, checkPaymentStatus } from "../actions";

type PaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  paymentData: CreatePixPaymentResult | null;
  onPaymentConfirmed?: () => void;
};

type PaymentStatus = "pending" | "confirmed" | "failed" | "expired";

const POLLING_INTERVAL = 5000; // 5 segundos

export function PaymentModal({
  isOpen,
  onClose,
  paymentData,
  onPaymentConfirmed,
}: PaymentModalProps) {
  const [status, setStatus] = useState<PaymentStatus>("pending");
  const [isPolling, setIsPolling] = useState(false);
  const [copied, setCopied] = useState(false);

  // Função para verificar o status do pagamento
  const checkStatus = useCallback(async () => {
    if (!paymentData?.paymentId) return;

    try {
      const result = await checkPaymentStatus(paymentData.paymentId);

      if (result.success && result.data) {
        if (result.data.isPaid) {
          setStatus("confirmed");
          setIsPolling(false);

          // Notificar o componente pai
          if (onPaymentConfirmed) {
            onPaymentConfirmed();
          }

          // Toast de sucesso
          toast.success("Pagamento confirmado!", {
            description: "Seu pagamento foi processado com sucesso.",
          });

          // Fechar modal automaticamente após 3 segundos
          setTimeout(() => {
            onClose();
          }, 3000);
        } else if (result.data.status === "overdue") {
          setStatus("expired");
          setIsPolling(false);
        }
      }
    } catch (error) {
      console.error("[PaymentModal] Erro ao verificar status:", error);
    }
  }, [paymentData?.paymentId, onPaymentConfirmed, onClose]);

  // Polling do status do pagamento
  useEffect(() => {
    if (!isOpen || !paymentData?.paymentId || status !== "pending") {
      return;
    }

    setIsPolling(true);

    // Verificar imediatamente
    checkStatus();

    // Configurar intervalo de polling
    const intervalId = setInterval(checkStatus, POLLING_INTERVAL);

    return () => {
      clearInterval(intervalId);
      setIsPolling(false);
    };
  }, [isOpen, paymentData?.paymentId, status, checkStatus]);

  // Reset status quando modal abre/fecha
  useEffect(() => {
    if (isOpen) {
      setStatus("pending");
      setCopied(false);
    }
  }, [isOpen]);

  // Copiar código Pix
  const copyToClipboard = async () => {
    if (!paymentData?.qrCodePayload) return;

    try {
      await navigator.clipboard.writeText(paymentData.qrCodePayload);
      setCopied(true);
      toast.success("Código copiado!");

      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error("Erro ao copiar código");
    }
  };

  // Formatar data de expiração
  const formatExpiration = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-105">
        <DialogHeader className="text-center">
          <DialogTitle className="flex items-center justify-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            Pagamento via Pix
          </DialogTitle>
          <DialogDescription className="text-center">
            {status === "pending" &&
              "Escaneie o QR Code ou copie o código Pix para realizar o pagamento."}
            {status === "confirmed" && "Seu pagamento foi confirmado!"}
            {status === "expired" && "O tempo para pagamento expirou."}
            {status === "failed" && "Ocorreu um erro no pagamento."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-6">
          {/* Status: Pendente */}
          {status === "pending" && paymentData && (
            <>
              {/* Valor total */}
              <div className="text-center space-y-1">
                <p className="text-sm text-muted-foreground">Valor total</p>
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(paymentData.totalValue)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {paymentData.serviceRequestIds.length} envio(s) selecionado(s)
                </p>
              </div>

              {/* QR Code */}
              <div className="relative bg-white p-3 rounded-xl border shadow-sm">
                <Image
                  src={`data:image/png;base64,${paymentData.qrCodeImage}`}
                  alt="QR Code Pix"
                  width={180}
                  height={180}
                  className="rounded-lg"
                />
                {isPolling && (
                  <div className="absolute -top-1.5 -right-1.5">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/75 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </span>
                  </div>
                )}
              </div>

              {/* Código Pix (copia e cola) */}
              <div className="w-full space-y-2">
                <p className="text-sm text-muted-foreground text-center">
                  Ou copie o código Pix:
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted px-3 py-2.5 rounded-lg overflow-hidden">
                    <code className="text-xs text-muted-foreground block truncate">
                      {paymentData.qrCodePayload.slice(0, 40)}...
                    </code>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyToClipboard}
                    disabled={copied}
                    className="shrink-0 h-10 w-10"
                  >
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Info de expiração */}
              <p className="text-xs text-muted-foreground text-center">
                Válido até: {formatExpiration(paymentData.expirationDate)}
              </p>

              {/* Indicador de verificação */}
              {isPolling && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-full px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Aguardando confirmação...</span>
                </div>
              )}
            </>
          )}

          {/* Status: Confirmado */}
          {status === "confirmed" && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-xl font-semibold text-green-600 dark:text-green-400">
                  Pagamento Confirmado!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Seu pagamento foi processado com sucesso.
                </p>
                {paymentData && (
                  <p className="text-lg font-bold mt-2">
                    {formatCurrency(paymentData.totalValue)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Status: Expirado */}
          {status === "expired" && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="h-20 w-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <XCircle className="h-12 w-12 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-xl font-semibold text-amber-600 dark:text-amber-400">
                  Pagamento Expirado
                </h3>
                <p className="text-sm text-muted-foreground">
                  O tempo para pagamento expirou. Tente novamente.
                </p>
              </div>
            </div>
          )}

          {/* Status: Erro */}
          {status === "failed" && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-xl font-semibold text-red-600 dark:text-red-400">
                  Erro no Pagamento
                </h3>
                <p className="text-sm text-muted-foreground">
                  Ocorreu um erro ao processar o pagamento. Tente novamente.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-center">
          {status === "pending" && (
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
          )}
          {(status === "confirmed" ||
            status === "expired" ||
            status === "failed") && (
            <Button onClick={onClose} className="w-full sm:w-auto">
              Fechar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
