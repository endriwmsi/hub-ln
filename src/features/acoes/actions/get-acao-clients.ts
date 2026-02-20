"use server";

import { eq } from "drizzle-orm";
import { requireAdmin } from "@/core/auth/dal";
import { db } from "@/core/db";
import { acao, serviceRequest, user } from "@/core/db/schema";

export type AcaoClientItem = {
  requestId: string;
  itemIndex: number;
  nome: string;
  documento: string;
  status: "aguardando" | "baixas_completas" | "baixas_negadas";
  observacao?: string;
  processedAt?: string;
  extracted?: boolean;
  extractedAt?: string;
  // Dados do envio
  userId: string;
  userName: string;
  userEmail: string;
  requestCreatedAt: Date;
  requestPaid: boolean;
  // Valor unitário pago pelo parceiro
  precoUnitario: number;
};

export type GetAcaoClientsFilters = {
  search?: string;
  status?: "all" | "aguardando" | "baixas_completas" | "baixas_negadas";
  extracted?: "all" | "yes" | "no";
  page?: number;
  pageSize?: number;
};

/**
 * Busca todos os clientes/itens enviados em uma ação específica
 * Retorna a lista consolidada de todos os itens de todas as solicitações
 */
export async function getAcaoClients(
  acaoId: string,
  filters: GetAcaoClientsFilters = {},
) {
  try {
    await requireAdmin();

    const { search, status, extracted, page = 1, pageSize = 50 } = filters;

    // Verificar se a ação existe
    const acaoData = await db
      .select({ id: acao.id, nome: acao.nome })
      .from(acao)
      .where(eq(acao.id, acaoId))
      .limit(1);

    if (!acaoData[0]) {
      return {
        success: false,
        error: "Ação não encontrada",
      };
    }

    // Buscar todas as solicitações dessa ação
    const requests = await db
      .select({
        id: serviceRequest.id,
        userId: serviceRequest.userId,
        formData: serviceRequest.formData,
        itemsStatus: serviceRequest.itemsStatus,
        paid: serviceRequest.paid,
        createdAt: serviceRequest.createdAt,
        totalPrice: serviceRequest.totalPrice,
        quantity: serviceRequest.quantity,
        userName: user.name,
        userEmail: user.email,
      })
      .from(serviceRequest)
      .innerJoin(user, eq(serviceRequest.userId, user.id))
      .where(eq(serviceRequest.acaoId, acaoId));

    // Consolidar todos os itens
    const allItems: AcaoClientItem[] = [];

    for (const request of requests) {
      const formData = request.formData as Record<string, unknown>;
      const isBulkUpload = formData?.uploadType === "bulk";

      // Calcular preço unitário (totalPrice / quantity)
      const precoUnitario =
        request.quantity > 0
          ? Number(request.totalPrice) / request.quantity
          : 0;

      if (isBulkUpload) {
        const items =
          (formData?.items as Array<{ nome: string; documento: string }>) || [];
        const itemsStatus = (request.itemsStatus || []) as Array<{
          nome: string;
          documento: string;
          status: "aguardando" | "baixas_completas" | "baixas_negadas";
          observacao?: string;
          processedAt?: string;
          extracted?: boolean;
          extractedAt?: string;
        }>;

        items.forEach((item, index) => {
          const statusData = itemsStatus[index];

          allItems.push({
            requestId: request.id,
            itemIndex: index,
            nome: item.nome,
            documento: item.documento,
            status: statusData?.status || "aguardando",
            observacao: statusData?.observacao,
            processedAt: statusData?.processedAt,
            extracted: statusData?.extracted,
            extractedAt: statusData?.extractedAt,
            userId: request.userId,
            userName: request.userName,
            userEmail: request.userEmail,
            requestCreatedAt: request.createdAt,
            requestPaid: request.paid,
            precoUnitario,
          });
        });
      } else {
        // Envio único - usar dados do formData
        const nome = (formData?.nome as string) || "";
        const documento = (formData?.documento as string) || "";

        if (nome || documento) {
          const itemsStatus = (request.itemsStatus || []) as Array<{
            nome: string;
            documento: string;
            status: "aguardando" | "baixas_completas" | "baixas_negadas";
            observacao?: string;
            processedAt?: string;
            extracted?: boolean;
            extractedAt?: string;
          }>;
          const statusData = itemsStatus[0];

          allItems.push({
            requestId: request.id,
            itemIndex: 0,
            nome,
            documento,
            status: statusData?.status || "aguardando",
            observacao: statusData?.observacao,
            processedAt: statusData?.processedAt,
            extracted: statusData?.extracted,
            extractedAt: statusData?.extractedAt,
            userId: request.userId,
            userName: request.userName,
            userEmail: request.userEmail,
            requestCreatedAt: request.createdAt,
            requestPaid: request.paid,
            precoUnitario,
          });
        }
      }
    }

    // Aplicar filtros
    let filteredItems = allItems;

    if (search) {
      const searchLower = search.toLowerCase();
      filteredItems = filteredItems.filter(
        (item) =>
          item.nome.toLowerCase().includes(searchLower) ||
          item.documento.toLowerCase().includes(searchLower) ||
          item.userName.toLowerCase().includes(searchLower),
      );
    }

    if (status && status !== "all") {
      filteredItems = filteredItems.filter((item) => item.status === status);
    }

    if (extracted && extracted !== "all") {
      filteredItems = filteredItems.filter((item) => {
        if (extracted === "yes") {
          return item.extracted === true;
        }
        return !item.extracted;
      });
    }

    // Ordenar por data de criação (mais recente primeiro)
    filteredItems.sort(
      (a, b) => b.requestCreatedAt.getTime() - a.requestCreatedAt.getTime(),
    );

    // Paginação
    const total = filteredItems.length;
    const totalPages = Math.ceil(total / pageSize);
    const paginatedItems = filteredItems.slice(
      (page - 1) * pageSize,
      page * pageSize,
    );

    // Contadores por status
    const statusCounts = {
      aguardando: allItems.filter((i) => i.status === "aguardando").length,
      baixas_completas: allItems.filter((i) => i.status === "baixas_completas")
        .length,
      baixas_negadas: allItems.filter((i) => i.status === "baixas_negadas")
        .length,
    };

    return {
      success: true,
      data: {
        acao: acaoData[0],
        items: paginatedItems,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
        },
        statusCounts,
        totalItems: allItems.length,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar clientes da ação:", error);
    return {
      success: false,
      error: "Erro ao buscar clientes da ação",
    };
  }
}

export type GetAcaoClientsResponse = Awaited<ReturnType<typeof getAcaoClients>>;
