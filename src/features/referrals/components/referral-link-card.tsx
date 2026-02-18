"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";

interface ReferralLinkCardProps {
  referralCode: string;
  referralLink: string;
}

export function ReferralLinkCard({
  referralCode,
  referralLink,
}: ReferralLinkCardProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success("Link copiado para a área de transferência!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Erro ao copiar o link");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seu Link de Indicação</CardTitle>
        <CardDescription>
          Compartilhe este link para convidar novos parceiros
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label
            htmlFor="referral-code"
            className="mb-2 block text-sm font-medium"
          >
            Código de Parceiro
          </label>
          <div className="flex items-center gap-2">
            <Input
              id="referral-code"
              value={referralCode}
              readOnly
              className="font-mono text-lg font-bold"
            />
            <Button
              size="icon"
              variant="outline"
              onClick={copyToClipboard}
              aria-label="Copiar código"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div>
          <label
            htmlFor="referral-link"
            className="mb-2 block text-sm font-medium"
          >
            Link Completo
          </label>
          <div className="flex items-center gap-2">
            <Input
              id="referral-link"
              value={referralLink}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              size="icon"
              variant="outline"
              onClick={copyToClipboard}
              aria-label="Copiar link"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
