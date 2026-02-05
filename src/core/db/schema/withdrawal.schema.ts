import { relations } from "drizzle-orm";
import { numeric, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { user } from "./user.schema";

// Status da solicitação de saque
export const withdrawalStatusEnum = pgEnum("withdrawal_status", [
  "pending", // Aguardando aprovação do admin
  "approved", // Aprovado
  "paid", // Pago
  "rejected", // Rejeitado
]);

// Tabela de solicitações de saque
export const withdrawal = pgTable("withdrawal", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),

  // Usuário que solicita o saque
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  // Valor do saque
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),

  // Status da solicitação
  status: withdrawalStatusEnum("status").default("pending").notNull(),

  // Data da solicitação
  requestedAt: timestamp("requested_at").defaultNow().notNull(),

  // Dados de processamento
  processedAt: timestamp("processed_at"),
  processedById: text("processed_by_id").references(() => user.id),
  notes: text("notes"), // Observações do admin

  // Metadados
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const withdrawalRelations = relations(withdrawal, ({ one }) => ({
  user: one(user, {
    fields: [withdrawal.userId],
    references: [user.id],
    relationName: "withdrawals",
  }),
  processedBy: one(user, {
    fields: [withdrawal.processedById],
    references: [user.id],
    relationName: "processedWithdrawals",
  }),
}));

export type Withdrawal = typeof withdrawal.$inferSelect;
export type NewWithdrawal = typeof withdrawal.$inferInsert;
export type WithdrawalStatus = "pending" | "approved" | "paid" | "rejected";
