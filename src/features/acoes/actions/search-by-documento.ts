"use server";

import { and, eq, or } from "drizzle-orm";
import { db } from "@/core/db";
import { acao, serviceRequest } from "@/core/db/schema";

function normalizeDocument(doc: string): string {
  return doc.replace(/[.\-/\s]/g, "").trim();
}

function formatDocument(doc: string): string {
  const clean = normalizeDocument(doc);
  if (clean.length === 11) {
    return clean.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
  }
  if (clean.length === 14) {
    return clean.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      "$1.$2.$3/$4-$5",
    );
  }
  return doc;
}

export type OrgaoStatus =
  | "aguardando_baixas"
  | "baixas_iniciadas"
  | "baixas_completas";

export type OrgaoResult = {
  field: string;
  label: string;
  status: OrgaoStatus;
};

export type AcaoResult = {
  acaoId: string;
  acaoNome: string;
  itemStatus: "aguardando" | "baixas_completas" | "baixas_negadas";
  orgaos: OrgaoResult[];
  baixasCompletas: number;
  totalOrgaos: number;
  percentage: number;
  enviadoEm: string;
};

export type SearchByDocumentoResult = {
  nome: string;
  documentoFormatado: string;
  acoes: AcaoResult[];
};

const orgaoFields: { field: string; label: string }[] = [
  { field: "statusSpc", label: "SPC" },
  { field: "statusBoaVista", label: "Boa Vista" },
  { field: "statusSerasa", label: "Serasa" },
  { field: "statusCenprotNacional", label: "Cenprot Nacional" },
  { field: "statusCenprotSp", label: "Cenprot SP" },
];

export async function searchByDocumento(
  documento: string,
): Promise<
  | { success: true; data: SearchByDocumentoResult | null }
  | { success: false; error: string }
> {
  const normalizedDoc = normalizeDocument(documento);

  if (!normalizedDoc) {
    return { success: false, error: "Documento é obrigatório." };
  }

  if (normalizedDoc.length !== 11 && normalizedDoc.length !== 14) {
    return {
      success: false,
      error:
        "Documento inválido. Informe um CPF (11 dígitos) ou CNPJ (14 dígitos).",
    };
  }

  if (!/^\d+$/.test(normalizedDoc)) {
    return { success: false, error: "Documento deve conter apenas números." };
  }

  try {
    // Buscar todas as solicitações vinculadas a ações visíveis
    const requests = await db
      .select({
        requestId: serviceRequest.id,
        formData: serviceRequest.formData,
        itemsStatus: serviceRequest.itemsStatus,
        acaoId: serviceRequest.acaoId,
        requestCreatedAt: serviceRequest.createdAt,
        acaoNome: acao.nome,
        acaoVisivel: acao.visivel,
        acaoStatusSpc: acao.statusSpc,
        acaoStatusBoaVista: acao.statusBoaVista,
        acaoStatusSerasa: acao.statusSerasa,
        acaoStatusCenprotNacional: acao.statusCenprotNacional,
        acaoStatusCenprotSp: acao.statusCenprotSp,
      })
      .from(serviceRequest)
      .innerJoin(acao, eq(serviceRequest.acaoId, acao.id))
      .where(
        and(
          eq(acao.visivel, true),
          or(
            eq(serviceRequest.paid, true),
            eq(serviceRequest.paymentStatus, "confirmed"),
          ),
        ),
      );

    type MatchedEntry = {
      nome: string;
      documento: string;
      acaoId: string;
      acaoNome: string;
      itemStatus: "aguardando" | "baixas_completas" | "baixas_negadas";
      requestCreatedAt: Date;
      acaoStatusSpc: OrgaoStatus;
      acaoStatusBoaVista: OrgaoStatus;
      acaoStatusSerasa: OrgaoStatus;
      acaoStatusCenprotNacional: OrgaoStatus;
      acaoStatusCenprotSp: OrgaoStatus;
    };

    const matched: MatchedEntry[] = [];

    for (const request of requests) {
      if (!request.acaoId) continue;

      const itemsStatus = (request.itemsStatus || []) as Array<{
        nome?: string;
        documento?: string;
        status?: "aguardando" | "baixas_completas" | "baixas_negadas";
        observacao?: string;
        processedAt?: string;
        extracted?: boolean;
        extractedAt?: string;
      }>;

      // Primeiro procuramos no array de itemsStatus, já que ele é populado em importações e envios antigos de lote
      const foundInStatus = itemsStatus.find(
        (item) => normalizeDocument(item.documento || "") === normalizedDoc,
      );

      if (foundInStatus) {
        matched.push({
          nome: foundInStatus.nome || "Cliente",
          documento: foundInStatus.documento || normalizedDoc,
          acaoId: request.acaoId,
          acaoNome: request.acaoNome,
          itemStatus: foundInStatus.status || "aguardando",
          requestCreatedAt: request.requestCreatedAt,
          acaoStatusSpc: request.acaoStatusSpc,
          acaoStatusBoaVista: request.acaoStatusBoaVista,
          acaoStatusSerasa: request.acaoStatusSerasa,
          acaoStatusCenprotNacional: request.acaoStatusCenprotNacional,
          acaoStatusCenprotSp: request.acaoStatusCenprotSp,
        });
        continue;
      }

      // Fallback para procurar no formData caso o itemsStatus ainda não tenha sido gerado (pedidos muito novos ou formatos variados)
      const formData = request.formData as Record<string, unknown>;
      const isBulkUpload = formData?.uploadType === "bulk";

      if (isBulkUpload) {
        const items =
          (formData?.items as Array<{
            nome?: string;
            documento?: string;
            cpf?: string;
            cnpj?: string;
          }>) || [];

        const idx = items.findIndex(
          (item) =>
            normalizeDocument(item.documento || item.cpf || item.cnpj || "") ===
            normalizedDoc,
        );

        if (idx !== -1) {
          const item = items[idx];
          const itemStatusData = itemsStatus[idx];
          matched.push({
            nome: item.nome || "Cliente",
            documento: item.documento || item.cpf || item.cnpj || normalizedDoc,
            acaoId: request.acaoId,
            acaoNome: request.acaoNome,
            itemStatus: itemStatusData?.status || "aguardando",
            requestCreatedAt: request.requestCreatedAt,
            acaoStatusSpc: request.acaoStatusSpc,
            acaoStatusBoaVista: request.acaoStatusBoaVista,
            acaoStatusSerasa: request.acaoStatusSerasa,
            acaoStatusCenprotNacional: request.acaoStatusCenprotNacional,
            acaoStatusCenprotSp: request.acaoStatusCenprotSp,
          });
        }
      } else {
        const docInForm =
          (formData?.documento as string) ||
          (formData?.cpf as string) ||
          (formData?.cnpj as string) ||
          (formData?.cpfCnpj as string) ||
          (formData?.document as string) ||
          "";

        if (normalizeDocument(docInForm) === normalizedDoc) {
          const nome = (formData?.nome as string) || "Cliente";
          const itemStatusData = itemsStatus[0];
          matched.push({
            nome,
            documento: docInForm,
            acaoId: request.acaoId,
            acaoNome: request.acaoNome,
            itemStatus: itemStatusData?.status || "aguardando",
            requestCreatedAt: request.requestCreatedAt,
            acaoStatusSpc: request.acaoStatusSpc,
            acaoStatusBoaVista: request.acaoStatusBoaVista,
            acaoStatusSerasa: request.acaoStatusSerasa,
            acaoStatusCenprotNacional: request.acaoStatusCenprotNacional,
            acaoStatusCenprotSp: request.acaoStatusCenprotSp,
          });
        }
      }
    }

    if (matched.length === 0) {
      return { success: true, data: null };
    }

    // Deduplicate by acaoId — keep the latest status per ação
    const seenAcoes = new Map<string, AcaoResult>();

    for (const entry of matched) {
      if (seenAcoes.has(entry.acaoId)) continue;

      const acaoStatusMap: Record<string, OrgaoStatus> = {
        statusSpc: entry.acaoStatusSpc,
        statusBoaVista: entry.acaoStatusBoaVista,
        statusSerasa: entry.acaoStatusSerasa,
        statusCenprotNacional: entry.acaoStatusCenprotNacional,
        statusCenprotSp: entry.acaoStatusCenprotSp,
      };

      const orgaos: OrgaoResult[] = orgaoFields.map(({ field, label }) => ({
        field,
        label,
        status: acaoStatusMap[field] as OrgaoStatus,
      }));

      const baixasCompletas = orgaos.filter(
        (o) => o.status === "baixas_completas",
      ).length;

      const totalOrgaos = orgaos.length;
      const percentage = Math.round((baixasCompletas / totalOrgaos) * 100);

      seenAcoes.set(entry.acaoId, {
        acaoId: entry.acaoId,
        acaoNome: entry.acaoNome,
        itemStatus: entry.itemStatus,
        orgaos,
        baixasCompletas,
        totalOrgaos,
        percentage,
        enviadoEm: entry.requestCreatedAt.toISOString(),
      });
    }

    const clientNome = matched[0].nome;

    return {
      success: true,
      data: {
        nome: clientNome,
        documentoFormatado: formatDocument(normalizedDoc),
        acoes: Array.from(seenAcoes.values()),
      },
    };
  } catch (error) {
    console.error("[searchByDocumento] Erro:", error);
    return {
      success: false,
      error: "Erro interno ao consultar. Tente novamente mais tarde.",
    };
  }
}
