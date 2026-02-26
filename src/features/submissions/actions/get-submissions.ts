"use server";

import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import { acao, serviceRequest, services, user } from "@/core/db/schema";
import type { ActionResponse } from "@/shared/lib/server-actions";
import type { SubmissionFilters, SubmissionsResponse } from "../types";

export async function getSubmissions(
  filters: SubmissionFilters,
): Promise<ActionResponse<SubmissionsResponse>> {
  try {
    const session = await verifySession();
    const {
      search,
      status,
      serviceId,
      paid,
      page = 1,
      pageSize = 10,
    } = filters;

    // Condições base
    const conditions = [];

    // Usuário normal só vê seus próprios envios
    if (session.user.role !== "admin") {
      conditions.push(eq(serviceRequest.userId, session.userId));
    }

    // Filtro de busca
    if (search) {
      conditions.push(
        or(
          ilike(services.title, `%${search}%`),
          ilike(acao.nome, `%${search}%`),
        ),
      );
    }

    // Filtro de status
    if (status && status !== "all") {
      conditions.push(eq(serviceRequest.status, status));
    }

    // Filtro de serviço
    if (serviceId) {
      conditions.push(eq(serviceRequest.serviceId, serviceId));
    }

    // Filtro de pagamento
    if (paid && paid !== "all") {
      conditions.push(eq(serviceRequest.paid, paid === "paid"));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Contar total
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(serviceRequest)
      .leftJoin(services, eq(serviceRequest.serviceId, services.id))
      .leftJoin(acao, eq(serviceRequest.acaoId, acao.id))
      .where(whereClause);

    const total = Number(countResult[0]?.count || 0);
    const totalPages = Math.ceil(total / pageSize);

    // Buscar dados paginados
    const offset = (page - 1) * pageSize;

    const submissions = await db
      .select({
        id: serviceRequest.id,
        quantity: serviceRequest.quantity,
        totalPrice: serviceRequest.totalPrice,
        status: serviceRequest.status,
        paid: serviceRequest.paid,
        paidAt: serviceRequest.paidAt,
        createdAt: serviceRequest.createdAt,
        formData: serviceRequest.formData,
        itemsStatus: serviceRequest.itemsStatus,
        service: {
          id: services.id,
          title: services.title,
          slug: services.slug,
        },
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        acao: {
          id: acao.id,
          nome: acao.nome,
        },
      })
      .from(serviceRequest)
      .leftJoin(services, eq(serviceRequest.serviceId, services.id))
      .leftJoin(user, eq(serviceRequest.userId, user.id))
      .leftJoin(acao, eq(serviceRequest.acaoId, acao.id))
      .where(whereClause)
      .orderBy(desc(serviceRequest.createdAt))
      .limit(pageSize)
      .offset(offset);

    return {
      success: true,
      data: {
        submissions: submissions.map((s) => {
          // Calcular status global para envios em lote (limpa nome)
          const formData = s.formData as Record<string, unknown> | null;
          const isBulkUpload = formData?.uploadType === "bulk";
          const itemsStatus = (s.itemsStatus || []) as Array<{
            status: "aguardando" | "baixas_completas" | "baixas_negadas";
          }>;

          let globalStatus:
            | "aguardando"
            | "baixas_completas"
            | "baixas_parciais"
            | "baixas_negadas"
            | null = null;

          if (isBulkUpload && itemsStatus.length > 0) {
            const completasCount = itemsStatus.filter(
              (i) => i.status === "baixas_completas",
            ).length;
            const negadasCount = itemsStatus.filter(
              (i) => i.status === "baixas_negadas",
            ).length;
            const totalItems = itemsStatus.length;

            if (completasCount === totalItems) {
              globalStatus = "baixas_completas";
            } else if (completasCount > 0 || negadasCount > 0) {
              globalStatus = "baixas_parciais";
            } else {
              globalStatus = "aguardando";
            }
          }

          return {
            id: s.id,
            quantity: s.quantity,
            totalPrice: s.totalPrice,
            status: s.status,
            paid: s.paid,
            paidAt: s.paidAt,
            createdAt: s.createdAt,
            globalStatus,
            service: s.service as { id: string; title: string; slug: string },
            user: s.user as { id: string; name: string; email: string },
            acao: s.acao?.id ? (s.acao as { id: string; nome: string }) : null,
          };
        }),
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
        },
      },
    };
  } catch (error) {
    console.error("[Submissions] Error getting submissions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao buscar envios",
    };
  }
}
