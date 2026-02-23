"use server";

import { and, desc, eq } from "drizzle-orm";
import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import { acao, serviceRequest, services, user } from "@/core/db/schema";
import type { ActionResponse } from "@/shared/lib/server-actions";
import type { ClientFilters, ClientsResponse } from "../types";

/**
 * Busca todos os clientes de todos os service requests
 * Extrai os dados do campo itemsStatus (JSONB)
 */
export async function getClients(
  filters: ClientFilters,
): Promise<ActionResponse<ClientsResponse>> {
  try {
    const session = await verifySession();
    const {
      search = [],
      status,
      serviceId,
      userId,
      paid,
      page = 1,
      pageSize = 10,
    } = filters;

    // Condições base
    const conditions = [];

    // Usuário normal só vê seus próprios clientes
    if (session.user.role !== "admin") {
      conditions.push(eq(serviceRequest.userId, session.userId));
    }

    // Filtro de usuário (admin pode filtrar por usuário específico)
    if (userId && session.user.role === "admin") {
      conditions.push(eq(serviceRequest.userId, userId));
    }

    // Filtro de serviço
    if (serviceId) {
      conditions.push(eq(serviceRequest.serviceId, serviceId));
    }

    // Filtro de pagamento
    if (paid !== undefined && paid !== "all") {
      conditions.push(eq(serviceRequest.paid, paid));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Buscar todos os service requests que atendem aos filtros
    const requests = await db
      .select({
        id: serviceRequest.id,
        itemsStatus: serviceRequest.itemsStatus,
        totalPrice: serviceRequest.totalPrice,
        paid: serviceRequest.paid,
        paidAt: serviceRequest.paidAt,
        createdAt: serviceRequest.createdAt,
        service: {
          id: services.id,
          title: services.title,
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
      .orderBy(desc(serviceRequest.createdAt));

    // Extrair todos os clientes dos itemsStatus
    const allClients = requests.flatMap((request) => {
      const itemsStatus = (request.itemsStatus || []) as Array<{
        nome: string;
        documento: string;
        status: "aguardando" | "baixas_completas" | "baixas_negadas";
        observacao?: string;
        processedAt?: string;
        extracted?: boolean;
        extractedAt?: string;
      }>;

      return itemsStatus.map((item) => ({
        nome: item.nome,
        documento: item.documento,
        status: item.status,
        observacao: item.observacao,
        processedAt: item.processedAt,
        extracted: item.extracted,
        extractedAt: item.extractedAt,
        serviceRequestId: request.id,
        serviceTitle: request.service?.title || "",
        serviceId: request.service?.id || "",
        acaoNome: request.acao?.nome,
        acaoId: request.acao?.id,
        userName: request.user?.name || "",
        userId: request.user?.id || "",
        userEmail: request.user?.email || "",
        paid: request.paid,
        paidAt: request.paidAt,
        createdAt: request.createdAt,
        totalPrice: request.totalPrice,
      }));
    });

    // Aplicar filtros adicionais nos clientes extraídos
    let filteredClients = allClients;

    // Filtro de status
    if (status && status !== "all") {
      filteredClients = filteredClients.filter(
        (client) => client.status === status,
      );
    }

    // Filtro de busca (múltiplos nomes/documentos)
    if (search.length > 0) {
      filteredClients = filteredClients.filter((client) =>
        search.some(
          (term) =>
            client.nome.toLowerCase().includes(term.toLowerCase()) ||
            client.documento.includes(term),
        ),
      );
    }

    // Paginação manual
    const total = filteredClients.length;
    const totalPages = Math.ceil(total / pageSize);
    const offset = (page - 1) * pageSize;
    const paginatedClients = filteredClients.slice(offset, offset + pageSize);

    return {
      success: true,
      data: {
        clients: paginatedClients,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
        },
      },
    };
  } catch (error) {
    console.error("[getClients] Error:", error);
    return {
      success: false,
      error: "Erro ao buscar clientes",
    };
  }
}
