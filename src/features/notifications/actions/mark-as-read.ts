"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import { notification } from "@/core/db/schema";
import type { ActionResponse } from "@/shared/lib/server-actions";

/**
 * Marca notificações como lidas
 */
export async function markNotificationsAsRead(
  ids?: string[],
): Promise<ActionResponse<{ marked: number }>> {
  try {
    const session = await verifySession();

    if (ids && ids.length > 0) {
      // Marcar notificações específicas
      await db
        .update(notification)
        .set({
          read: true,
          readAt: new Date(),
        })
        .where(
          and(
            eq(notification.userId, session.userId),
            inArray(notification.id, ids),
          ),
        );

      revalidatePath("/");

      return {
        success: true,
        data: { marked: ids.length },
      };
    }

    // Marcar todas como lidas
    const result = await db
      .update(notification)
      .set({
        read: true,
        readAt: new Date(),
      })
      .where(
        and(
          eq(notification.userId, session.userId),
          eq(notification.read, false),
        ),
      );

    revalidatePath("/");

    return {
      success: true,
      data: { marked: result.rowCount || 0 },
    };
  } catch (error) {
    console.error("[Notifications] Error marking as read:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao marcar notificações",
    };
  }
}
