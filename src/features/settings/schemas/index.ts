import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  email: z
    .email("Email inválido")
    .max(100, "Email deve ter no máximo 100 caracteres"),
  phone: z
    .string()
    .min(10, "Telefone deve ter pelo menos 10 dígitos")
    .max(20, "Telefone deve ter no máximo 20 dígitos"),
});

export const updatePixKeySchema = z.object({
  key: z
    .string()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
});

export const updatePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, "Senha deve ter pelo menos 8 caracteres"),
    newPassword: z
      .string()
      .min(8, "Nova senha deve ter pelo menos 8 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Senha deve conter letras maiúsculas, minúsculas e números",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export const updateAddressSchema = z.object({
  street: z.string().min(3, "Rua deve ter pelo menos 3 caracteres").optional(),
  number: z.string().max(10, "Número muito longo").optional(),
  complement: z.string().optional(),
  neighborhood: z
    .string()
    .min(3, "Bairro deve ter pelo menos 3 caracteres")
    .optional(),
  city: z.string().min(3, "Cidade deve ter pelo menos 3 caracteres").optional(),
  uf: z
    .string()
    .length(2, "UF deve ter 2 caracteres")
    .regex(/^[A-Z]{2}$/, "UF deve conter apenas letras maiúsculas")
    .optional(),
  cep: z
    .string()
    .length(8, "CEP deve ter 8 dígitos")
    .regex(/^[0-9]{8}$/, "CEP deve conter apenas números")
    .optional(),
});

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
export type UpdatePixKeyInput = z.infer<typeof updatePixKeySchema>;
