import { pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";

export const creativeCategoryEnum = pgEnum("creative_category", [
  "instagram_post",
  "instagram_story",
  "facebook_post",
  "linkedin_post",
  "banner",
  "flyer",
  "other",
]);

export const creative = pgTable("creative", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),

  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  category: creativeCategoryEnum("category").default("other").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type Creative = typeof creative.$inferSelect;
export type NewCreative = typeof creative.$inferInsert;
