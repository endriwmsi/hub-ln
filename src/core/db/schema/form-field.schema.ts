import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { services } from "./service.schema";

// Tipos de campos suportados
export const fieldTypeEnum = pgEnum("field_type", [
  "text",
  "email",
  "phone",
  "cpf",
  "cnpj",
  "number",
  "currency",
  "select",
  "textarea",
  "file",
  "date",
  "address",
  "city",
  "state",
]);

// Tabela de campos de formulário
export const formField = pgTable("form_field", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),

  // Vínculo com serviço
  serviceId: text("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),

  // Configurações do campo
  name: text("name").notNull(), // nome técnico (ex: "fullName")
  label: text("label").notNull(), // label exibido (ex: "Nome Completo")
  placeholder: text("placeholder"),
  type: fieldTypeEnum("type").notNull().default("text"),
  required: boolean("required").default(false).notNull(),
  order: integer("order").default(0).notNull(),

  // Validações e opções extras (JSON)
  // Para select: { options: [{ value: "...", label: "..." }] }
  // Para text: { minLength: 0, maxLength: 100, pattern: "regex" }
  // Para file: { accept: ".pdf,.jpg", maxSize: 5242880 }
  options: jsonb("options").$type<Record<string, unknown>>(),

  // Metadados
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const formFieldRelations = relations(formField, ({ one }) => ({
  service: one(services, {
    fields: [formField.serviceId],
    references: [services.id],
  }),
}));

export type FormField = typeof formField.$inferSelect;
export type NewFormField = typeof formField.$inferInsert;
export type FieldType =
  | "text"
  | "email"
  | "phone"
  | "cpf"
  | "cnpj"
  | "number"
  | "currency"
  | "select"
  | "textarea"
  | "file"
  | "date"
  | "address"
  | "city"
  | "state";
