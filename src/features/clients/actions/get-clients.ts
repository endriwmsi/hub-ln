"use server";

import { and, desc, eq } from "drizzle-orm";
import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import { acao, serviceRequest, services, user } from "@/core/db/schema";
import type { ActionResponse } from "@/shared/lib/server-actions";
import { normalizeForSearch } from "@/shared/lib/string-utils";
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
        formData: serviceRequest.formData,
        status: serviceRequest.status,
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

    // Extrair todos os clientes dos itemsStatus ou do formData (para serviços sem itemsStatus)
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

      // Se há itens em itemsStatus, usar o comportamento padrão
      if (itemsStatus.length > 0) {
        return itemsStatus.map((item, itemIndex) => ({
          nome: item.nome,
          documento: item.documento,
          status: item.status,
          observacao: item.observacao,
          processedAt: item.processedAt,
          extracted: item.extracted,
          extractedAt: item.extractedAt,
          serviceRequestId: request.id,
          itemIndex,
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
      }

      // Fallback: extrair cliente do formData (ex: capital de giro e outros serviços de formulário)
      const fd = (request.formData || {}) as Record<string, unknown>;
      const nome = String(fd.nome_completo ?? fd.nome ?? fd.name ?? "").trim();
      const documento = String(fd.cpf ?? fd.cnpj ?? fd.documento ?? "").trim();

      if (!nome && !documento) {
        return [];
      }

      const statusMap: Record<
        string,
        "aguardando" | "baixas_completas" | "baixas_negadas"
      > = {
        completed: "baixas_completas",
        rejected: "baixas_negadas",
        cancelled: "baixas_negadas",
      };
      const clientStatus = statusMap[request.status] ?? "aguardando";

      return [
        {
          nome,
          documento,
          status: clientStatus,
          observacao: undefined,
          processedAt: undefined,
          extracted: undefined,
          extractedAt: undefined,
          serviceRequestId: request.id,
          itemIndex: 0,
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
        },
      ];
    });

    // Aplicar filtros adicionais nos clientes extraídos
    let filteredClients = allClients;

    // Filtro de status
    if (status && status !== "all") {
      filteredClients = filteredClients.filter(
        (client) => client.status === status,
      );
    }

    // Filtro de busca (múltiplos nomes/documentos) - normalizado
    if (search.length > 0) {
      filteredClients = filteredClients.filter((client) =>
        search.some((term) => {
          const normalizedTerm = normalizeForSearch(term);
          const normalizedName = normalizeForSearch(client.nome);
          const normalizedDoc = normalizeForSearch(client.documento);

          return (
            normalizedName.includes(normalizedTerm) ||
            normalizedDoc.includes(normalizedTerm)
          );
        }),
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
