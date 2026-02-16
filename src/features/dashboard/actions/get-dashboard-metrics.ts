"use server";

import { endOfMonth, format, startOfMonth, subDays, subMonths } from "date-fns";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { getSession } from "@/core/auth/dal";
import { db } from "@/core/db";
import { commission, serviceRequest, user, withdrawal } from "@/core/db/schema";

export async function getDashboardMetrics() {
  const session = await getSession();

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;
  const userReferralCode = session.user.referralCode;
  const isAdmin = session.user.role === "admin";

  const now = new Date();
  const startOfCurrentMonth = startOfMonth(now);
  const endOfCurrentMonth = endOfMonth(now);
  const startOfLastMonth = startOfMonth(subMonths(now, 1));
  const endOfLastMonth = endOfMonth(subMonths(now, 1));
  const thirtyDaysAgo = subDays(now, 30);

  // 1. Total Revenue (Faturamento)
  // ADMIN: Ver faturamento total da plataforma (service requests pagos)
  // USER: Ver comissões recebidas
  let currentMonthRevenue = 0;
  let lastMonthRevenue = 0;
  let totalRevenue = 0;
  let revenueChartData: { date: string; amount?: string }[] = [];

  if (isAdmin) {
    // Admin vê o faturamento total da plataforma
    const currentMonthRevenueResult = await db
      .select({
        total: sql<string>`sum(${serviceRequest.totalPrice})`,
      })
      .from(serviceRequest)
      .where(
        and(
          eq(serviceRequest.paid, true),
          gte(serviceRequest.paidAt, startOfCurrentMonth),
          lte(serviceRequest.paidAt, endOfCurrentMonth),
        ),
      );

    const lastMonthRevenueResult = await db
      .select({
        total: sql<string>`sum(${serviceRequest.totalPrice})`,
      })
      .from(serviceRequest)
      .where(
        and(
          eq(serviceRequest.paid, true),
          gte(serviceRequest.paidAt, startOfLastMonth),
          lte(serviceRequest.paidAt, endOfLastMonth),
        ),
      );

    const totalRevenueResult = await db
      .select({
        total: sql<string>`sum(${serviceRequest.totalPrice})`,
      })
      .from(serviceRequest)
      .where(eq(serviceRequest.paid, true));

    currentMonthRevenue = Number(currentMonthRevenueResult[0]?.total || 0);
    lastMonthRevenue = Number(lastMonthRevenueResult[0]?.total || 0);
    totalRevenue = Number(totalRevenueResult[0]?.total || 0);

    // Chart data - últimos 30 dias
    revenueChartData = await db
      .select({
        date: sql<string>`date(${serviceRequest.paidAt})`,
        amount: sql<string>`sum(${serviceRequest.totalPrice})`,
      })
      .from(serviceRequest)
      .where(
        and(
          eq(serviceRequest.paid, true),
          gte(serviceRequest.paidAt, thirtyDaysAgo),
        ),
      )
      .groupBy(sql`date(${serviceRequest.paidAt})`)
      .orderBy(sql`date(${serviceRequest.paidAt})`);
  } else {
    // Usuário comum vê suas comissões
    const currentMonthRevenueResult = await db
      .select({
        total: sql<string>`sum(${commission.amount})`,
      })
      .from(commission)
      .where(
        and(
          eq(commission.userId, userId),
          gte(commission.createdAt, startOfCurrentMonth),
          lte(commission.createdAt, endOfCurrentMonth),
        ),
      );

    const lastMonthRevenueResult = await db
      .select({
        total: sql<string>`sum(${commission.amount})`,
      })
      .from(commission)
      .where(
        and(
          eq(commission.userId, userId),
          gte(commission.createdAt, startOfLastMonth),
          lte(commission.createdAt, endOfLastMonth),
        ),
      );

    const totalRevenueResult = await db
      .select({
        total: sql<string>`sum(${commission.amount})`,
      })
      .from(commission)
      .where(eq(commission.userId, userId));

    currentMonthRevenue = Number(currentMonthRevenueResult[0]?.total || 0);
    lastMonthRevenue = Number(lastMonthRevenueResult[0]?.total || 0);
    totalRevenue = Number(totalRevenueResult[0]?.total || 0);

    // Chart data - últimos 30 dias
    revenueChartData = await db
      .select({
        date: sql<string>`date(${commission.createdAt})`,
        amount: sql<string>`sum(${commission.amount})`,
      })
      .from(commission)
      .where(
        and(
          eq(commission.userId, userId),
          gte(commission.createdAt, thirtyDaysAgo),
        ),
      )
      .groupBy(sql`date(${commission.createdAt})`)
      .orderBy(sql`date(${commission.createdAt})`);
  }

  let revenuePercentageChange = 0;
  if (lastMonthRevenue > 0) {
    revenuePercentageChange =
      ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
  } else if (currentMonthRevenue > 0) {
    revenuePercentageChange = 100;
  }

  // 2. Referrals / Total de Usuários
  // ADMIN: Ver total de usuários na plataforma
  // USER: Ver usuários cadastrados com seu código de referral
  let totalReferrals = 0;
  let referralsChartData: { date: string; count?: number }[] = [];

  if (isAdmin) {
    // Admin vê total de usuários na plataforma
    const totalUsersResult = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(user);

    totalReferrals = Number(totalUsersResult[0]?.count || 0);

    // Chart data - últimos 30 dias
    referralsChartData = await db
      .select({
        date: sql<string>`date(${user.createdAt})`,
        count: sql<number>`count(*)`,
      })
      .from(user)
      .where(gte(user.createdAt, thirtyDaysAgo))
      .groupBy(sql`date(${user.createdAt})`)
      .orderBy(sql`date(${user.createdAt})`);
  } else {
    // Usuário comum vê suas indicações
    const totalReferralsResult = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(user)
      .where(eq(user.referredBy, userReferralCode));

    totalReferrals = Number(totalReferralsResult[0]?.count || 0);

    // Chart data - últimos 30 dias
    referralsChartData = await db
      .select({
        date: sql<string>`date(${user.createdAt})`,
        count: sql<number>`count(*)`,
      })
      .from(user)
      .where(
        and(
          eq(user.referredBy, userReferralCode),
          gte(user.createdAt, thirtyDaysAgo),
        ),
      )
      .groupBy(sql`date(${user.createdAt})`)
      .orderBy(sql`date(${user.createdAt})`);
  }

  // 3. Withdrawn (Comissões Sacadas)
  // ADMIN: Ver total de saques da plataforma
  // USER: Ver total de saques do usuário
  let totalWithdrawn = 0;
  let withdrawnChartData: { date: string; amount?: string }[] = [];

  if (isAdmin) {
    // Admin vê total de saques da plataforma
    const totalWithdrawnResult = await db
      .select({
        total: sql<string>`sum(${withdrawal.amount})`,
      })
      .from(withdrawal)
      .where(eq(withdrawal.status, "paid"));

    totalWithdrawn = Number(totalWithdrawnResult[0]?.total || 0);

    // Chart data - últimos 30 dias
    withdrawnChartData = await db
      .select({
        date: sql<string>`date(${withdrawal.createdAt})`,
        amount: sql<string>`sum(${withdrawal.amount})`,
      })
      .from(withdrawal)
      .where(
        and(
          eq(withdrawal.status, "paid"),
          gte(withdrawal.createdAt, thirtyDaysAgo),
        ),
      )
      .groupBy(sql`date(${withdrawal.createdAt})`)
      .orderBy(sql`date(${withdrawal.createdAt})`);
  } else {
    // Usuário comum vê seus saques
    const totalWithdrawnResult = await db
      .select({
        total: sql<string>`sum(${withdrawal.amount})`,
      })
      .from(withdrawal)
      .where(and(eq(withdrawal.userId, userId), eq(withdrawal.status, "paid")));

    totalWithdrawn = Number(totalWithdrawnResult[0]?.total || 0);

    // Chart data - últimos 30 dias
    withdrawnChartData = await db
      .select({
        date: sql<string>`date(${withdrawal.createdAt})`,
        amount: sql<string>`sum(${withdrawal.amount})`,
      })
      .from(withdrawal)
      .where(
        and(
          eq(withdrawal.userId, userId),
          eq(withdrawal.status, "paid"),
          gte(withdrawal.createdAt, thirtyDaysAgo),
        ),
      )
      .groupBy(sql`date(${withdrawal.createdAt})`)
      .orderBy(sql`date(${withdrawal.createdAt})`);
  }

  // Fill in missing dates for charts
  const fillDates = (
    data: { date: string; amount?: string; count?: number }[],
    valueKey: "amount" | "count",
  ) => {
    const filledData = [];
    for (let i = 29; i >= 0; i--) {
      const date = subDays(now, i);
      const dateStr = format(date, "yyyy-MM-dd");

      // Note: sql date usually returns yyyy-MM-dd. Need to ensure matching format.
      // Drizzle returns date string.

      const found = data.find((item) => item.date === dateStr);
      filledData.push({
        date: dateStr,
        value: found
          ? Number(found[valueKey === "count" ? "count" : "amount"])
          : 0,
      });
    }
    return filledData;
  };

  return {
    revenue: {
      total: totalRevenue,
      percentageChange: revenuePercentageChange,
      chartData: fillDates(revenueChartData, "amount"),
    },
    referrals: {
      total: totalReferrals,
      chartData: fillDates(referralsChartData, "count"),
    },
    withdrawn: {
      total: totalWithdrawn,
      chartData: fillDates(withdrawnChartData, "amount"),
    },
  };
}
