import { relations } from "drizzle-orm";
import {
  boolean,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { services } from "./service.schema";
import { serviceRequest } from "./service-request.schema";
import { user } from "./user.schema";

// Status da comissão
export const commissionStatusEnum = pgEnum("commission_status", [
  "pending", // Pendente (aguardando pagamento do envio)
  "available", // Disponível para saque
  "paid", // Pago ao usuário
  "cancelled", // Cancelado (estorno ou erro)
]);

// Tabela de comissões
// Registra comissões geradas para cada usuário na cadeia de indicações
export const commission = pgTable("commission", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),

  // Usuário que recebe a comissão
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  // Solicitação de serviço relacionada
  serviceRequestId: text("service_request_id")
    .notNull()
    .references(() => serviceRequest.id, { onDelete: "cascade" }),

  // Usuário que fez o pagamento (quem comprou o serviço)
  payerUserId: text("payer_user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  // Valor da comissão
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),

  // Status da comissão
  status: commissionStatusEnum("status").default("pending").notNull(),

  // Descrição (ex: "Comissão de revenda - Limpa Nome")
  description: text("description"),

  // Nível na cadeia de indicação (1 = direto, 2 = segundo nível, etc)
  level: text("level").default("1").notNull(),

  // Data de disponibilização (quando pode ser sacado)
  availableAt: timestamp("available_at"),

  // Data de pagamento ao usuário
  paidAt: timestamp("paid_at"),

  // Metadados
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const commissionRelations = relations(commission, ({ one }) => ({
  user: one(user, {
    fields: [commission.userId],
    references: [user.id],
    relationName: "receivedCommissions",
  }),
  serviceRequest: one(serviceRequest, {
    fields: [commission.serviceRequestId],
    references: [serviceRequest.id],
  }),
  payer: one(user, {
    fields: [commission.payerUserId],
    references: [user.id],
    relationName: "paidCommissions",
  }),
}));

export type Commission = typeof commission.$inferSelect;
export type NewCommission = typeof commission.$inferInsert;
export type CommissionStatus = "pending" | "available" | "paid" | "cancelled";

// Tabela para configuração de preços por revendedor
// Permite que cada usuário defina seu próprio preço de revenda
export const userServicePrice = pgTable("user_service_price", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),

  // Usuário que definiu o preço
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  // Serviço
  serviceId: text("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),

  // Preço de revenda definido pelo usuário
  // Se o preço base é R$100, este usuário pode revender por R$150
  // Pode ser null se foi invalidado por mudança de preço do indicador
  resalePrice: numeric("resale_price", { precision: 10, scale: 2 }),

  // Preço que este usuário paga (preço do indicador ou preço base)
  costPrice: numeric("cost_price", { precision: 10, scale: 2 }).notNull(),

  // Ativo
  isActive: boolean("is_active").default(true).notNull(),

  // Metadados
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type UserServicePrice = typeof userServicePrice.$inferSelect;
export type NewUserServicePrice = typeof userServicePrice.$inferInsert;

// Tabela de saldo do usuário (para comissões)
export const userBalance = pgTable("user_balance", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),

  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),

  // Saldo disponível para saque
  availableBalance: numeric("available_balance", {
    precision: 10,
    scale: 2,
  })
    .default("0")
    .notNull(),

  // Saldo pendente (comissões aguardando confirmação)
  pendingBalance: numeric("pending_balance", { precision: 10, scale: 2 })
    .default("0")
    .notNull(),

  // Total já sacado
  totalWithdrawn: numeric("total_withdrawn", { precision: 10, scale: 2 })
    .default("0")
    .notNull(),

  // Metadados
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const userBalanceRelations = relations(userBalance, ({ one }) => ({
  user: one(user, {
    fields: [userBalance.userId],
    references: [user.id],
  }),
}));

export type UserBalance = typeof userBalance.$inferSelect;
export type NewUserBalance = typeof userBalance.$inferInsert;
