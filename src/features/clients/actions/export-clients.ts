"use server";

import { and, asc, eq } from "drizzle-orm";
import * as XLSX from "xlsx";
import { requireAdmin } from "@/core/auth/dal";
import { db } from "@/core/db";
import {
  acao,
  formField,
  serviceRequest,
  services,
  user,
} from "@/core/db/schema";
import type { ActionResponse } from "@/shared/lib/server-actions";

type ExportClientsParams = {
  serviceId: string;
  userId?: string;
};

type ExportResult = {
  base64: string;
  filename: string;
  totalRecords: number;
};

/**
 * Exporta clientes para Excel com base no serviço selecionado (obrigatório).
 * Inclui todos os campos dinâmicos do serviço (formFields).
 * Se userId for fornecido, filtra apenas os clientes daquele parceiro.
 * Marca os itens exportados como extraídos.
 */
export async function exportClients(
  params: ExportClientsParams,
): Promise<ActionResponse<ExportResult>> {
  try {
    await requireAdmin();

    const { serviceId, userId } = params;

    // Buscar o serviço
    const serviceData = await db
      .select({ id: services.id, title: services.title })
      .from(services)
      .where(eq(services.id, serviceId))
      .limit(1);

    if (!serviceData[0]) {
      return { success: false, error: "Serviço não encontrado" };
    }

    const serviceTitle = serviceData[0].title;

    // Buscar campos do formulário deste serviço (ordenados)
    const serviceFormFields = await db
      .select({
        name: formField.name,
        label: formField.label,
        type: formField.type,
      })
      .from(formField)
      .where(eq(formField.serviceId, serviceId))
      .orderBy(asc(formField.order));

    // Condições da query
    const conditions = [eq(serviceRequest.serviceId, serviceId)];

    if (userId) {
      conditions.push(eq(serviceRequest.userId, userId));
    }

    const requests = await db
      .select({
        id: serviceRequest.id,
        formData: serviceRequest.formData,
        itemsStatus: serviceRequest.itemsStatus,
        status: serviceRequest.status,
        paid: serviceRequest.paid,
        paidAt: serviceRequest.paidAt,
        paymentStatus: serviceRequest.paymentStatus,
        createdAt: serviceRequest.createdAt,
        totalPrice: serviceRequest.totalPrice,
        quantity: serviceRequest.quantity,
        acaoNome: acao.nome,
        userName: user.name,
        userEmail: user.email,
      })
      .from(serviceRequest)
      .leftJoin(user, eq(serviceRequest.userId, user.id))
      .leftJoin(acao, eq(serviceRequest.acaoId, acao.id))
      .where(and(...conditions));

    if (requests.length === 0) {
      return {
        success: false,
        error: "Nenhum cliente encontrado para os filtros selecionados",
      };
    }

    const exportData: Array<Record<string, string>> = [];
    const now = new Date().toISOString();

    const requestsToUpdate: Array<{
      id: string;
      itemsStatus?: Array<{
        nome: string;
        documento: string;
        status: "aguardando" | "baixas_completas" | "baixas_negadas";
        observacao?: string;
        processedAt?: string;
        extracted?: boolean;
        extractedAt?: string;
      }>;
      needsUpdate: boolean;
    }> = [];

    console.log("[exportClients] Starting export with filters:", {
      serviceId,
      userId,
    });

    const formatDate = (date: Date | string | null | undefined) => {
      if (!date) return "";
      return new Date(date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const formatStatus = (s: string) =>
      s === "aguardando"
        ? "Aguardando"
        : s === "baixas_completas"
          ? "Baixas Completas"
          : s === "baixas_negadas"
            ? "Baixas Negadas"
            : s;

    // Metadados comuns (sempre ao final)
    const buildMeta = (
      request: (typeof requests)[number],
      statusPagamento: string,
      precoUnitario: number,
    ) => ({
      Ação: request.acaoNome || "",
      "Usuário Enviou": request.userName || "",
      "Email Usuário": request.userEmail || "",
      "Data Envio": formatDate(request.createdAt),
      "Status Pagamento": statusPagamento,
      "Data Pagamento": formatDate(request.paidAt),
      "Preço Unitário": `R$ ${precoUnitario.toFixed(2)}`,
    });

    for (const request of requests) {
      const formData = (request.formData || {}) as Record<string, unknown>;
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

      const statusPagamento = request.paid
        ? "Pago"
        : request.paymentStatus === "overdue"
          ? "Atrasado"
          : request.paymentStatus === "confirmed"
            ? "Confirmado"
            : "Pendente";

      let hasNewExtracts = false;
      console.log(
        `[exportClients] Processing request ${request.id}, isBulkUpload: ${isBulkUpload}, itemsStatus length: ${itemsStatus.length}`,
      );

      if (isBulkUpload && itemsStatus.length > 0) {
        // Bulk upload: cliente por item no itemsStatus; formData só tem os campos de upload
        const items =
          (formData?.items as Array<{ nome: string; documento: string }>) || [];

        for (let index = 0; index < items.length; index++) {
          const item = items[index];
          const statusData = itemsStatus[index] || {
            nome: item.nome,
            documento: item.documento,
            status: "aguardando" as const,
          };

          hasNewExtracts = true;

          exportData.push({
            Nome: item.nome,
            Documento: item.documento,
            Status: formatStatus(statusData.status),
            Observação: statusData.observacao || "",
            "Data Processamento": formatDate(statusData.processedAt),
            Extraído: statusData.extracted ? "Sim" : "Não",
            "Data Extração": formatDate(statusData.extractedAt),
            ...buildMeta(request, statusPagamento, precoUnitario),
          });

          statusData.extracted = true;
          statusData.extractedAt = now;
          itemsStatus[index] = statusData;
        }
      } else if (itemsStatus.length > 0) {
        // Service request com itemsStatus (campo nome+documento explícito)
        for (let index = 0; index < itemsStatus.length; index++) {
          const statusData = itemsStatus[index];

          hasNewExtracts = true;

          // Campos dinâmicos do formData (se existir para este request)
          const dynamicFields = serviceFormFields.reduce<
            Record<string, string>
          >((acc, field) => {
            const val = formData[field.name];
            acc[field.label] =
              val !== undefined && val !== null ? String(val) : "";
            return acc;
          }, {});

          exportData.push({
            Nome: statusData.nome,
            Documento: statusData.documento,
            Status: formatStatus(statusData.status),
            Observação: statusData.observacao || "",
            "Data Processamento": formatDate(statusData.processedAt),
            Extraído: statusData.extracted ? "Sim" : "Não",
            "Data Extração": formatDate(statusData.extractedAt),
            ...dynamicFields,
            ...buildMeta(request, statusPagamento, precoUnitario),
          });

          statusData.extracted = true;
          statusData.extractedAt = now;
          itemsStatus[index] = statusData;
        }
      } else {
        // Sem itemsStatus: serviço de formulário simples (ex: Capital de Giro)
        // Mapeia todos os campos dinâmicos do serviço a partir do formData
        const dynamicFields = serviceFormFields.reduce<Record<string, string>>(
          (acc, field) => {
            const val = formData[field.name];
            acc[field.label] =
              val !== undefined && val !== null ? String(val) : "";
            return acc;
          },
          {},
        );

        // Fallback nome/documento para garantir identificação mínima
        const nome = String(
          formData.nome_completo ??
            formData.nome ??
            formData.name ??
            formData.fullName ??
            formData.full_name ??
            formData.nome_cliente ??
            formData.cliente_nome ??
            formData.nomeCompleto ??
            "",
        ).trim();
        const documento = String(
          formData.cpf ??
            formData.cnpj ??
            formData.documento ??
            formData.cpf_cnpj ??
            formData.cpf_cliente ??
            formData.document ??
            formData.doc ??
            "",
        ).trim();

        if (nome || documento || Object.keys(dynamicFields).length > 0) {
          hasNewExtracts = true;

          const statusMap: Record<string, string> = {
            completed: "Baixas Completas",
            rejected: "Baixas Negadas",
            cancelled: "Baixas Negadas",
          };

          exportData.push({
            ...dynamicFields,
            Status: statusMap[request.status] ?? "Aguardando",
            ...buildMeta(request, statusPagamento, precoUnitario),
          });

          // Mark as extracted for simple form services (no itemsStatus)
          // Create or update itemsStatus array
          if (itemsStatus.length === 0) {
            itemsStatus.push({
              nome,
              documento,
              status:
                (statusMap[request.status]
                  ?.toLowerCase()
                  .replace(/\s/g, "_") as
                  | "aguardando"
                  | "baixas_completas"
                  | "baixas_negadas") || "aguardando",
              extracted: true,
              extractedAt: now,
            });
          }
        }
      }

      if (hasNewExtracts) {
        console.log(
          `[exportClients] Marking request ${request.id} as extracted with ${itemsStatus.length} items`,
        );
        requestsToUpdate.push({
          id: request.id,
          itemsStatus,
          needsUpdate: true,
        });
      }
    }

    if (exportData.length === 0) {
      return {
        success: false,
        error: "Nenhum cliente encontrado para exportar",
      };
    }

    // Atualizar itens como extraídos
    console.log(
      `[exportClients] Updating ${requestsToUpdate.length} requests in database`,
    );
    for (const req of requestsToUpdate) {
      if (req.needsUpdate && req.itemsStatus) {
        console.log(
          `[exportClients] Updating request ${req.id} with ${req.itemsStatus.length} items`,
        );
        const result = await db
          .update(serviceRequest)
          .set({ itemsStatus: req.itemsStatus, updatedAt: new Date() })
          .where(eq(serviceRequest.id, req.id));
        console.log(`[exportClients] Update result for ${req.id}:`, result);
      }
    }

    // Gerar Excel
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const allKeys = Array.from(
      new Set(exportData.flatMap((row) => Object.keys(row))),
    );
    const colWidths = allKeys.map((key) => ({
      wch: Math.max(
        key.length,
        Math.max(...exportData.map((row) => String(row[key] ?? "").length)),
      ),
    }));
    worksheet["!cols"] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    });

    const base64 = Buffer.from(excelBuffer).toString("base64");
    const safeTitle = serviceTitle
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "_");
    const dateStr = new Date().toLocaleDateString("pt-BR").replace(/\//g, "-");
    const filename = `clientes_${safeTitle}_${dateStr}.xlsx`;

    console.log(
      `[exportClients] Export completed successfully with ${exportData.length} records`,
    );
    return {
      success: true,
      data: {
        base64,
        filename,
        totalRecords: exportData.length,
      },
    };
  } catch (error) {
    console.error("[exportClients] Error:", error);
    return { success: false, error: "Erro ao exportar clientes" };
  }
}
