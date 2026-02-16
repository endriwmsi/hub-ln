"use server";

import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/core/db";
import { serviceRequest, user } from "@/core/db/schema";

export interface TopPartner {
  id: string;
  name: string;
  email: string;
  image: string | null;
  totalSubmissions: number;
}

export async function getTopPartners(): Promise<TopPartner[]> {
  try {
    // Query para buscar os top 3 usuários com mais envios pagos
    const topPartners = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        totalSubmissions: sql<number>`cast(count(${serviceRequest.id}) as integer)`,
      })
      .from(serviceRequest)
      .innerJoin(user, eq(serviceRequest.userId, user.id))
      .where(eq(serviceRequest.paid, true))
      .groupBy(user.id, user.name, user.email, user.image)
      .orderBy(desc(sql`count(${serviceRequest.id})`))
      .limit(3);

    return topPartners;
  } catch (error) {
    console.error("Error fetching top partners:", error);
    return [];
  }
}
