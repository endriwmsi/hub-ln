import { z } from "zod";

// Status de solicitação
export const serviceRequestStatuses = [
  "pending",
  "processing",
  "completed",
  "cancelled",
  "rejected",
] as const;

export type ServiceRequestStatus = (typeof serviceRequestStatuses)[number];

// Labels para status
export const serviceRequestStatusLabels: Record<ServiceRequestStatus, string> =
  {
    pending: "Pendente",
    processing: "Em Processamento",
    completed: "Concluído",
    cancelled: "Cancelado",
    rejected: "Rejeitado",
  };

// Cores para badges de status
export const serviceRequestStatusColors: Record<ServiceRequestStatus, string> =
  {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-gray-100 text-gray-800",
    rejected: "bg-red-100 text-red-800",
  };

// Schema para documento anexado
export const documentSchema = z.object({
  url: z.string().url(),
  name: z.string(),
  type: z.string(),
  size: z.number(),
  uploadedAt: z.string(),
});

export type DocumentAttachment = z.infer<typeof documentSchema>;

// Schema para criação de solicitação
export const createServiceRequestSchema = z.object({
  serviceId: z.string().min(1, "Serviço é obrigatório"),
  acaoId: z.string().optional(),
  formData: z.record(z.string(), z.unknown()),
  documents: z.array(documentSchema).optional(),
  quantity: z.number().int().positive().default(1),
});

export type CreateServiceRequestInput = z.infer<
  typeof createServiceRequestSchema
>;

// Schema para atualização de status
export const updateServiceRequestStatusSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  status: z.enum(serviceRequestStatuses),
  notes: z.string().optional(),
});

export type UpdateServiceRequestStatusInput = z.infer<
  typeof updateServiceRequestStatusSchema
>;

// Schema para filtros de listagem
export const serviceRequestFiltersSchema = z.object({
  search: z.string().optional(),
  status: z
    .enum(["all", ...serviceRequestStatuses])
    .optional()
    .default("all"),
  serviceId: z.string().optional(),
  acaoId: z.string().optional(),
  userId: z.string().optional(), // Para filtrar por usuário específico
  sortBy: z
    .enum(["createdAt", "updatedAt", "status", "totalPrice"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
});

export type ServiceRequestFilters = z.infer<typeof serviceRequestFiltersSchema>;

// Schema para upload de planilha (limpa nome) - requer ação
export const bulkUploadSchema = z.object({
  serviceId: z.string().min(1, "Serviço é obrigatório"),
  acaoId: z.string().min(1, "Ação é obrigatória para este tipo de serviço"),
  items: z.array(
    z.object({
      nome: z.string().min(1, "Nome é obrigatório"),
      documento: z.string().min(1, "Documento é obrigatório"),
    }),
  ),
});

export type BulkUploadInput = z.infer<typeof bulkUploadSchema>;
