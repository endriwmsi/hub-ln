"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import { coupon, couponUsage, user } from "@/core/db/schema";
import type { ActionResponse } from "@/shared/lib/server-actions";
import {
  type CreateCouponInput,
  createCouponSchema,
  type UpdateCouponInput,
  updateCouponSchema,
  type ValidateCouponInput,
  type ValidateCouponResponse,
  validateCouponSchema,
} from "../schemas";

// Criar cupom
export async function createCoupon(
  input: CreateCouponInput,
): Promise<ActionResponse<typeof coupon.$inferSelect>> {
  try {
    const session = await verifySession();
    const validatedInput = createCouponSchema.parse(input);

    // Verificar se código já existe
    const existingCoupon = await db.query.coupon.findFirst({
      where: eq(coupon.code, validatedInput.code),
    });

    if (existingCoupon) {
      return { success: false, error: "Este código de cupom já existe" };
    }

    const newCoupon = await db
      .insert(coupon)
      .values({
        ...validatedInput,
        discountValue: validatedInput.discountValue.toString(),
        createdBy: session.userId,
      })
      .returning();

    revalidatePath("/gerenciar-cupons");

    return { success: true, data: newCoupon[0] };
  } catch (error) {
    console.error("Erro ao criar cupom:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Erro ao criar cupom" };
  }
}

// Listar cupons do usuário
export async function getCoupons(): Promise<
  ActionResponse<Array<typeof coupon.$inferSelect & { usageCount: number }>>
> {
  try {
    const session = await verifySession();

    const coupons = await db.query.coupon.findMany({
      where: eq(coupon.createdBy, session.userId),
      orderBy: (coupon, { desc }) => [desc(coupon.createdAt)],
    });

    return { success: true, data: coupons };
  } catch (error) {
    console.error("Erro ao buscar cupons:", error);
    return { success: false, error: "Erro ao buscar cupons" };
  }
}

// Atualizar cupom
export async function updateCoupon(
  input: UpdateCouponInput,
): Promise<ActionResponse<typeof coupon.$inferSelect>> {
  try {
    const session = await verifySession();
    const validatedInput = updateCouponSchema.parse(input);

    // Verificar se cupom existe e pertence ao usuário
    const existingCoupon = await db.query.coupon.findFirst({
      where: and(
        eq(coupon.id, validatedInput.id),
        eq(coupon.createdBy, session.userId),
      ),
    });

    if (!existingCoupon) {
      return { success: false, error: "Cupom não encontrado" };
    }

    const { id, ...updateData } = validatedInput;
    const updatedCoupon = await db
      .update(coupon)
      .set(updateData)
      .where(eq(coupon.id, id))
      .returning();

    revalidatePath("/gerenciar-cupons");

    return { success: true, data: updatedCoupon[0] };
  } catch (error) {
    console.error("Erro ao atualizar cupom:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Erro ao atualizar cupom" };
  }
}

// Deletar cupom
export async function deleteCoupon(
  couponId: string,
): Promise<ActionResponse<void>> {
  try {
    const session = await verifySession();

    // Verificar se cupom existe e pertence ao usuário
    const existingCoupon = await db.query.coupon.findFirst({
      where: and(eq(coupon.id, couponId), eq(coupon.createdBy, session.userId)),
    });

    if (!existingCoupon) {
      return { success: false, error: "Cupom não encontrado" };
    }

    // Verificar se já foi usado
    const usage = await db.query.couponUsage.findFirst({
      where: eq(couponUsage.couponId, couponId),
    });

    if (usage) {
      return {
        success: false,
        error: "Não é possível deletar um cupom que já foi usado",
      };
    }

    await db.delete(coupon).where(eq(coupon.id, couponId));

    revalidatePath("/gerenciar-cupons");

    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar cupom:", error);
    return { success: false, error: "Erro ao deletar cupom" };
  }
}

// Validar cupom (para uso na solicitação de serviço)
export async function validateCoupon(
  input: ValidateCouponInput,
): Promise<ActionResponse<ValidateCouponResponse>> {
  try {
    const session = await verifySession();
    const validatedInput = validateCouponSchema.parse(input);

    // Buscar cupom
    const foundCoupon = await db.query.coupon.findFirst({
      where: eq(coupon.code, validatedInput.code.toUpperCase()),
      with: {
        creator: true,
      },
    });

    if (!foundCoupon) {
      return {
        success: true,
        data: { valid: false, error: "Cupom não encontrado" },
      };
    }

    // Verificar se está ativo
    if (!foundCoupon.active) {
      return {
        success: true,
        data: { valid: false, error: "Cupom inativo" },
      };
    }

    // Verificar datas de validade
    const now = new Date();
    if (foundCoupon.validFrom && new Date(foundCoupon.validFrom) > now) {
      return {
        success: true,
        data: { valid: false, error: "Cupom ainda não é válido" },
      };
    }
    if (foundCoupon.validUntil && new Date(foundCoupon.validUntil) < now) {
      return {
        success: true,
        data: { valid: false, error: "Cupom expirado" },
      };
    }

    // Verificar limite de uso
    if (
      foundCoupon.usageLimit &&
      foundCoupon.usageCount >= foundCoupon.usageLimit
    ) {
      return {
        success: true,
        data: { valid: false, error: "Cupom atingiu o limite de uso" },
      };
    }

    // Verificar hierarquia: cupom só pode ser usado por usuários na rede do criador
    const currentUser = await db.query.user.findFirst({
      where: eq(user.id, session.userId),
    });

    if (!currentUser) {
      return {
        success: true,
        data: { valid: false, error: "Usuário não encontrado" },
      };
    }

    // Buscar o criador do cupom
    const creator = await db.query.user.findFirst({
      where: eq(user.id, foundCoupon.createdBy),
    });

    if (!creator) {
      return {
        success: true,
        data: { valid: false, error: "Criador do cupom não encontrado" },
      };
    }

    // Verificar se o usuário pode usar este cupom
    const isAdmin = currentUser.role === "admin";
    const isCreator = currentUser.id === creator.id;

    // Criador não pode usar o próprio cupom
    if (isCreator) {
      return {
        success: true,
        data: {
          valid: false,
          error: "Você não pode usar seu próprio cupom",
        },
      };
    }

    // Verificar se está na hierarquia do criador (subir na árvore até encontrar o criador)
    let isInHierarchy = false;
    if (!isAdmin) {
      let checkUser = currentUser;
      const maxDepth = 50; // Prevenir loops infinitos
      let depth = 0;

      while (checkUser.referredBy && depth < maxDepth) {
        if (checkUser.referredBy === creator.referralCode) {
          isInHierarchy = true;
          break;
        }

        // Subir um nível na hierarquia
        const parentUser = await db.query.user.findFirst({
          where: eq(user.referralCode, checkUser.referredBy),
        });

        if (!parentUser) break;
        checkUser = parentUser;
        depth++;
      }
    }

    if (!isAdmin && !isInHierarchy) {
      return {
        success: true,
        data: {
          valid: false,
          error: "Este cupom não pode ser usado por você",
        },
      };
    }

    // Verificar se usuário já usou este cupom (se for singleUse)
    if (foundCoupon.singleUse) {
      const previousUse = await db.query.couponUsage.findFirst({
        where: and(
          eq(couponUsage.couponId, foundCoupon.id),
          eq(couponUsage.userId, session.userId),
        ),
      });

      if (previousUse) {
        return {
          success: true,
          data: { valid: false, error: "Você já usou este cupom" },
        };
      }
    }

    // Calcular desconto
    const discountValue = Number(foundCoupon.discountValue);
    let discountPerUnit = 0;

    if (foundCoupon.discountType === "percentage") {
      // Desconto em porcentagem - será calculado no momento do uso
      discountPerUnit = discountValue; // Armazena a porcentagem
    } else {
      // Desconto fixo por unidade
      discountPerUnit = discountValue;
    }

    const totalDiscount = discountPerUnit * validatedInput.quantity;

    return {
      success: true,
      data: {
        valid: true,
        coupon: {
          id: foundCoupon.id,
          code: foundCoupon.code,
          discountType: foundCoupon.discountType,
          discountValue: discountValue,
        },
        discountPerUnit,
        totalDiscount,
      },
    };
  } catch (error) {
    console.error("Erro ao validar cupom:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Erro ao validar cupom" };
  }
}

// Registrar uso de cupom
export async function recordCouponUsage(
  couponId: string,
  serviceRequestId: string,
  discountAmount: number,
): Promise<ActionResponse<void>> {
  try {
    const session = await verifySession();

    // Registrar uso
    await db.insert(couponUsage).values({
      couponId,
      userId: session.userId,
      serviceRequestId,
      discountAmount: discountAmount.toFixed(2),
    });

    // Incrementar contador de uso
    await db
      .update(coupon)
      .set({
        usageCount: await db
          .select({ count: couponUsage.couponId })
          .from(couponUsage)
          .where(eq(couponUsage.couponId, couponId))
          .then((result) => result.length),
      })
      .where(eq(coupon.id, couponId));

    return { success: true };
  } catch (error) {
    console.error("Erro ao registrar uso do cupom:", error);
    return { success: false, error: "Erro ao registrar uso do cupom" };
  }
}
