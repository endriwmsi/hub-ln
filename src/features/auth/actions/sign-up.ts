"use server";

import { APIError } from "better-auth/api";
import { eq, or } from "drizzle-orm";
import type z from "zod";
import { db } from "@/core/db";
import { subscription, user } from "@/core/db/schema";
import type { registerSchema } from "@/features/auth/schemas/register-schemas";
import { createCustomer } from "@/lib/abacatepay";
import { auth, type ErrorCode } from "@/lib/auth";
import {
  cleanCNPJ,
  cleanCPF,
  generateReferralCode,
  isValidCNPJ,
  isValidCPF,
} from "@/shared/lib/utils";

type formData = z.infer<typeof registerSchema> & {
  referredBy?: string | null;
};

export async function signUpEmailAction(data: formData) {
  try {
    const cleanedCPF = cleanCPF(data.cpf);
    const cleanedCNPJ = cleanCNPJ(data.cnpj);
    const cleanedCEP = data.cep.replace(/\D/g, "");

    const isCPFValid = isValidCPF(cleanedCPF);
    const isCNPJValid = isValidCNPJ(cleanedCNPJ);

    if (!isCPFValid) {
      return {
        error: "CPF inválido. Verifique os dígitos informados.",
      };
    }

    if (!isCNPJValid) {
      return {
        error: "CNPJ inválido. Verifique os dígitos informados.",
      };
    }

    const existingUser = await db
      .select({
        id: user.id,
        email: user.email,
        cpf: user.cpf,
        cnpj: user.cnpj,
      })
      .from(user)
      .where(
        or(
          eq(user.email, data.email),
          eq(user.cpf, cleanedCPF),
          eq(user.cnpj, cleanedCNPJ),
        ),
      )
      .limit(1);

    if (existingUser.length > 0) {
      const user = existingUser[0];

      if (user.email === data.email) {
        return { error: "Este e-mail já está sendo usado por outro usuário." };
      }

      if (user.cpf === cleanedCPF) {
        return { error: "Este CPF já está sendo usado por outro usuário." };
      }

      if (user.cnpj === cleanedCNPJ) {
        return { error: "Este CNPJ já está sendo usado por outro usuário." };
      }
    }

    // Gerar código de afiliado único
    let referralCode = generateReferralCode();
    let isUnique = false;

    // Garantir que o código é único
    while (!isUnique) {
      const existingCode = await db
        .select({ referralCode: user.referralCode })
        .from(user)
        .where(eq(user.referralCode, referralCode))
        .limit(1);

      if (existingCode.length === 0) {
        isUnique = true;
      } else {
        referralCode = generateReferralCode();
      }
    }

    // Validar código de indicação se fornecido
    let validReferredBy: string | undefined;

    if (data.referredBy) {
      const referrer = await db
        .select({ referralCode: user.referralCode })
        .from(user)
        .where(eq(user.referralCode, data.referredBy))
        .limit(1);

      if (referrer.length > 0) {
        validReferredBy = data.referredBy;
      }
    }

    const userData = {
      name: data.fullname,
      email: data.email,
      password: data.password,
      phone: data.phone,
      cpf: cleanedCPF,
      cnpj: cleanedCNPJ,
      street: data.street,
      number: data.number,
      complement: data.complement,
      neighborhood: data.neighborhood,
      city: data.city,
      uf: data.state,
      cep: cleanedCEP,
      referralCode,
      referredBy: validReferredBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const authResult = await auth.api.signUpEmail({
      body: userData,
    });

    if (!authResult) {
      return { error: "Erro ao criar usuário. Tente novamente." };
    }

    // Criar subscription com trial period
    const trialExpiresAt = new Date();
    trialExpiresAt.setDate(trialExpiresAt.getDate() + 5);

    await db.insert(subscription).values({
      userId: authResult.user.id,
      pixId: "",
      status: "trial",
      startDate: new Date(),
      endDate: trialExpiresAt,
      trialExpiresAt: trialExpiresAt,
    });

    // Tentar criar cliente no AbacatePay (não bloquear se falhar)
    try {
      const customerData = {
        name: data.fullname,
        cellphone: data.phone,
        email: data.email,
        cpf: cleanedCPF,
        cnpj: cleanedCNPJ,
      };

      const newCustomer = await createCustomer(customerData);

      // Verificar se houve erro na resposta do SDK
      if (newCustomer.error) {
        console.error(
          "Erro ao criar cliente na AbacatePay:",
          newCustomer.error,
        );
        // Não atualizar o customerId se houver erro
        return { error: null };
      }

      // Atualizar o customerId se sucesso
      if (newCustomer.data?.id) {
        await db
          .update(user)
          .set({ abacatePayCustomerId: newCustomer.data.id })
          .where(eq(user.email, data.email));
      }
    } catch (error) {
      console.error("Erro ao integrar com AbacatePay:", error);

      // Verificar se é erro de JSON parsing
      if (error instanceof SyntaxError) {
        console.error(
          "Erro de parsing JSON - resposta da API não é JSON válido",
        );
      }

      // Não impedir que o usuário seja criado
      // O customerId pode ser criado depois manualmente ou na primeira cobrança
    }

    return { error: null };
  } catch (error) {
    console.error("Erro capturado no signUpEmailAction:", error);

    if (error instanceof APIError) {
      const errorCode = error.body ? (error.body.code as ErrorCode) : "UNKNOWN";
      console.error("APIError code:", errorCode);

      switch (errorCode) {
        case "USER_ALREADY_EXISTS":
          return { error: "Oops! E-mail já cadastrado" };
        default:
          return { error: error.message };
      }
    }

    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      return { error: `Erro: ${error.message}` };
    }

    return { error: "Erro de servidor interno." };
  }
}
