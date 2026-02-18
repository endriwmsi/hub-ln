"use client";

import { Check, Loader2, Tag, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useValidateCoupon } from "../hooks";
import type { ValidateCouponInput } from "../schemas";

type CouponInputProps = {
  serviceId: string;
  quantity: number;
  unitPrice: number;
  onApplyCoupon: (couponData: {
    couponId: string;
    couponCode: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    discountPerUnit: number;
    totalDiscount: number;
  }) => void;
  onRemoveCoupon: () => void;
  appliedCoupon?: {
    couponCode: string;
    totalDiscount: number;
  } | null;
};

export function CouponInput({
  serviceId,
  quantity,
  unitPrice,
  onApplyCoupon,
  onRemoveCoupon,
  appliedCoupon,
}: CouponInputProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { mutateAsync, isPending } = useValidateCoupon();

  const handleValidate = async () => {
    if (!code.trim()) {
      setError("Digite um código de cupom");
      return;
    }

    setError(null);

    const input: ValidateCouponInput = {
      code: code.trim(),
      serviceId,
      quantity,
    };

    const result = await mutateAsync(input);

    if (!result.success) {
      setError(result.error || "Erro ao validar cupom");
      return;
    }

    if (!result.data?.valid) {
      setError(result.data?.error || "Cupom inválido");
      return;
    }

    if (result.data.coupon) {
      // Calcular desconto baseado no tipo
      let discountPerUnit = 0;
      let totalDiscount = 0;

      if (result.data.coupon.discountType === "percentage") {
        // Desconto em porcentagem do preço unitário
        discountPerUnit = (unitPrice * result.data.coupon.discountValue) / 100;
        totalDiscount = discountPerUnit * quantity;
      } else {
        // Desconto fixo por unidade
        discountPerUnit = result.data.coupon.discountValue;
        totalDiscount = discountPerUnit * quantity;
      }

      onApplyCoupon({
        couponId: result.data.coupon.id,
        couponCode: result.data.coupon.code,
        discountType: result.data.coupon.discountType,
        discountValue: result.data.coupon.discountValue,
        discountPerUnit,
        totalDiscount,
      });

      setCode("");
    }
  };

  const handleRemove = () => {
    onRemoveCoupon();
    setCode("");
    setError(null);
  };

  if (appliedCoupon) {
    return (
      <div className="space-y-2">
        <Label>Cupom de Desconto</Label>
        <div className="flex items-center gap-2 rounded-lg border bg-emerald-100 dark:bg-emerald-900 border-green-300 dark:border-green-200 p-3">
          <Tag className="h-4 w-4" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold">
                {appliedCoupon.couponCode}
              </span>
              <Check className="h-4 w-4" />
            </div>
            <p className="text-sm">
              Desconto aplicado: R$ {appliedCoupon.totalDiscount.toFixed(2)}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            className=""
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="coupon-code">Cupom de Desconto (Opcional)</Label>
      <div className="flex gap-2">
        <Input
          id="coupon-code"
          placeholder="Digite o código do cupom"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleValidate();
            }
          }}
          className={error ? "border-destructive" : ""}
        />
        <Button
          type="button"
          onClick={handleValidate}
          disabled={isPending || !code.trim()}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Validando...
            </>
          ) : (
            "Aplicar"
          )}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
