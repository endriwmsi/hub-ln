"use server";

import { eq } from "drizzle-orm";
import { db } from "@/core/db";
import { user as userSchema } from "@/core/db/schema";
import { auth } from "@/lib/auth";
import { sendPasswordResetEmailAction } from "./send-password-reset-email";

export async function adminSendPasswordResetAction({
  userEmail,
}: {
  userEmail: string;
}) {
  try {
    // Validar que quem está executando é um admin
    const session = await auth.api.getSession({
      headers: await import("next/headers").then((m) => m.headers()),
    });

    if (!session) {
      return {
        success: false,
        message: "Você precisa estar autenticado para executar esta ação.",
      };
    }

    // TODO: Adicionar verificação de role admin quando implementado
    // if (session.user.role !== 'admin') {
    //   return {
    //     success: false,
    //     message: "Você não tem permissão para executar esta ação.",
    //   };
    // }

    // Buscar usuário no banco de dados
    const [targetUser] = await db
      .select()
      .from(userSchema)
      .where(eq(userSchema.email, userEmail))
      .limit(1);

    if (!targetUser) {
      return {
        success: false,
        message: `Usuário com email ${userEmail} não encontrado.`,
      };
    }

    // Gerar token de redefinição de senha
    // O Better Auth gerencia os tokens automaticamente através da tabela verification
    const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";

    // Criar um token de verificação para redefinição de senha
    // O Better Auth usa o endpoint /api/auth/reset-password para processar isso
    const resetToken = await generatePasswordResetToken(targetUser.email);

    if (!resetToken) {
      return {
        success: false,
        message: "Erro ao gerar token de redefinição.",
      };
    }

    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

    const emailResult = await sendPasswordResetEmailAction({
      to: targetUser.email,
      resetLink,
      userName: targetUser.name,
    });

    if (!emailResult.success) {
      return {
        success: false,
        message: emailResult.message,
      };
    }

    return {
      success: true,
      message: `Email de redefinição de senha enviado com sucesso para ${userEmail}`,
    };
  } catch (error) {
    console.error("adminSendPasswordResetAction error:", error);
    return {
      success: false,
      message: "Erro ao processar solicitação de redefinição de senha.",
    };
  }
}

/**
 * Função auxiliar para gerar token de redefinição de senha
 * Usa a mesma lógica do Better Auth para manter compatibilidade
 */
async function generatePasswordResetToken(
  email: string,
): Promise<string | null> {
  try {
    // Gerar token único
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expira em 1 hora

    // Importar schema de verificação
    const { verification } = await import("@/core/db/schema");

    // Salvar token no banco de dados
    await db.insert(verification).values({
      id: crypto.randomUUID(),
      identifier: email,
      value: token,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return token;
  } catch (error) {
    console.error("Error generating password reset token:", error);
    return null;
  }
}

/**
 * Action para listar solicitações de redefinição pendentes
 * Útil para o admin ver quem solicitou redefinição de senha
 */
export async function adminListPasswordResetRequestsAction() {
  try {
    const session = await auth.api.getSession({
      headers: await import("next/headers").then((m) => m.headers()),
    });

    if (!session) {
      return {
        success: false,
        message: "Você precisa estar autenticado para executar esta ação.",
        data: null,
      };
    }

    // TODO: Adicionar verificação de role admin

    const { verification } = await import("@/core/db/schema");
    const { gt } = await import("drizzle-orm");

    // Buscar tokens de verificação que ainda não expiraram
    const pendingResets = await db
      .select({
        email: verification.identifier,
        createdAt: verification.createdAt,
        expiresAt: verification.expiresAt,
      })
      .from(verification)
      .where(gt(verification.expiresAt, new Date()))
      .orderBy(verification.createdAt);

    return {
      success: true,
      message: "Lista de solicitações recuperada com sucesso.",
      data: pendingResets,
    };
  } catch (error) {
    console.error("adminListPasswordResetRequestsAction error:", error);
    return {
      success: false,
      message: "Erro ao recuperar lista de solicitações.",
      data: null,
    };
  }
}
