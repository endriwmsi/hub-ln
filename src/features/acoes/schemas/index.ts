import { z } from "zod";

// Status para órgãos
export const statusOrgaoSchema = z.enum([
  "aguardando_baixas",
  "baixas_iniciadas",
  "baixas_completas",
]);

export type StatusOrgao = z.infer<typeof statusOrgaoSchema>;

// Labels para exibição
export const statusOrgaoLabels: Record<StatusOrgao, string> = {
  aguardando_baixas: "Aguardando Baixas",
  baixas_iniciadas: "Baixas Iniciadas",
  baixas_completas: "Baixas Completas",
};

// Schema de filtros para listagem de ações
export const acaoFiltersSchema = z.object({
  search: z.string().optional(),
  visivel: z.enum(["all", "true", "false"]).optional(),
  permiteEnvios: z.enum(["all", "true", "false"]).optional(),
  sortBy: z.enum(["createdAt", "nome", "dataInicio", "dataFim"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
});

export type AcaoFilters = z.infer<typeof acaoFiltersSchema>;

// Schema base para criação de ação (para uso com react-hook-form)
export const createAcaoBaseSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  dataInicio: z.date({ message: "Data de início é obrigatória" }),
  dataFim: z.date({ message: "Data de fim é obrigatória" }),
  statusSpc: statusOrgaoSchema,
  statusBoaVista: statusOrgaoSchema,
  statusSerasa: statusOrgaoSchema,
  statusCenprotNacional: statusOrgaoSchema,
  statusCenprotSp: statusOrgaoSchema,
  statusOutros: statusOrgaoSchema,
  visivel: z.boolean(),
  permiteEnvios: z.boolean(),
  // Campos admin-only
  responsavel: z.string().max(100, "Nome muito longo").optional().nullable(),
  custoProcesso: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Formato inválido. Use: 0.00")
    .optional()
    .nullable(),
});

export type CreateAcaoInput = z.infer<typeof createAcaoBaseSchema>;

// Schema completo para validação no servidor (aceita string ou Date)
export const createAcaoSchema = z
  .object({
    nome: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
    dataInicio: z.coerce.date(),
    dataFim: z.coerce.date(),
    statusSpc: statusOrgaoSchema.default("aguardando_baixas"),
    statusBoaVista: statusOrgaoSchema.default("aguardando_baixas"),
    statusSerasa: statusOrgaoSchema.default("aguardando_baixas"),
    statusCenprotNacional: statusOrgaoSchema.default("aguardando_baixas"),
    statusCenprotSp: statusOrgaoSchema.default("aguardando_baixas"),
    statusOutros: statusOrgaoSchema.default("aguardando_baixas"),
    visivel: z.boolean().default(true),
    permiteEnvios: z.boolean().default(true),
    // Campos admin-only
    responsavel: z.string().max(100).optional().nullable(),
    custoProcesso: z.string().optional().nullable(),
  })
  .refine((data) => data.dataFim >= data.dataInicio, {
    message: "Data de fim deve ser maior ou igual à data de início",
    path: ["dataFim"],
  });

// Schema para atualização de ação
export const updateAcaoSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  nome: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome muito longo")
    .optional(),
  dataInicio: z.coerce.date().optional(),
  dataFim: z.coerce.date().optional(),
  statusSpc: statusOrgaoSchema.optional(),
  statusBoaVista: statusOrgaoSchema.optional(),
  statusSerasa: statusOrgaoSchema.optional(),
  statusCenprotNacional: statusOrgaoSchema.optional(),
  statusCenprotSp: statusOrgaoSchema.optional(),
  statusOutros: statusOrgaoSchema.optional(),
  visivel: z.boolean().optional(),
  permiteEnvios: z.boolean().optional(),
  // Campos admin-only
  responsavel: z.string().max(100).optional().nullable(),
  custoProcesso: z.string().optional().nullable(),
});

export type UpdateAcaoInput = z.infer<typeof updateAcaoSchema>;

// Schema para atualização de status específico
export const updateAcaoStatusSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  field: z.enum([
    "statusSpc",
    "statusBoaVista",
    "statusSerasa",
    "statusCenprotNacional",
    "statusCenprotSp",
    "statusOutros",
  ]),
  value: statusOrgaoSchema,
});

export type UpdateAcaoStatusInput = z.infer<typeof updateAcaoStatusSchema>;

// Schema para toggle de visibilidade/envios
export const toggleAcaoFieldSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  field: z.enum(["visivel", "permiteEnvios"]),
  value: z.boolean(),
});

export type ToggleAcaoFieldInput = z.infer<typeof toggleAcaoFieldSchema>;

// Labels para os órgãos
export const orgaoLabels = {
  statusSpc: "SPC",
  statusBoaVista: "Boa Vista",
  statusSerasa: "Serasa",
  statusCenprotNacional: "Cenprot Nacional",
  statusCenprotSp: "Cenprot SP",
  statusOutros: "Outros",
} as const;

export type OrgaoField = keyof typeof orgaoLabels;
