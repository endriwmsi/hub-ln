"use server";

import { desc, eq } from "drizzle-orm";
import { db } from "@/core/db";
import { services } from "@/core/db/schema";

export async function getServices(onlyActive = false) {
  const query = db.select().from(services).orderBy(desc(services.createdAt));

  if (onlyActive) {
    return query.where(eq(services.isActive, true));
  }

  return query;
}
