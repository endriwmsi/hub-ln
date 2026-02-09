import { and, eq, inArray, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/core/db";
import {
  commission,
  serviceRequest,
  user,
  userBalance,
  userServicePrice,
} from "@/core/db/schema";
import { asaas } from "@/lib/asaas";
import type {
  AsaasWebhookPayload,
  ProcessPaymentResult,
} from "@/shared/types/asaas";

export async function POST(request: NextRequest) {
  try {
    // Verificar se o request tem body
    if (!request.body) {
      console.error("[AsaasWebhook] No request body");
      return NextResponse.json(
        { error: "Missing request body" },
        { status: 400 },
      );
    }

    // Parse do payload
    let payload: unknown;
    try {
      payload = await request.json();
    } catch (parseError) {
      console.error("[AsaasWebhook] Error parsing JSON:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 },
      );
    }

    // Validar webhook
    const validation = asaas.validateWebhookPayload(payload);
    if (!validation.valid) {
      console.error(
        "[AsaasWebhook] Webhook validation failed:",
        validation.error,
      );
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const webhookData = validation.data;

    // Verificar se é evento de pagamento confirmado
    if (!asaas.isPaymentConfirmedEvent(webhookData.event)) {
      console.log(
        "[AsaasWebhook] Event is not a payment confirmation, skipping:",
        webhookData.event,
      );
      return NextResponse.json({
        success: true,
        message: "Event ignored",
        event: webhookData.event,
      });
    }

    // Processar pagamento confirmado
    const result = await processPaymentConfirmed(webhookData);

    if (!result.success) {
      console.error("[AsaasWebhook] Payment processing failed:", result);
      return NextResponse.json(
        {
          error: result.message,
          details: result.error,
        },
        { status: 500 },
      );
    }

    // Resposta de sucesso
    return NextResponse.json({
      success: true,
      message: "Payment processed successfully",
      paymentId: webhookData.payment.id,
      updatedRequests: result.updatedCount,
    });
  } catch (error) {
    console.error("[AsaasWebhook] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * Processa um pagamento confirmado
 * - Atualiza o status das solicitações para pago
 * - Calcula e cria comissões para a cadeia de indicações
 */
async function processPaymentConfirmed(
  webhookData: AsaasWebhookPayload,
): Promise<ProcessPaymentResult> {
  const { payment } = webhookData;
  const asaasPaymentId = payment.id;

  console.log("[AsaasWebhook] Processing payment confirmation:", {
    paymentId: asaasPaymentId,
    externalReference: payment.externalReference,
    status: payment.status,
    value: payment.value,
  });

  try {
    let requests = await db
      .select({
        id: serviceRequest.id,
        userId: serviceRequest.userId,
        totalPrice: serviceRequest.totalPrice,
        paid: serviceRequest.paid,
      })
      .from(serviceRequest)
      .where(eq(serviceRequest.asaasPaymentId, asaasPaymentId));

    // Estratégia 2: Fallback para externalReference se não encontrar pelo paymentId
    if (requests.length === 0 && payment.externalReference) {
      const requestIds = payment.externalReference.split(",").filter(Boolean);

      if (requestIds.length > 0) {
        requests = await db
          .select({
            id: serviceRequest.id,
            userId: serviceRequest.userId,
            totalPrice: serviceRequest.totalPrice,
            paid: serviceRequest.paid,
          })
          .from(serviceRequest)
          .where(inArray(serviceRequest.id, requestIds));
      }
    }

    if (requests.length === 0) {
      return {
        success: false,
        message: "No service requests found for the given payment",
      };
    }

    // Filtrar apenas as não pagas
    const unpaidRequests = requests.filter((r) => !r.paid);

    if (unpaidRequests.length === 0) {
      return {
        success: true,
        message: "All requests were already paid",
        updatedCount: 0,
        commissionsCreated: 0,
      };
    }

    const unpaidIds = unpaidRequests.map((r) => r.id);

    await db
      .update(serviceRequest)
      .set({
        paid: true,
        paidAt: new Date(),
        paymentStatus: "confirmed",
      })
      .where(inArray(serviceRequest.id, unpaidIds));

    // Verificar se realmente atualizou
    await db
      .select({
        id: serviceRequest.id,
        paid: serviceRequest.paid,
        paymentStatus: serviceRequest.paymentStatus,
        paidAt: serviceRequest.paidAt,
      })
      .from(serviceRequest)
      .where(inArray(serviceRequest.id, unpaidIds));

    // Processar comissões para cada solicitação
    let totalCommissions = 0;
    for (const request of unpaidRequests) {
      const commissionsCreated = await processCommissions(
        request.id,
        request.userId,
      );
      totalCommissions += commissionsCreated;
    }

    return {
      success: true,
      message: "Payment processed successfully",
      updatedCount: unpaidIds.length,
      commissionsCreated: totalCommissions,
    };
  } catch (error) {
    return {
      success: false,
      message: "Error processing payment",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Processa comissões para a cadeia de indicações
 *
 * Lógica:
 * - Admin (level 1) NÃO recebe comissão - ele é responsável pelo valor base
 * - A comissão de cada revendedor é: (resalePrice - costPrice) * quantity
 * - Só recebe comissão quem tem userServicePrice configurado
 */
async function processCommissions(
  serviceRequestId: string,
  payerUserId: string,
): Promise<number> {
  try {
    // Buscar dados da solicitação para obter serviceId e quantity
    const requestData = await db
      .select({
        serviceId: serviceRequest.serviceId,
        quantity: serviceRequest.quantity,
      })
      .from(serviceRequest)
      .where(eq(serviceRequest.id, serviceRequestId))
      .limit(1);

    if (!requestData[0]) {
      console.error(
        "[Commissions] Service request not found:",
        serviceRequestId,
      );
      return 0;
    }

    const { serviceId, quantity } = requestData[0];

    // Buscar dados do pagador (quem comprou)
    const payerData = await db
      .select({
        id: user.id,
        referredBy: user.referredBy,
      })
      .from(user)
      .where(eq(user.id, payerUserId))
      .limit(1);

    if (!payerData[0]) {
      return 0;
    }

    const payer = payerData[0];

    // Se o pagador não foi indicado por ninguém, não há comissões
    if (!payer.referredBy) {
      return 0;
    }

    // Buscar a cadeia de indicações
    let currentReferralCode: string | null = payer.referredBy;
    let commissionsCreated = 0;
    let level = 1;

    // Tipo para os dados do referrer
    type ReferrerData = {
      id: string;
      referralCode: string;
      referredBy: string | null;
      role: "user" | "admin";
    };

    // Percorrer a cadeia de indicações (máximo 10 níveis para evitar loop infinito)
    while (currentReferralCode && level <= 10) {
      // Buscar usuário pelo código de referência
      const referrerData: ReferrerData[] = await db
        .select({
          id: user.id,
          referralCode: user.referralCode,
          referredBy: user.referredBy,
          role: user.role,
        })
        .from(user)
        .where(eq(user.referralCode, currentReferralCode))
        .limit(1);

      if (!referrerData[0]) {
        break;
      }

      const referrer: ReferrerData = referrerData[0];

      // Admin NÃO recebe comissão - para a cadeia aqui
      if (referrer.role === "admin") {
        console.log(
          "[Commissions] Reached admin, stopping chain (no commission for admin)",
        );
        break;
      }

      // Buscar preço configurado para este usuário e serviço
      const priceConfig = await db
        .select({
          resalePrice: userServicePrice.resalePrice,
          costPrice: userServicePrice.costPrice,
        })
        .from(userServicePrice)
        .where(
          and(
            eq(userServicePrice.userId, referrer.id),
            eq(userServicePrice.serviceId, serviceId),
          ),
        )
        .limit(1);

      if (priceConfig[0]) {
        // Calcular comissão: (resalePrice - costPrice) * quantity
        const resalePrice = Number(priceConfig[0].resalePrice);
        const costPrice = Number(priceConfig[0].costPrice);
        const margin = resalePrice - costPrice;
        const commissionAmount = margin * quantity;

        if (commissionAmount > 0) {
          // Criar registro de comissão
          await db.insert(commission).values({
            userId: referrer.id,
            serviceRequestId: serviceRequestId,
            payerUserId: payerUserId,
            amount: commissionAmount.toFixed(2),
            status: "available",
            description: `Comissão de revenda - Margem R$ ${margin.toFixed(2)} x ${quantity} unidades`,
            level: level.toString(),
            availableAt: new Date(),
          });

          // Atualizar saldo do usuário
          await updateUserBalance(referrer.id, commissionAmount);

          commissionsCreated++;
          console.log(
            `[Commissions] Created commission for user ${referrer.id}: R$ ${commissionAmount.toFixed(2)}`,
          );
        }
      } else {
        console.log(
          `[Commissions] No price config for user ${referrer.id}, skipping`,
        );
      }

      // Próximo nível
      currentReferralCode = referrer.referredBy;
      level++;
    }

    return commissionsCreated;
  } catch (error) {
    console.error("[Commissions] Error processing commissions:", error);
    return 0;
  }
}

/**
 * Atualiza ou cria o saldo do usuário
 */
async function updateUserBalance(
  userId: string,
  amount: number,
): Promise<void> {
  // Tentar atualizar saldo existente
  const updated = await db
    .update(userBalance)
    .set({
      availableBalance: sql`${userBalance.availableBalance} + ${amount.toFixed(2)}`,
    })
    .where(eq(userBalance.userId, userId));

  // Se não existe, criar novo registro
  if ((updated as { rowCount?: number }).rowCount === 0) {
    await db.insert(userBalance).values({
      userId,
      availableBalance: amount.toFixed(2),
      pendingBalance: "0",
      totalWithdrawn: "0",
    });
  }
}
