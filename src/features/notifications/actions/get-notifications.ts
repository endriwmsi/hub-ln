"use server";

import { and, desc, eq } from "drizzle-orm";
import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import { notification } from "@/core/db/schema";
import type { ActionResponse } from "@/shared/lib/server-actions";
import type { Notification } from "../types";

type GetNotificationsResult = {
  notifications: Notification[];
  unreadCount: number;
};

/**
 * Obtém as notificações do usuário logado
 */
export async function getNotifications(
  limit = 10,
): Promise<ActionResponse<GetNotificationsResult>> {
  try {
    const session = await verifySession();

    // Buscar notificações ordenadas por data
    const notifications = await db
      .select()
      .from(notification)
      .where(eq(notification.userId, session.userId))
      .orderBy(desc(notification.createdAt))
      .limit(limit);

    // Contar não lidas
    const unreadNotifications = await db
      .select()
      .from(notification)
      .where(
        and(
          eq(notification.userId, session.userId),
          eq(notification.read, false),
        ),
      );

    return {
      success: true,
      data: {
        notifications: notifications as Notification[],
        unreadCount: unreadNotifications.length,
      },
    };
  } catch (error) {
    console.error("[Notifications] Error getting notifications:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao buscar notificações",
    };
  }
}
