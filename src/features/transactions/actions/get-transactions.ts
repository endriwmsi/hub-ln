"use server";

import { and, desc, eq } from "drizzle-orm";
import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import { commission, serviceRequest, withdrawal } from "@/core/db/schema";
import type { ActionResponse } from "@/shared/lib/server-actions";
import type {
  GetTransactionsResult,
  Transaction,
  TransactionFilters,
} from "../types";

/**
 * Lista transações do usuário (pagamentos, comissões e saques)
 */
export async function getTransactions(
  params?: Partial<TransactionFilters>,
): Promise<ActionResponse<GetTransactionsResult>> {
  try {
    const session = await verifySession();
    const {
      search,
      type = "all",
      status = "all",
      page = 1,
      pageSize = 10,
    } = params || {};

    const transactions: Transaction[] = [];

    // Buscar pagamentos de serviços (service requests pagos)
    if (type === "all" || type === "service_payment") {
      const servicePayments = await db.query.serviceRequest.findMany({
        where: and(
          eq(serviceRequest.userId, session.userId),
          eq(serviceRequest.paid, true),
        ),
        with: {
          service: {
            columns: { title: true },
          },
        },
        orderBy: [desc(serviceRequest.createdAt)],
      });

      for (const payment of servicePayments) {
        transactions.push({
          id: payment.id,
          type: "service_payment",
          amount: payment.totalPrice,
          status: "paid",
          description: `Pagamento - ${payment.service.title}`,
          createdAt: payment.createdAt,
          relatedId: payment.id,
        });
      }
    }

    // Buscar comissões recebidas
    if (type === "all" || type === "commission") {
      const commissions = await db.query.commission.findMany({
        where: eq(commission.userId, session.userId),
        with: {
          serviceRequest: {
            columns: { id: true },
            with: {
              service: {
                columns: { title: true },
              },
            },
          },
          payer: {
            columns: { name: true },
          },
        },
        orderBy: [desc(commission.createdAt)],
      });

      for (const comm of commissions) {
        transactions.push({
          id: comm.id,
          type: "commission",
          amount: comm.amount,
          status: comm.status,
          description: `Comissão - ${comm.serviceRequest.service.title} (${comm.payer.name})`,
          createdAt: comm.createdAt,
          availableAt: comm.availableAt,
          relatedId: comm.serviceRequestId,
        });
      }
    }

    // Buscar saques
    if (type === "all" || type === "withdrawal") {
      const withdrawals = await db.query.withdrawal.findMany({
        where: eq(withdrawal.userId, session.userId),
        orderBy: [desc(withdrawal.createdAt)],
      });

      for (const wd of withdrawals) {
        transactions.push({
          id: wd.id,
          type: "withdrawal",
          amount: `-${wd.amount}`, // Negativo pois é saída
          status: wd.status,
          description: `Saque solicitado`,
          createdAt: wd.createdAt,
          relatedId: wd.id,
        });
      }
    }

    // Ordenar por data decrescente
    transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Filtrar por status se necessário
    let filtered = transactions;
    if (status && status !== "all") {
      filtered = transactions.filter((t) => t.status === status);
    }

    // Filtrar por busca se necessário
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((t) =>
        t.description.toLowerCase().includes(searchLower),
      );
    }

    // Aplicar paginação
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const offset = (page - 1) * pageSize;
    const paginated = filtered.slice(offset, offset + pageSize);

    return {
      success: true,
      data: {
        data: paginated,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
        },
      },
    };
  } catch (error) {
    console.error("[Transactions] Error getting transactions:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao buscar transações",
    };
  }
}
