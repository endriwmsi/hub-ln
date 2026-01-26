"use server";

import { eq } from "drizzle-orm";
import { db } from "@/core/db";
import { services } from "@/core/db/schema";

export async function getServiceById(id: string) {
  const result = await db
    .select()
    .from(services)
    .where(eq(services.id, id))
    .limit(1);

  return result[0] || null;
}
