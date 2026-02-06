"use server";

import { db } from "@/core/db";
import { notification } from "@/core/db/schema";
import type { NotificationType } from "../types";

/**
 * Cria uma notificação para um usuário
 * Uso interno - não expor diretamente
 */
export async function createNotification(data: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  relatedId?: string;
}): Promise<void> {
  await db.insert(notification).values({
    userId: data.userId,
    type: data.type,
    title: data.title,
    message: data.message,
    link: data.link,
    relatedId: data.relatedId,
  });
}
