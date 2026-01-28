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
import { formField } from "./form-field.schema";

// Tipo de serviço para controle de fluxo
export const serviceTypeEnum = pgEnum("service_type", [
  "simple", // Serviços simples (limpa nome) - permite upload de planilha
  "form", // Serviços com formulário personalizado (rating)
]);

export const services = pgTable("services", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  basePrice: numeric("base_price", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  type: serviceTypeEnum("type").default("simple").notNull(),
  requiresDocument: boolean("requires_document").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const servicesRelations = relations(services, ({ many }) => ({
  formFields: many(formField),
}));

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
export type ServiceType = "simple" | "form";
