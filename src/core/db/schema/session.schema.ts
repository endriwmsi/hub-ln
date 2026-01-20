import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";
import { uuidv7 } from "uuidv7";
import { user } from "./user.schema";

export const session = pgTable(
  "session",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
);

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;
