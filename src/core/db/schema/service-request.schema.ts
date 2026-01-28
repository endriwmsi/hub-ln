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
