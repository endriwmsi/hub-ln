"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { checkAccess } from "../actions/check-access";

interface SubscriptionGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function SubscriptionGuard({
  children,
  redirectTo = "/configuracoes/assinatura",
}: SubscriptionGuardProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [reason, setReason] = useState<string>("");
  const router = useRouter();

  const checkUserAccess = useCallback(async () => {
    const result = await checkAccess();

    if (!result.hasAccess) {
      setHasAccess(false);
      setReason(result.reason || "");
    } else {
      setHasAccess(true);
    }
  }, []);

  useEffect(() => {
    checkUserAccess();
  }, [checkUserAccess]);

  if (hasAccess === null) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hasAccess) {
    const messages: Record<string, { title: string; description: string }> = {
      not_authenticated: {
        title: "Autenticação necessária",
        description: "Você precisa estar autenticado para acessar esta página.",
      },
      no_subscription: {
        title: "Assinatura necessária",
        description:
          "Você precisa de uma assinatura ativa para acessar este recurso.",
      },
      trial_expired: {
        title: "Período de trial expirado",
        description:
          "Seu período de teste expirou. Faça um pagamento para continuar.",
      },
      subscription_expired: {
        title: "Assinatura expirada",
        description:
          "Sua assinatura expirou. Renove para continuar utilizando este recurso.",
      },
      subscription_inactive: {
        title: "Assinatura inativa",
        description:
          "Sua assinatura está inativa. Ative-a para acessar este recurso.",
      },
    };

    const message = messages[reason] || messages.subscription_inactive;

    return (
      <div className="flex h-96 items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-destructive/10 p-3 mb-4">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold mb-2">{message.title}</h2>
              <p className="text-muted-foreground mb-6">
                {message.description}
              </p>
              <Button
                onClick={() => router.push(redirectTo)}
                className="w-full"
              >
                Gerenciar Assinatura
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
