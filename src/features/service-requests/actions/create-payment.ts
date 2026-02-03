"use server";

import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import { serviceRequest, user } from "@/core/db/schema";
import { asaas } from "@/lib/asaas";
import type { ActionResponse } from "@/shared/lib/server-actions";

export type CreatePixPaymentResult = {
  paymentId: string;
  qrCodeImage: string; // Base64 encoded image
  qrCodePayload: string; // Pix copia e cola
  expirationDate: string;
  totalValue: number;
  serviceRequestIds: string[];
};

/**
 * Cria um pagamento Pix para múltiplas solicitações de serviço
 * O pagamento é feito diretamente para o admin (usuário 01)
 */
export async function createPixPaymentForRequests(
  requestIds: string[],
): Promise<ActionResponse<CreatePixPaymentResult>> {
  console.log("[Payment] ====== INICIANDO CRIAÇÃO DE PAGAMENTO ======");
  console.log("[Payment] IDs recebidos:", requestIds);
  console.log("[Payment] Quantidade de IDs:", requestIds.length);

  try {
    const session = await verifySession();
    console.log("[Payment] Sessão verificada. User ID:", session.userId);

    if (!requestIds.length) {
      return { success: false, error: "Nenhum envio selecionado" };
    }

    // Buscar as solicitações
    console.log("[Payment] Buscando solicitações no banco...");
    const requests = await db
      .select({
        id: serviceRequest.id,
        userId: serviceRequest.userId,
        totalPrice: serviceRequest.totalPrice,
        paid: serviceRequest.paid,
        asaasPaymentId: serviceRequest.asaasPaymentId,
      })
      .from(serviceRequest)
      .where(inArray(serviceRequest.id, requestIds));

    console.log("[Payment] Solicitações encontradas:", {
      count: requests.length,
      data: requests.map((r) => ({
        id: r.id,
        totalPrice: r.totalPrice,
        paid: r.paid,
      })),
    });

    if (requests.length === 0) {
      return { success: false, error: "Nenhuma solicitação encontrada" };
    }

    // Verificar se todas pertencem ao usuário
    const notOwned = requests.filter((r) => r.userId !== session.userId);
    if (notOwned.length > 0) {
      return {
        success: false,
        error: "Você não tem permissão para pagar essas solicitações",
      };
    }

    // Verificar se já estão pagas
    const alreadyPaid = requests.filter((r) => r.paid);
    if (alreadyPaid.length > 0) {
      return {
        success: false,
        error: "Algumas solicitações já estão pagas",
      };
    }

    // Verificar se TODOS os envios selecionados têm o MESMO asaasPaymentId
    // Só reutiliza o pagamento se for exatamente o mesmo para todos
    const withPayment = requests.filter((r) => r.asaasPaymentId);
    const uniquePaymentIds = [
      ...new Set(withPayment.map((r) => r.asaasPaymentId)),
    ];

    // Se todos os envios selecionados têm o mesmo pagamento existente, reutilizar
    if (
      withPayment.length === requests.length &&
      uniquePaymentIds.length === 1 &&
      uniquePaymentIds[0]
    ) {
      const existingPaymentId = uniquePaymentIds[0];
      try {
        const qrCode = await asaas.getPixQrCode(existingPaymentId);
        const payment = await asaas.getPayment(existingPaymentId);

        // Verificar se o valor bate com o total atual
        const expectedTotal = requests.reduce(
          (acc, r) => acc + parseFloat(r.totalPrice),
          0,
        );

        // Se o valor do pagamento existente é diferente, criar novo
        if (Math.abs(payment.value - expectedTotal) > 0.01) {
          console.log(
            "[Payment] Valor do pagamento existente não bate, criando novo...",
            { existingValue: payment.value, expectedTotal },
          );
        } else {
          return {
            success: true,
            data: {
              paymentId: existingPaymentId,
              qrCodeImage: qrCode.encodedImage,
              qrCodePayload: qrCode.payload,
              expirationDate: qrCode.expirationDate,
              totalValue: payment.value,
              serviceRequestIds: requestIds,
            },
          };
        }
      } catch {
        // Se falhar ao buscar, criar novo pagamento
        console.log("[Payment] Pagamento existente inválido, criando novo...");
      }
    }

    // Calcular valor total
    const totalValue = requests.reduce(
      (acc, r) => acc + parseFloat(r.totalPrice),
      0,
    );

    console.log("[Payment] Calculando pagamento:", {
      requestIds,
      requestCount: requests.length,
      individualPrices: requests.map((r) => ({
        id: r.id,
        price: r.totalPrice,
      })),
      totalValue,
    });

    // Buscar dados do usuário
    const userData = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        cnpj: user.cnpj,
        phone: user.phone,
      })
      .from(user)
      .where(eq(user.id, session.userId))
      .limit(1);

    if (!userData[0]) {
      return { success: false, error: "Usuário não encontrado" };
    }

    const currentUser = userData[0];

    // Criar ou buscar cliente no Asaas
    const customer = await asaas.getOrCreateCustomer({
      name: currentUser.name,
      email: currentUser.email,
      cpfCnpj: currentUser.cpf || currentUser.cnpj,
      phone: currentUser.phone || undefined,
      externalReference: currentUser.id,
    });

    // Criar a cobrança Pix
    // External reference: IDs das solicitações separados por vírgula
    const externalReference = requestIds.join(",");

    const payment = await asaas.createPixPayment({
      customerId: customer.id,
      value: totalValue,
      description: `Pagamento de ${requests.length} envio(s) - HUB-LN`,
      externalReference,
    });

    // Obter QR Code
    const qrCode = await asaas.getPixQrCode(payment.id);

    // Atualizar solicitações com o ID do pagamento
    await db
      .update(serviceRequest)
      .set({
        asaasPaymentId: payment.id,
        asaasCustomerId: customer.id,
        paymentStatus: "pending",
      })
      .where(inArray(serviceRequest.id, requestIds));

    revalidatePath("/envios");

    return {
      success: true,
      data: {
        paymentId: payment.id,
        qrCodeImage: qrCode.encodedImage,
        qrCodePayload: qrCode.payload,
        expirationDate: qrCode.expirationDate,
        totalValue,
        serviceRequestIds: requestIds,
      },
    };
  } catch (error) {
    console.error("[Payment] Erro ao criar pagamento:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao processar pagamento",
    };
  }
}

export type CheckPaymentStatusResult = {
  paymentId: string;
  status: "pending" | "confirmed" | "overdue" | "refunded" | "failed";
  isPaid: boolean;
};

/**
 * Verifica o status de um pagamento no Asaas
 */
export async function checkPaymentStatus(
  paymentId: string,
): Promise<ActionResponse<CheckPaymentStatusResult>> {
  try {
    await verifySession();

    const payment = await asaas.getPayment(paymentId);

    // Mapear status do Asaas para nosso status
    let status: CheckPaymentStatusResult["status"] = "pending";
    let isPaid = false;

    switch (payment.status) {
      case "RECEIVED":
      case "CONFIRMED":
      case "RECEIVED_IN_CASH":
        status = "confirmed";
        isPaid = true;
        break;
      case "OVERDUE":
        status = "overdue";
        break;
      case "REFUNDED":
      case "REFUND_REQUESTED":
      case "REFUND_IN_PROGRESS":
        status = "refunded";
        break;
      case "PENDING":
      case "AWAITING_RISK_ANALYSIS":
        status = "pending";
        break;
      default:
        status = "pending";
    }

    return {
      success: true,
      data: {
        paymentId,
        status,
        isPaid,
      },
    };
  } catch (error) {
    console.error("[Payment] Erro ao verificar status:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro ao verificar status do pagamento",
    };
  }
}

/**
 * Obtém novo QR Code para um pagamento existente
 */
export async function getPaymentQrCode(paymentId: string): Promise<
  ActionResponse<{
    qrCodeImage: string;
    qrCodePayload: string;
    expirationDate: string;
  }>
> {
  try {
    await verifySession();

    const qrCode = await asaas.getPixQrCode(paymentId);

    return {
      success: true,
      data: {
        qrCodeImage: qrCode.encodedImage,
        qrCodePayload: qrCode.payload,
        expirationDate: qrCode.expirationDate,
      },
    };
  } catch (error) {
    console.error("[Payment] Erro ao obter QR Code:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao obter QR Code",
    };
  }
}
