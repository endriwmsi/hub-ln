"use server";

import { eq } from "drizzle-orm";
import { db } from "@/core/db";
import { services } from "@/core/db/schema";

export async function getServiceBySlug(slug: string) {
  const result = await db
    .select()
    .from(services)
    .where(eq(services.slug, slug))
    .limit(1);

  return result[0] || null;
}
