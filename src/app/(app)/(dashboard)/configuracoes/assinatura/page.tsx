"use client";

import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  CreditCard,
  Loader2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { checkSubscriptionStatus } from "@/features/subscriptions/actions/check-subscription-status";
import { createBilling } from "@/features/subscriptions/actions/create-billing";
import { PaymentQRCodeModal } from "@/features/subscriptions/components/payment-qr-code-modal";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

type SubscriptionStatus =
  | "trial"
  | "pending"
  | "active"
  | "past_due"
  | "canceled"
  | "expired";

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [trialExpiresAt, setTrialExpiresAt] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<{
    url: string;
    qrCode: string;
    billingId: string;
    amount: number;
    expiresAt: string;
  } | null>(null);
  const [creatingBilling, setCreatingBilling] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadSubscriptionData = useCallback(async () => {
    setLoading(true);
    const result = await checkSubscriptionStatus();

    if (result.success && result.data) {
      setHasSubscription(result.data.hasSubscription);
      setStatus(result.data.status as SubscriptionStatus | null);
      setIsExpired(result.data.isExpired);
      setTrialExpiresAt(
        result.data.trialExpiresAt
          ? new Date(result.data.trialExpiresAt)
          : null,
      );
      setEndDate(result.data.endDate ? new Date(result.data.endDate) : null);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadSubscriptionData();
  }, [loadSubscriptionData]);

  const handleCreateBilling = async () => {
    // Evitar múltiplas chamadas simultâneas
    if (creatingBilling) return;

    setCreatingBilling(true);
    setErrorMessage(null);

    try {
      const result = await createBilling();

      if (result.success && result.data) {
        setQrCodeData({
          url: result.data.brCode,
          qrCode: result.data.brCodeBase64,
          billingId: result.data.billingId,
          amount: result.data.amount,
          expiresAt: result.data.expiresAt,
        });
        setShowPaymentModal(true);
      } else {
        setErrorMessage(result.message || "Erro ao gerar QR Code");
      }
    } catch (error) {
      console.error("Erro ao criar billing:", error);
      setErrorMessage("Erro ao processar solicitação. Tente novamente.");
    } finally {
      setCreatingBilling(false);
    }
  };

  const handleModalClose = () => {
    setShowPaymentModal(false);
    loadSubscriptionData(); // Recarregar dados ao fechar o modal
  };

  const handleQRCodeExpired = () => {
    // Quando o QR Code expirar, podemos opcionalmente recarregar os dados
    console.log("QR Code expirado, você pode gerar um novo");
  };

  const getStatusBadge = (status: SubscriptionStatus | null) => {
    if (!status) return null;

    const variants: Record<
      SubscriptionStatus,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        label: string;
      }
    > = {
      trial: { variant: "secondary", label: "Período Trial" },
      pending: { variant: "secondary", label: "Pendente" },
      active: { variant: "default", label: "Ativa" },
      past_due: { variant: "destructive", label: "Pagamento Pendente" },
      canceled: { variant: "outline", label: "Cancelada" },
      expired: { variant: "destructive", label: "Expirada" },
    };

    const { variant, label } = variants[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "long",
    }).format(date);
  };

  const getDaysRemaining = (date: Date | null) => {
    if (!date) return null;
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Assinatura</h1>
        <p className="text-muted-foreground">
          Gerencie sua assinatura e pagamentos
        </p>
      </div>

      <div className="space-y-6">
        {/* Status Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Status da Assinatura
              </CardTitle>
              {status && getStatusBadge(status)}
            </div>
            <CardDescription>
              Informações sobre sua assinatura atual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!hasSubscription && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Você ainda não possui uma assinatura ativa. Crie uma para
                  começar a usar todos os recursos da plataforma.
                </AlertDescription>
              </Alert>
            )}

            {status === "trial" && trialExpiresAt && (
              <div className="rounded-lg border bg-blue-50 p-4 dark:bg-blue-950">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900 dark:text-blue-100">
                      Período de Trial Ativo
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Seu trial expira em: {formatDate(trialExpiresAt)}
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Dias restantes: {getDaysRemaining(trialExpiresAt)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {status === "active" && endDate && (
              <div className="rounded-lg border bg-emerald-50 p-4 dark:bg-emerald-950">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <div className="flex-1">
                    <p className="font-semibold text-emerald-900 dark:text-emerald-100">
                      Assinatura Ativa
                    </p>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">
                      Renovação em: {formatDate(endDate)}
                    </p>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">
                      Dias restantes: {getDaysRemaining(endDate)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {(isExpired || status === "expired" || status === "canceled") && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Sua assinatura está{" "}
                  {status === "canceled" ? "cancelada" : "expirada"}. Faça um
                  novo pagamento para continuar utilizando todos os recursos.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Payment Card */}
        {status !== "active" && (
          <Card>
            <CardHeader>
              <CardTitle>
                {status === "trial" || status === "pending"
                  ? "Ativar Assinatura"
                  : "Realizar Pagamento"}
              </CardTitle>
              <CardDescription>
                {status === "trial"
                  ? "Antecipe seu pagamento e garanta acesso contínuo por R$ 50,00/mês"
                  : "Ative ou renove sua assinatura por R$ 50,00/mês"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {errorMessage && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Plano Mensal</p>
                    <p className="text-sm text-muted-foreground">
                      Acesso completo à plataforma
                    </p>
                  </div>
                  <p className="text-2xl font-bold">R$ 50,00</p>
                </div>
              </div>

              <Button
                onClick={handleCreateBilling}
                disabled={creatingBilling}
                className="w-full"
                size="lg"
              >
                {creatingBilling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando QR Code...
                  </>
                ) : (
                  "Gerar QR Code PIX"
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                O QR Code PIX será válido por 5 minutos
              </p>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Pagamentos via PIX são confirmados automaticamente</p>
            <p>• Sua assinatura é renovada mensalmente</p>
            <p>• Você pode cancelar a qualquer momento</p>
            <p>• O período de trial dura 3 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Modal */}
      {qrCodeData && (
        <PaymentQRCodeModal
          isOpen={showPaymentModal}
          onClose={handleModalClose}
          onExpired={handleQRCodeExpired}
          qrCodeData={qrCodeData}
        />
      )}
    </div>
  );
}
