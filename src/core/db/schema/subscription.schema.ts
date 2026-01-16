import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { user } from "./user.schema";

export const subscription = pgTable("subscription", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  // Integração com AbacatePay
  abacatePayBillingId: text("abacatePayBillingId").notNull(),

  // Status da assinatura
  status: varchar("status", { length: 20 }).notNull().default("trial"),
  // Possíveis valores: trial, active, past_due, canceled, expired

  // Datas
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date"),
  trialExpiresAt: timestamp("trial_expires_at"),
  canceledAt: timestamp("canceled_at"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const subscriptionRelations = relations(subscription, ({ one }) => ({
  user: one(user, {
    fields: [subscription.userId],
    references: [user.id],
  }),
}));

export type Subscription = typeof subscription.$inferSelect;
export type NewSubscription = typeof subscription.$inferInsert;
