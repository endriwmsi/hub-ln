"use server";

import { checkPixQrCode } from "@/lib/abacatepay";

function hasError(
  response: { error: string } | { error: null; data: unknown },
): response is { error: string } {
  return response.error !== null;
}

export async function checkPaymentStatus(billingId: string) {
  try {
    const pixQrCodeResult = await checkPixQrCode(billingId);

    if (hasError(pixQrCodeResult)) {
      console.error(
        "Erro ao verificar status do pagamento:",
        pixQrCodeResult.error,
      );

      // Se for rate limiting, retornar mensagem específica
      if (
        typeof pixQrCodeResult.error === "string" &&
        pixQrCodeResult.error.toLowerCase().includes("too many")
      ) {
        return {
          success: false,
          message: "Muitas requisições. Por favor, aguarde alguns segundos.",
        };
      }

      return {
        success: false,
        message: "Erro ao verificar status do pagamento",
      };
    }

    const pixQrCode = pixQrCodeResult.data;

    return {
      success: true,
      data: {
        status: pixQrCode.status,
        paidAt: pixQrCode.createdAt, // Use createdAt como fallback
      },
    };
  } catch (error) {
    console.error("Erro ao verificar pagamento:", error);

    // Verificar se é erro de rate limiting (JSON parse error)
    if (error instanceof SyntaxError && error.message.includes("Too many")) {
      return {
        success: false,
        message: "Muitas requisições. Por favor, aguarde alguns segundos.",
      };
    }

    return {
      success: false,
      message: "Erro ao verificar pagamento",
    };
  }
}
