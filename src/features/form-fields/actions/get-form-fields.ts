"use server";

import { asc, eq } from "drizzle-orm";
import { db } from "@/core/db";
import { formField } from "@/core/db/schema";

export async function getFormFieldsByServiceId(serviceId: string) {
  const result = await db
    .select()
    .from(formField)
    .where(eq(formField.serviceId, serviceId))
    .orderBy(asc(formField.order));

  return result;
}
