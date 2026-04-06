"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import type { ServiceRequest } from "@/core/db/schema";
import {
  serviceRequest,
  services,
} from "@/core/db/schema";
import { recordCouponUsage } from "@/features/coupons";
import { getUserServicePrices } from "@/features/services/actions/get-user-service-prices";
import type { ActionResponse } from "@/shared/lib/server-actions";
import {
  type CreateServiceRequestInput,
  createServiceRequestSchema,
} from "../schemas";

export async function createServiceRequest(
  input: CreateServiceRequestInput,
): Promise<ActionResponse<ServiceRequest>> {
  try {
    const session = await verifySession();
    const validatedInput = createServiceRequestSchema.parse(input);

    // Buscar serviço para calcular preço
    const service = await db
      .select()
      .from(services)
      .where(eq(services.id, validatedInput.serviceId))
      .limit(1);

    if (!service[0]) {
      return { success: false, error: "Serviço não encontrado" };
    }

    // Determinar preço a usar via get-user-service-prices que resolve toda a cascata
    let unitPrice = Number(service[0].basePrice);

    const userPricesResult = await getUserServicePrices();
    if (userPricesResult.success && userPricesResult.data) {
      const resolvedService = userPricesResult.data.find(
        (s) => s.id === validatedInput.serviceId,
      );
      if (resolvedService) {
        unitPrice = Number(resolvedService.costPrice);
      }
    }

    // Aplicar desconto do cupom se fornecido
    let finalUnitPrice = unitPrice;
    let totalDiscountAmount = 0;

    if (validatedInput.discountAmount && validatedInput.discountAmount > 0) {
      // O desconto já foi calculado no frontend, usar o valor fornecido
      totalDiscountAmount = validatedInput.discountAmount;
      finalUnitPrice =
        unitPrice - totalDiscountAmount / (validatedInput.quantity || 1);
    }

    // Calcular preço total
    const totalPrice = finalUnitPrice * (validatedInput.quantity || 1);

    const newRequest = await db
      .insert(serviceRequest)
      .values({
        userId: session.userId,
        serviceId: validatedInput.serviceId,
        acaoId: validatedInput.acaoId,
        formData: validatedInput.formData,
        documents: validatedInput.documents || [],
        quantity: validatedInput.quantity || 1,
        totalPrice: totalPrice.toFixed(2),
        status: "pending",
        couponCode: validatedInput.couponCode,
        discountAmount:
          totalDiscountAmount > 0 ? totalDiscountAmount.toFixed(2) : null,
      })
      .returning();

    // Registrar uso do cupom se aplicado
    if (validatedInput.couponId && totalDiscountAmount > 0) {
      await recordCouponUsage(
        validatedInput.couponId,
        newRequest[0].id,
        totalDiscountAmount,
      );
    }

    revalidatePath("/envios");
    revalidatePath("/configuracoes/solicitacoes");

    return { success: true, data: newRequest[0] };
  } catch (error) {
    console.error("Erro ao criar solicitação:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Erro ao criar solicitação" };
  }
}
