import { z } from "zod";

// Tipo de desconto
export const discountTypes = ["percentage", "fixed"] as const;
export type DiscountType = (typeof discountTypes)[number];

// Labels para tipo de desconto
export const discountTypeLabels: Record<DiscountType, string> = {
  percentage: "Porcentagem",
  fixed: "Valor Fixo",
};

// Schema para criação de cupom
export const createCouponSchema = z
  .object({
    code: z
      .string()
      .min(3, "Código deve ter no mínimo 3 caracteres")
      .max(50, "Código deve ter no máximo 50 caracteres")
      .regex(
        /^[A-Z0-9-_]+$/,
        "Código deve conter apenas letras maiúsculas, números, hífen e underscore",
      ),

    discountType: z.enum(discountTypes, {
      message: "Selecione o tipo de desconto",
    }),

    discountValue: z
      .number({
        message: "Valor do desconto é obrigatório",
      })
      .positive("Valor deve ser maior que zero"),

    usageLimit: z
      .number()
      .int("Deve ser um número inteiro")
      .positive("Deve ser maior que zero")
      .optional()
      .nullable(),

    singleUse: z.boolean().default(false),

    active: z.boolean().default(true),

    validFrom: z.date().optional(),

    validUntil: z.date().optional(),
  })
  .refine(
    (data) => {
      // Se for porcentagem, não pode ser maior que 100
      if (data.discountType === "percentage" && data.discountValue > 100) {
        return false;
      }
      return true;
    },
    {
      message: "Porcentagem não pode ser maior que 100",
      path: ["discountValue"],
    },
  );

export type CreateCouponInput = z.infer<typeof createCouponSchema>;

// Schema para atualização de cupom
export const updateCouponSchema = z.object({
  id: z.string().min(1, "ID do cupom é obrigatório"),
  active: z.boolean().optional(),
  usageLimit: z.coerce
    .number()
    .int("Deve ser um número inteiro")
    .positive("Deve ser maior que zero")
    .optional()
    .nullable(),
  validFrom: z.coerce.date().optional().nullable(),
  validUntil: z.coerce.date().optional().nullable(),
});

export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;

// Schema para validação de cupom
export const validateCouponSchema = z.object({
  code: z.string().min(1, "Código do cupom é obrigatório"),
  serviceId: z.string().min(1, "ID do serviço é obrigatório"),
  quantity: z.number().int().positive().default(1),
});

export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;

// Resposta da validação
export type ValidateCouponResponse = {
  valid: boolean;
  coupon?: {
    id: string;
    code: string;
    discountType: DiscountType;
    discountValue: number;
  };
  discountPerUnit?: number;
  totalDiscount?: number;
  error?: string;
};
