import { relations } from "drizzle-orm";
import { boolean, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { user } from "./user.schema";

// Tipos de notificação
export const notificationTypeEnum = pgEnum("notification_type", [
  "withdrawal_request", // Admin: usuário solicitou saque
  "withdrawal_approved", // Usuário: saque aprovado
  "withdrawal_paid", // Usuário: saque pago
  "withdrawal_rejected", // Usuário: saque rejeitado
  "commission_received", // Usuário: recebeu comissão
  "system", // Notificação do sistema
]);

// Tabela de notificações
export const notification = pgTable("notification", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),

  // Usuário que recebe a notificação
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  // Tipo da notificação
  type: notificationTypeEnum("type").notNull(),

  // Título e mensagem
  title: text("title").notNull(),
  message: text("message").notNull(),

  // Link opcional para redirecionar
  link: text("link"),

  // ID relacionado (ex: withdrawalId para notificações de saque)
  relatedId: text("related_id"),

  // Status de leitura
  read: boolean("read").default(false).notNull(),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  readAt: timestamp("read_at"),
});

export const notificationRelations = relations(notification, ({ one }) => ({
  user: one(user, {
    fields: [notification.userId],
    references: [user.id],
  }),
}));

export type Notification = typeof notification.$inferSelect;
export type NewNotification = typeof notification.$inferInsert;
export type NotificationType =
  | "withdrawal_request"
  | "withdrawal_approved"
  | "withdrawal_paid"
  | "withdrawal_rejected"
  | "commission_received"
  | "system";
