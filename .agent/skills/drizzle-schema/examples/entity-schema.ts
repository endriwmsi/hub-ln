import {
    pgTable,
    text,
    varchar,
    timestamp,
    boolean,
    decimal,
    integer,
} from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { users } from "@/features/users/db/schema";

export const entities = pgTable("entities", {
  // Chave primária com UUIDv7
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),

  // Campos de texto
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  slug: varchar("slug", { length: 100 }).unique(),

  // Campos numéricos
  price: decimal("price", { precision: 10, scale: 2 }),
  quantity: integer("quantity").default(0),

  // Status e flags
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  isActive: boolean("is_active").default(true).notNull(),

  // Relacionamento com usuário criador
  createdById: text("created_by_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Types inferidos do schema
export type Entity = typeof entities.$inferSelect;
export type NewEntity = typeof entities.$inferInsert;
