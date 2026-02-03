import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { acao } from "./acao.schema";
import { services } from "./service.schema";
import { user } from "./user.schema";

// Status da solicitação de serviço
export const serviceRequestStatusEnum = pgEnum("service_request_status", [
  "pending", // Aguardando processamento
  "processing", // Em processamento
  "completed", // Concluído
  "cancelled", // Cancelado
  "rejected", // Rejeitado
]);

// Status de pagamento (Asaas)
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending", // Aguardando pagamento
  "confirmed", // Pagamento confirmado
  "overdue", // Vencido
  "refunded", // Estornado
  "failed", // Falhou
]);

// Status individual de cada item/nome no envio
export const itemStatusEnum = pgEnum("item_status", [
  "aguardando", // Aguardando processamento (padrão)
  "baixas_completas", // Baixas completas
  "baixas_negadas", // Baixas negadas
]);

// Tabela de solicitações de serviço
export const serviceRequest = pgTable("service_request", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),

  // Vínculos
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  serviceId: text("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),
  acaoId: text("acao_id").references(() => acao.id, { onDelete: "restrict" }),

  // Dados do formulário preenchido (JSON dinâmico)
  formData: jsonb("form_data").$type<Record<string, unknown>>().notNull(),

  // Documentos anexados (array de URLs do S3)
  documents: jsonb("documents")
    .$type<
      Array<{
        url: string;
        name: string;
        type: string;
        size: number;
        uploadedAt: string;
      }>
    >()
    .default([]),

  // Quantidade de itens (para precificação)
  quantity: integer("quantity").default(1).notNull(),

  // Valor total calculado
  totalPrice: numeric("total_price", { precision: 10, scale: 2 }).notNull(),

  // Status e processamento
  status: serviceRequestStatusEnum("status").default("pending").notNull(),
  notes: text("notes"), // Observações do admin
  processedAt: timestamp("processed_at"),
  processedById: text("processed_by_id").references(() => user.id),

  // Pagamento
  paid: boolean("paid").default(false).notNull(),
  paidAt: timestamp("paid_at"),

  // Integração Asaas
  asaasPaymentId: text("asaas_payment_id"), // ID da cobrança no Asaas
  asaasCustomerId: text("asaas_customer_id"), // ID do cliente no Asaas
  paymentStatus: paymentStatusEnum("payment_status").default("pending"),

  // Status individual dos itens (para envios em lote)
  // Array de objetos com: { nome, documento, status }
  itemsStatus: jsonb("items_status")
    .$type<
      Array<{
        nome: string;
        documento: string;
        status: "aguardando" | "baixas_completas" | "baixas_negadas";
        observacao?: string;
        processedAt?: string;
      }>
    >()
    .default([]),

  // Metadados
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const serviceRequestRelations = relations(serviceRequest, ({ one }) => ({
  user: one(user, {
    fields: [serviceRequest.userId],
    references: [user.id],
  }),
  service: one(services, {
    fields: [serviceRequest.serviceId],
    references: [services.id],
  }),
  acao: one(acao, {
    fields: [serviceRequest.acaoId],
    references: [acao.id],
  }),
  processedBy: one(user, {
    fields: [serviceRequest.processedById],
    references: [user.id],
    relationName: "processedRequests",
  }),
}));

export type ServiceRequest = typeof serviceRequest.$inferSelect;
export type NewServiceRequest = typeof serviceRequest.$inferInsert;
export type ServiceRequestStatus =
  | "pending"
  | "processing"
  | "completed"
  | "cancelled"
  | "rejected";

export type PaymentStatus =
  | "pending"
  | "confirmed"
  | "overdue"
  | "refunded"
  | "failed";

export type ItemStatus = "aguardando" | "baixas_completas" | "baixas_negadas";

export type ServiceRequestItem = {
  nome: string;
  documento: string;
  status: ItemStatus;
  observacao?: string;
  processedAt?: string;
};
