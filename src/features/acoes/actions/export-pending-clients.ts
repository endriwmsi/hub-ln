"use server";

import { eq } from "drizzle-orm";
import * as XLSX from "xlsx";
import { requireAdmin } from "@/core/auth/dal";
import { db } from "@/core/db";
import { acao, serviceRequest, user } from "@/core/db/schema";

/**
 * Exporta todos os clientes PENDENTES (não extraídos) de uma ação para Excel
 * e marca os itens como extraídos
 */
export async function exportPendingClients(acaoId: string) {
  try {
    await requireAdmin();

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
        paidAt: serviceRequest.paidAt,
        paymentStatus: serviceRequest.paymentStatus,
        createdAt: serviceRequest.createdAt,
        totalPrice: serviceRequest.totalPrice,
        quantity: serviceRequest.quantity,
        userName: user.name,
        userEmail: user.email,
      })
      .from(serviceRequest)
      .innerJoin(user, eq(serviceRequest.userId, user.id))
      .where(eq(serviceRequest.acaoId, acaoId));

    if (requests.length === 0) {
      return {
        success: false,
        error: "Nenhum cliente encontrado nesta ação",
      };
    }

    const exportData: Array<Record<string, string>> = [];
    const now = new Date().toISOString();
    const requestsToUpdate: Array<{
      id: string;
      itemsStatus: Array<{
        nome: string;
        documento: string;
        status: "aguardando" | "baixas_completas" | "baixas_negadas";
        observacao?: string;
        processedAt?: string;
        extracted?: boolean;
        extractedAt?: string;
      }>;
    }> = [];

    for (const request of requests) {
      const formData = request.formData as Record<string, unknown>;
      const isBulkUpload = formData?.uploadType === "bulk";
      const precoUnitario =
        request.quantity > 0
          ? Number(request.totalPrice) / request.quantity
          : 0;

      const itemsStatus = (request.itemsStatus || []) as Array<{
        nome: string;
        documento: string;
        status: "aguardando" | "baixas_completas" | "baixas_negadas";
        observacao?: string;
        processedAt?: string;
        extracted?: boolean;
        extractedAt?: string;
      }>;

      let hasNewExtracts = false;

      if (isBulkUpload) {
        const items =
          (formData?.items as Array<{ nome: string; documento: string }>) || [];

        for (let index = 0; index < items.length; index++) {
          const item = items[index];
          const statusData = itemsStatus[index] || {
            nome: item.nome,
            documento: item.documento,
            status: "aguardando" as const,
          };

          if (!statusData.extracted) {
            hasNewExtracts = true;
            const statusPagamento = request.paid
              ? "Pago"
              : request.paymentStatus === "overdue"
                ? "Atrasado"
                : request.paymentStatus === "confirmed"
                  ? "Confirmado"
                  : "Pendente";

            exportData.push({
              Nome: item.nome,
              Documento: item.documento,
              Status:
                statusData.status === "aguardando"
                  ? "Aguardando"
                  : statusData.status === "baixas_completas"
                    ? "Baixas Completas"
                    : "Baixas Negadas",
              Observação: statusData.observacao || "",
              "Data Processamento": statusData.processedAt
                ? new Date(statusData.processedAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "",
              "Usuário Enviou": request.userName,
              "Email Usuário": request.userEmail,
              "Data Envio": new Date(request.createdAt).toLocaleDateString(
                "pt-BR",
                {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                },
              ),
              "Status Pagamento": statusPagamento,
              "Data Pagamento": request.paidAt
                ? new Date(request.paidAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "",
              "Preço Unitário": `R$ ${precoUnitario.toFixed(2)}`,
              Extraído: "Não",
              "Data Extração": "",
            });

            statusData.extracted = true;
            statusData.extractedAt = now;
            itemsStatus[index] = statusData;
          }
        }
      } else {
        const nome = (formData?.nome as string) || "";
        const documento = (formData?.documento as string) || "";

        if (nome || documento) {
          const statusData = itemsStatus[0] || {
            nome,
            documento,
            status: "aguardando" as const,
          };

          if (!statusData.extracted) {
            hasNewExtracts = true;
            const statusPagamento = request.paid
              ? "Pago"
              : request.paymentStatus === "overdue"
                ? "Atrasado"
                : request.paymentStatus === "confirmed"
                  ? "Confirmado"
                  : "Pendente";

            exportData.push({
              Nome: nome,
              Documento: documento,
              Status:
                statusData.status === "aguardando"
                  ? "Aguardando"
                  : statusData.status === "baixas_completas"
                    ? "Baixas Completas"
                    : "Baixas Negadas",
              Observação: statusData.observacao || "",
              "Data Processamento": statusData.processedAt
                ? new Date(statusData.processedAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "",
              "Usuário Enviou": request.userName,
              "Email Usuário": request.userEmail,
              "Data Envio": new Date(request.createdAt).toLocaleDateString(
                "pt-BR",
                {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                },
              ),
              "Status Pagamento": statusPagamento,
              "Data Pagamento": request.paidAt
                ? new Date(request.paidAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "",
              "Preço Unitário": `R$ ${precoUnitario.toFixed(2)}`,
              Extraído: "Não",
              "Data Extração": "",
            });

            statusData.extracted = true;
            statusData.extractedAt = now;
            itemsStatus[0] = statusData;
          }
        }
      }

      if (hasNewExtracts) {
        requestsToUpdate.push({
          id: request.id,
          itemsStatus,
        });
      }
    }

    if (exportData.length === 0) {
      return {
        success: false,
        error: "Nenhum cliente pendente de extração encontrado nesta ação",
      };
    }

    for (const request of requestsToUpdate) {
      await db
        .update(serviceRequest)
        .set({
          itemsStatus: request.itemsStatus,
          updatedAt: new Date(),
        })
        .where(eq(serviceRequest.id, request.id));
    }

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const colWidths = Object.keys(exportData[0] || {}).map((key) => ({
      wch: Math.max(
        key.length,
        Math.max(
          ...exportData.map(
            (row) => String(row[key as keyof typeof row]).length,
          ),
        ),
      ),
    }));
    worksheet["!cols"] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      acaoData[0].nome.replace(/[:\\/?*[\]]/g, "_").substring(0, 30),
    );

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    const base64 = buffer.toString("base64");

    return {
      success: true,
      data: {
        base64,
        filename: `${acaoData[0].nome.replace(/[^a-zA-Z0-9]/g, "_")}-pendentes-${new Date().toISOString().split("T")[0]}.xlsx`,
        totalRecords: exportData.length,
        acaoNome: acaoData[0].nome,
      },
    };
  } catch (error) {
    console.error("Erro ao exportar clientes pendentes:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? `Erro ao exportar clientes pendentes: ${error.message}`
          : "Erro ao exportar clientes pendentes",
    };
  }
}

export type ExportPendingClientsResponse = Awaited<
  ReturnType<typeof exportPendingClients>
>;
