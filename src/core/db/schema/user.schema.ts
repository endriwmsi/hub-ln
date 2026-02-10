import { relations } from "drizzle-orm";
import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { subscription } from "./subscription.schema";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);

export const user = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),

  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),

  // Papel do usuário
  role: userRoleEnum("role").default("user").notNull(),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),

  // Status de aprovação
  approved: boolean("approved").default(false).notNull(),

  // Campos personalizados
  phone: varchar("phone", { length: 20 }),
  cpf: varchar("cpf", { length: 11 }).notNull().unique(),
  cnpj: varchar("cnpj", { length: 14 }).notNull().unique(),

  // Endereço
  street: text("street"),
  number: varchar("number", { length: 10 }),
  complement: text("complement"),
  neighborhood: text("neighborhood"),
  city: text("city"),
  uf: varchar("uf", { length: 2 }),
  cep: varchar("cep", { length: 8 }),

  // Admin

  // Sistema de afiliados
  referralCode: varchar("referral_code", { length: 4 }).notNull().unique(),
  referredBy: varchar("referred_by", { length: 4 }),

  // Integração com AbacatePay
  abacatePayCustomerId: text("abacate_pay_customer_id"),

  pixKey: text("pix_key"),
});

export const userRelations = relations(user, ({ one }) => ({
  subscription: one(subscription, {
    fields: [user.id],
    references: [subscription.userId],
  }),
}));

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
