"use client";

import { CheckCircle2, Clock, Copy, QrCode } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { checkPaymentStatus } from "../actions/check-payment-status";

interface PaymentQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExpired?: () => void; // Callback quando o QR Code expirar
  qrCodeData: {
    url: string;
    qrCode: string;
    billingId: string;
    amount: number;
    expiresAt: string;
  };
}

export function PaymentQRCodeModal({
  isOpen,
  onClose,
  onExpired,
  qrCodeData,
}: PaymentQRCodeModalProps) {
  const [copied, setCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "paid">(
    "pending",
  );
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const router = useRouter();

  // Calcular tempo restante
  useEffect(() => {
    if (!qrCodeData.expiresAt) return;

    const calculateTimeLeft = () => {
      const expiresAt = new Date(qrCodeData.expiresAt).getTime();
      const now = Date.now();
      const diff = Math.max(0, expiresAt - now);
      const seconds = Math.floor(diff / 1000);
      setTimeLeft(seconds);

      if (seconds === 0 && !isExpired) {
        setIsExpired(true);
        if (onExpired) {
          onExpired();
        }
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [qrCodeData.expiresAt, isExpired, onExpired]);

  // Verificar status do pagamento a cada 10 segundos (ou 20 se expirado)
  useEffect(() => {
    if (paymentStatus === "paid") return;

    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 3;
    let currentInterval = isExpired ? 20000 : 10000; // 10s normal, 20s expirado

    const checkStatus = async () => {
      try {
        setIsChecking(true);
        const result = await checkPaymentStatus(qrCodeData.billingId);

        if (result.success && result.data?.status === "PAID") {
          setPaymentStatus("paid");
          consecutiveErrors = 0;
        } else if (!result.success) {
          consecutiveErrors++;
          console.error("Erro ao verificar pagamento:", result.message);

          // Se for rate limiting, aumentar o intervalo
          if (
            result.message?.toLowerCase().includes("muitas requisições") ||
            result.message?.toLowerCase().includes("too many")
          ) {
            currentInterval = Math.min(currentInterval * 2, 60000); // Dobrar até max 60s
            console.warn(
              `Rate limit detectado. Aumentando intervalo para ${currentInterval / 1000}s`,
            );
          }

          if (consecutiveErrors >= maxConsecutiveErrors) {
            console.warn(
              "Muitos erros ao verificar pagamento, pausando verificações",
            );
            return;
          }
        } else {
          consecutiveErrors = 0;

          currentInterval = isExpired ? 20000 : 10000;
        }
      } catch (error) {
        console.error("Exceção ao verificar pagamento:", error);
        consecutiveErrors++;
      } finally {
        setIsChecking(false);
      }
    };

    // Aguardar 5 segundos antes da primeira verificação
    const initialTimeout = setTimeout(checkStatus, 5000);

    // Continuar verificando mesmo após expiração (mas com intervalo maior)
    const intervalId = setInterval(checkStatus, currentInterval);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(intervalId);
    };
  }, [qrCodeData.billingId, paymentStatus, isExpired]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(qrCodeData.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePaymentConfirmed = useCallback(() => {
    router.refresh();
    onClose();
  }, [router, onClose]);

  const handleManualCheck = useCallback(async () => {
    setIsChecking(true);
    try {
      const result = await checkPaymentStatus(qrCodeData.billingId);
      if (result.success && result.data?.status === "PAID") {
        setPaymentStatus("paid");
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error("Erro ao verificar pagamento manualmente:", error);
    } finally {
      setIsChecking(false);
    }
  }, [qrCodeData.billingId, router]);

  // Resetar estados quando o modal abre
  useEffect(() => {
    if (isOpen) {
      setPaymentStatus("pending");
      setIsExpired(false);
      setCopied(false);
      setIsChecking(false);
    }
  }, [isOpen]);

  // Fechar modal automaticamente quando o pagamento for confirmado
  useEffect(() => {
    if (paymentStatus === "paid") {
      const timeout = setTimeout(() => {
        handlePaymentConfirmed();
      }, 3000); // Aguardar 3 segundos para o usuário ver a mensagem

      return () => clearTimeout(timeout);
    }
  }, [paymentStatus, handlePaymentConfirmed]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Pagamento via PIX
          </DialogTitle>
          <DialogDescription>
            Escaneie o QR Code ou copie o código PIX para realizar o pagamento
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Banner */}
          {paymentStatus === "paid" ? (
            <Card className="border-emerald-500 bg-emerald-50 dark:bg-emerald-950">
              <CardContent className="flex items-center gap-3 p-4">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="font-semibold text-emerald-900 dark:text-emerald-100">
                    Pagamento confirmado!
                  </p>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    Sua assinatura foi ativada com sucesso.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : isExpired ? (
            <Card className="border-red-500 bg-red-50 dark:bg-red-950">
              <CardContent className="flex items-center gap-3 p-4">
                <Clock className="h-5 w-5 text-red-600" />
                <div className="flex-1">
                  <p className="font-semibold text-red-900 dark:text-red-100">
                    QR Code expirado
                    {isChecking && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                        Verificando status...
                      </p>
                    )}
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Este QR Code não é mais válido. Feche e gere um novo.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950">
              <CardContent className="flex items-center gap-3 p-4">
                <Clock className="h-5 w-5 text-amber-600" />
                <div className="flex-1">
                  <p className="font-semibold text-amber-900 dark:text-amber-100">
                    Aguardando pagamento
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Tempo restante: {formatTime(timeLeft)}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {/* QR Code */}
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="relative h-64 w-64">
                  <Image
                    src={qrCodeData.qrCode}
                    alt="QR Code PIX"
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Escaneie com o app do seu banco
                </p>
              </CardContent>
            </Card>

            {/* Detalhes */}
            <Card>
              <CardContent className="flex flex-col justify-between p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Valor</p>
                    <p className="text-2xl font-bold">
                      R$ {qrCodeData.amount.toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Código PIX Copia e Cola
                    </p>
                    <div className="flex gap-2">
                      <code className="flex-1 rounded bg-muted p-3 text-xs break-all">
                        {qrCodeData.url}
                      </code>
                    </div>
                  </div>

                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    className="w-full"
                    disabled={copied}
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copiar código PIX
                      </>
                    )}
                  </Button>
                </div>

                {/* Botão de pagamento confirmado */}
                {paymentStatus === "paid" && (
                  <Button
                    onClick={handlePaymentConfirmed}
                    className="mt-4 w-full"
                  >
                    Continuar
                  </Button>
                )}

                {/* Botão de verificação manual (quando não expirado) */}
                {!isExpired && paymentStatus === "pending" && (
                  <Button
                    onClick={handleManualCheck}
                    variant="ghost"
                    className="mt-4 w-full"
                    disabled={isChecking}
                  >
                    {isChecking ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      "Já realizei o pagamento"
                    )}
                  </Button>
                )}

                {/* Botões quando expirado */}
                {isExpired && (
                  <>
                    {paymentStatus === "pending" && (
                      <Button
                        onClick={handleManualCheck}
                        variant="outline"
                        className="mt-4 w-full"
                        disabled={isChecking}
                      >
                        {isChecking ? (
                          <>
                            <Clock className="mr-2 h-4 w-4 animate-spin" />
                            Verificando...
                          </>
                        ) : (
                          "Verificar pagamento"
                        )}
                      </Button>
                    )}
                    <Button
                      onClick={onClose}
                      variant="default"
                      className="mt-2 w-full"
                    >
                      Gerar novo QR Code
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="bg-muted">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                <strong>Importante:</strong> O QR Code expira em 5 minutos. Após
                o pagamento, a confirmação pode levar alguns segundos.
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
