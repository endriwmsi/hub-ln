import { z } from "zod";

// Tipos de campos disponíveis
export const fieldTypes = [
  "text",
  "email",
  "phone",
  "cpf",
  "cnpj",
  "number",
  "currency",
  "select",
  "textarea",
  "file",
  "date",
  "address",
  "city",
  "state",
] as const;

export type FieldType = (typeof fieldTypes)[number];

// Labels para tipos de campos
export const fieldTypeLabels: Record<FieldType, string> = {
  text: "Texto",
  email: "E-mail",
  phone: "Telefone",
  cpf: "CPF",
  cnpj: "CNPJ",
  number: "Número",
  currency: "Valor Monetário",
  select: "Seleção",
  textarea: "Texto Longo",
  file: "Arquivo",
  date: "Data",
  address: "Endereço",
  city: "Cidade",
  state: "Estado",
};

// Schema para opções de campo select
export const selectOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
});

// Schema para opções de validação
export const fieldOptionsSchema = z
  .object({
    // Para select
    options: z.array(selectOptionSchema).optional(),
    // Para text/textarea
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    pattern: z.string().optional(),
    // Para file
    accept: z.string().optional(),
    maxSize: z.number().optional(), // em bytes
    // Para number/currency
    min: z.number().optional(),
    max: z.number().optional(),
  })
  .optional();

// Schema para criação de campo
export const createFormFieldSchema = z.object({
  serviceId: z.string().min(1, "Serviço é obrigatório"),
  name: z
    .string()
    .min(1, "Nome técnico é obrigatório")
    .regex(
      /^[a-zA-Z][a-zA-Z0-9_]*$/,
      "Nome deve começar com letra e conter apenas letras, números e underscore",
    ),
  label: z.string().min(1, "Label é obrigatório"),
  placeholder: z.string().optional(),
  type: z.enum(fieldTypes),
  required: z.boolean(),
  order: z.number().int(),
  options: fieldOptionsSchema,
});

export type CreateFormFieldInput = z.infer<typeof createFormFieldSchema>;

// Schema para atualização de campo
export const updateFormFieldSchema = createFormFieldSchema.partial().extend({
  id: z.string().min(1, "ID é obrigatório"),
});

export type UpdateFormFieldInput = z.infer<typeof updateFormFieldSchema>;

// Schema para reordenação de campos
export const reorderFieldsSchema = z.object({
  serviceId: z.string().min(1, "Serviço é obrigatório"),
  fieldOrders: z.array(
    z.object({
      id: z.string(),
      order: z.number().int(),
    }),
  ),
});

export type ReorderFieldsInput = z.infer<typeof reorderFieldsSchema>;

// Estados civis para select pré-definido
export const estadoCivilOptions = [
  { value: "solteiro", label: "Solteiro(a)" },
  { value: "casado", label: "Casado(a)" },
  { value: "divorciado", label: "Divorciado(a)" },
  { value: "viuvo", label: "Viúvo(a)" },
  { value: "separado", label: "Separado(a)" },
  { value: "uniao_estavel", label: "União Estável" },
];

// Estados brasileiros para select pré-definido
export const estadosOptions = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];
