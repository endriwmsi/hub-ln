"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import { user } from "@/core/db/schema";
import { auth } from "@/lib/auth";
import type {
  UpdateAddressInput,
  UpdatePasswordInput,
  UpdateProfileSchema,
} from "../schemas";
import {
  updateAddressSchema,
  updatePasswordSchema,
  updateProfileSchema,
} from "../schemas";

export async function updateProfile(data: UpdateProfileSchema) {
  try {
    const { userId } = await verifySession();

    const validated = updateProfileSchema.parse(data);

    await db
      .update(user)
      .set({
        name: validated.name,
        email: validated.email,
        phone: validated.phone,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));

    revalidatePath("/configuracoes/perfil");
    revalidatePath("/", "layout");

    return {
      success: true,
      message: "Perfil atualizado com sucesso",
    };
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return {
      success: false,
      message: "Erro ao atualizar perfil",
    };
  }
}

export async function updatePassword(data: UpdatePasswordInput) {
  try {
    await verifySession();

    const validated = updatePasswordSchema.parse(data);

    // Verifica a senha atual usando better-auth
    const signInResult = await auth.api.signInEmail({
      body: {
        email: "", // Precisamos buscar o email do usuário
        password: validated.currentPassword,
      },
    });

    if (!signInResult) {
      return {
        success: false,
        message: "Senha atual incorreta",
      };
    }

    // Atualiza para a nova senha usando better-auth
    await auth.api.changePassword({
      body: {
        newPassword: validated.newPassword,
        currentPassword: validated.currentPassword,
        revokeOtherSessions: false,
      },
    });

    revalidatePath("/configuracoes/seguranca");

    return {
      success: true,
      message: "Senha atualizada com sucesso",
    };
  } catch (error) {
    console.error("Erro ao atualizar senha:", error);
    return {
      success: false,
      message:
        "Erro ao atualizar senha. Verifique se a senha atual está correta.",
    };
  }
}

export async function updateAddress(data: UpdateAddressInput) {
  try {
    const { userId } = await verifySession();

    const validated = updateAddressSchema.parse(data);

    await db
      .update(user)
      .set({
        street: validated.street,
        number: validated.number,
        complement: validated.complement,
        neighborhood: validated.neighborhood,
        city: validated.city,
        uf: validated.uf,
        cep: validated.cep,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));

    revalidatePath("/configuracoes/endereco");

    return {
      success: true,
      message: "Endereço atualizado com sucesso",
    };
  } catch (error) {
    console.error("Erro ao atualizar endereço:", error);
    return {
      success: false,
      message: "Erro ao atualizar endereço",
    };
  }
}
