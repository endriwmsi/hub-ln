import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { user } from "./user.schema";

// Status para cada órgão de proteção ao crédito
export const statusOrgaoEnum = pgEnum("status_orgao", [
  "aguardando_baixas",
  "baixas_iniciadas",
  "baixas_completas",
]);

export const acao = pgTable("acao", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),

  // Informações básicas
  nome: text("nome").notNull(),
  dataInicio: date("data_inicio", { mode: "date" }).notNull(),
  dataFim: date("data_fim", { mode: "date" }).notNull(),

  // Status por órgão
  statusSpc: statusOrgaoEnum("status_spc")
    .default("aguardando_baixas")
    .notNull(),
  statusBoaVista: statusOrgaoEnum("status_boa_vista")
    .default("aguardando_baixas")
    .notNull(),
  statusSerasa: statusOrgaoEnum("status_serasa")
    .default("aguardando_baixas")
    .notNull(),
  statusCenprotNacional: statusOrgaoEnum("status_cenprot_nacional")
    .default("aguardando_baixas")
    .notNull(),
  statusCenprotSp: statusOrgaoEnum("status_cenprot_sp")
    .default("aguardando_baixas")
    .notNull(),
  statusOutros: statusOrgaoEnum("status_outros")
    .default("aguardando_baixas")
    .notNull(),

  // Configurações de visibilidade e envios
  visivel: boolean("visivel").default(true).notNull(),
  permiteEnvios: boolean("permite_envios").default(true).notNull(),

  // Metadados
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdById: text("created_by_id").references(() => user.id),
});

export const acaoRelations = relations(acao, ({ one }) => ({
  createdBy: one(user, {
    fields: [acao.createdById],
    references: [user.id],
  }),
}));

export type Acao = typeof acao.$inferSelect;
export type NewAcao = typeof acao.$inferInsert;
export type StatusOrgao =
  | "aguardando_baixas"
  | "baixas_iniciadas"
  | "baixas_completas";
