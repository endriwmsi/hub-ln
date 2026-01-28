import { z } from "zod";

// Tipos de serviço
export const serviceTypes = ["simple", "form"] as const;
export type ServiceType = (typeof serviceTypes)[number];

export const serviceTypeLabels: Record<ServiceType, string> = {
  simple: "Simples (Upload de planilha)",
  form: "Formulário personalizado",
};

export const serviceFormSchema = z.object({
  title: z.string().min(3, "O título deve ter no mínimo 3 caracteres"),
  slug: z
    .string()
    .min(3, "O slug deve ter no mínimo 3 caracteres")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug deve conter apenas letras minúsculas, números e hífens",
    ),
  description: z.string().optional(),
  basePrice: z.string().min(1, "O valor base é obrigatório"),
  isActive: z.boolean(),
  type: z.enum(serviceTypes),
  requiresDocument: z.boolean(),
});

export const createServiceSchema = serviceFormSchema;

export const updateServiceSchema = serviceFormSchema.partial().extend({
  id: z.string().uuid("ID inválido"),
});

export type ServiceFormData = z.infer<typeof serviceFormSchema>;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
