"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { Service } from "@/core/db/schema";
import { CouponInput } from "@/features/coupons";
import { createServiceRequest } from "@/features/service-requests";
import { formatCurrency } from "@/shared";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";

type SingleSubmissionFormProps = {
  service: Service;
  acaoId?: string;
  costPrice?: string;
};

// Schema para envio único
const singleSubmissionSchema = z.object({
  nome: z.string().min(3, "Nome completo é obrigatório"),
  documento: z
    .string()
    .min(1, "CPF/CNPJ é obrigatório")
    .transform((val) => val.replace(/\D/g, ""))
    .pipe(
      z.string().refine((val) => val.length === 11 || val.length === 14, {
        message: "CPF/CNPJ inválido",
      }),
    ),
});

type SingleSubmissionFormData = z.infer<typeof singleSubmissionSchema>;

// Máscara para CPF/CNPJ
function maskDocument(value: string) {
  const cleaned = value.replace(/\D/g, "");

  if (cleaned.length <= 11) {
    // CPF: 999.999.999-99
    return cleaned
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2");
  } else {
    // CNPJ: 99.999.999/9999-99
    return cleaned
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})/, "$1-$2");
  }
}

export function SingleSubmissionForm({
  service,
  acaoId,
  costPrice,
}: SingleSubmissionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado para cupom aplicado
  const [appliedCoupon, setAppliedCoupon] = useState<{
    couponId: string;
    couponCode: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    discountPerUnit: number;
    totalDiscount: number;
  } | null>(null);

  const form = useForm<SingleSubmissionFormData>({
    resolver: zodResolver(singleSubmissionSchema),
    defaultValues: {
      nome: "",
      documento: "",
    },
  });

  const onSubmit = async (data: SingleSubmissionFormData) => {
    setIsSubmitting(true);

    try {
      // Preparar dados para enviar
      const formData: Record<string, string> = {
        nome: data.nome,
        documento: data.documento,
      };

      const result = await createServiceRequest({
        serviceId: service.id,
        acaoId,
        formData,
        quantity: 1,
        couponCode: appliedCoupon?.couponCode,
        couponId: appliedCoupon?.couponId,
        discountAmount: appliedCoupon?.totalDiscount,
      });

      if (result.success) {
        toast.success("Solicitação enviada com sucesso!");
        router.push("/envios");
      } else {
        toast.error(result.error || "Erro ao enviar solicitação");
      }
    } catch (error) {
      console.error("Erro ao enviar:", error);
      toast.error("Erro ao enviar solicitação");
    } finally {
      setIsSubmitting(false);
    }
  };

  const priceDisplay = Number(costPrice || service.basePrice);
  const finalPrice = appliedCoupon
    ? priceDisplay - appliedCoupon.discountPerUnit
    : priceDisplay;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Envio Único</CardTitle>
        <CardDescription>
          Preencha os dados para solicitar o serviço para um único cliente
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="João da Silva"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="documento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF/CNPJ</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="000.000.000-00"
                      {...field}
                      onChange={(e) => {
                        const masked = maskDocument(e.target.value);
                        field.onChange(masked);
                      }}
                      maxLength={18}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Digite apenas números. A máscara será aplicada
                    automaticamente.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Input de Cupom */}
            <div className="pt-4 border-t">
              <CouponInput
                serviceId={service.id}
                quantity={1}
                unitPrice={priceDisplay}
                onApplyCoupon={(couponData) => setAppliedCoupon(couponData)}
                onRemoveCoupon={() => setAppliedCoupon(null)}
                appliedCoupon={
                  appliedCoupon
                    ? {
                        couponCode: appliedCoupon.couponCode,
                        totalDiscount: appliedCoupon.totalDiscount,
                      }
                    : null
                }
              />
            </div>

            <div className="pt-4 border-t">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Preço unitário</span>
                  <span className="font-medium">
                    {formatCurrency(priceDisplay)}
                  </span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-green-600">Desconto</span>
                    <span className="font-medium text-green-600">
                      - {formatCurrency(appliedCoupon.discountPerUnit)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t">
                  <p className="text-sm text-muted-foreground">
                    Valor total do serviço
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(finalPrice)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="mt-8">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Solicitação"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
