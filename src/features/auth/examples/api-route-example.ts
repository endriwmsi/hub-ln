/**
 * EXEMPLO DE API ROUTE PARA FUNCIONALIDADES ADMIN
 *
 * Você pode criar este arquivo em:
 * src/app/api/admin/password-reset/route.ts
 */

import { type NextRequest, NextResponse } from "next/server";
import {
  adminListPasswordResetRequestsAction,
  adminSendPasswordResetAction,
} from "@/features/auth/actions/admin-password-reset";

/**
 * POST /api/admin/password-reset
 * Envia email de redefinição de senha para um usuário
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userEmail } = body;

    if (!userEmail) {
      return NextResponse.json(
        { success: false, message: "Email do usuário é obrigatório" },
        { status: 400 },
      );
    }

    const result = await adminSendPasswordResetAction({ userEmail });

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    console.error("POST /api/admin/password-reset error:", error);
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/admin/password-reset
 * Lista todas as solicitações pendentes de redefinição
 */
export async function GET() {
  try {
    const result = await adminListPasswordResetRequestsAction();

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    console.error("GET /api/admin/password-reset error:", error);
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

/**
 * EXEMPLO DE USO NO FRONTEND:
 *
 * // Enviar email de redefinição
 * const response = await fetch('/api/admin/password-reset', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ userEmail: 'usuario@exemplo.com' })
 * });
 * const result = await response.json();
 *
 * // Listar solicitações pendentes
 * const response = await fetch('/api/admin/password-reset');
 * const result = await response.json();
 */
