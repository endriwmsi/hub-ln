import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { serviceRequest } from "./service-request.schema";
import { user } from "./user.schema";

// Tipo de desconto
export const discountTypeEnum = pgEnum("discount_type", [
  "percentage", // Desconto em porcentagem
  "fixed", // Valor fixo
]);

// Tabela de cupons
export const coupon = pgTable("coupon", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),

  // Código do cupom (único)
  code: text("code").notNull().unique(),

  // Tipo e valor do desconto
  discountType: discountTypeEnum("discount_type").notNull(),
  discountValue: numeric("discount_value", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),

  // Controle de uso
  usageLimit: integer("usage_limit"), // null = ilimitado
  usageCount: integer("usage_count").default(0).notNull(),
  singleUse: boolean("single_use").default(false).notNull(), // Uso único por usuário

  // Status
  active: boolean("active").default(true).notNull(),

  // Datas
  validFrom: timestamp("valid_from"),
  validUntil: timestamp("valid_until"),

  // Criador do cupom (para validação de hierarquia)
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Tabela de uso de cupons (histórico)
export const couponUsage = pgTable("coupon_usage", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),

  // Vínculos
  couponId: text("coupon_id")
    .notNull()
    .references(() => coupon.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  serviceRequestId: text("service_request_id")
    .notNull()
    .references(() => serviceRequest.id, { onDelete: "cascade" }),

  // Valor do desconto aplicado
  discountAmount: numeric("discount_amount", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),

  // Timestamp
  usedAt: timestamp("used_at").defaultNow().notNull(),
});

// Relações

export const couponRelations = relations(coupon, ({ one, many }) => ({
  creator: one(user, {
    fields: [coupon.createdBy],
    references: [user.id],
  }),
  usages: many(couponUsage),
}));

export const couponUsageRelations = relations(couponUsage, ({ one }) => ({
  coupon: one(coupon, {
    fields: [couponUsage.couponId],
    references: [coupon.id],
  }),
  user: one(user, {
    fields: [couponUsage.userId],
    references: [user.id],
  }),
  serviceRequest: one(serviceRequest, {
    fields: [couponUsage.serviceRequestId],
    references: [serviceRequest.id],
  }),
}));

// Type exports
export type Coupon = typeof coupon.$inferSelect;
export type CouponInsert = typeof coupon.$inferInsert;
export type CouponUsage = typeof couponUsage.$inferSelect;
export type CouponUsageInsert = typeof couponUsage.$inferInsert;
