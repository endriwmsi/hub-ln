# Documentação Técnica - Hub LN (Plataforma SaaS Multi-Tenant)

## 📋 Visão Geral do Projeto e Regras Globais
Esta é uma plataforma SaaS multi-tenant para agência de serviços financeiros com sistema de comissionamento em pirâmide, gestão de créditos compartilhados, assinaturas e múltiplos gateways de pagamento.

### Diretrizes Fundamentais
- **Multi-tenant**: Usuário admin (User 01) com visibilidade total + usuários com dados isolados.
- **Créditos Compartilhados**: Limite global baseado no saldo do User 01.
- **Sistema de Comissionamento em Pirâmide**: Referrals com comissões sobre diferença de preços.
- **Pagamentos**: Dual Payment Gateway - AbacatePay (assinaturas recorrentes) + Asaas (pagamentos avulsos de serviços).

## 🛠 Stack Tecnológica Base
Sempre obedeça rigorosamente a este stack para o desenvolvimento do projeto:
- **Core Framework**: Next.js 16 (App Router + Turbopack), React 19.2.
- **Linguagem**: TypeScript (tipagem estrita, evite `any`).
- **Banco de Dados & ORM**: PostgreSQL (Neon) + Drizzle ORM (type-safe). Utilize UUID v7 para IDs.
- **Autenticação**: Better Auth.
- **State Management**: React Query (TanStack Query v5) para data fetching (cache, optimistic updates).
- **Validação & Formulários**: Zod + React Hook Form.
- **UI & Estilização**: shadcn/ui (Radix UI) + Tailwind CSS + Lucide Icons.
- **Utilitários**: date-fns (datas), XLSX (parse de planilhas).

## 📁 Arquitetura do Projeto
O projeto segue uma **Arquitetura Feature-Based** com os seguintes diretórios principais:
- `src/app/`: Next.js App Router com groups `(app)`, `(auth)`, `(dashboard)`.
- `src/features/`: 🎯 CORE. Contém pastas modulares por funcionalidade (ex: `auth`, `acoes`, `envios`, `users`). Cada feature possui sua própria estrutura isolada de `components`, `hooks`, `actions`, `schemas`, `db` (schema drizzle isolado), `lib` e uma API pública em `index.ts`.
- `src/shared/`: Código e componentes genéricos compartilhados.
- `src/core/`: Infraestrutura central como configuração de banco, provedores globais, etc.

---

## 📚 Diretórios de Skills e Padrões (Leia antes de atuar)

Sempre que a sua tarefa envolver algum dos tópicos listados abaixo, **você DEVE obrigatoriamente** usar a ferramenta de leitura de arquivos para consultar a documentação específica (`SKILL.md`) antes de iniciar a implementação ou planejar qualquer modificação.

- **Autenticação (Better Auth):**
  Leia `.gemini/skills/authentication/SKILL.md`

- **Tabelas de Dados (Data Tables):**
  Leia `.gemini/skills/data-tables/SKILL.md`

- **Schema de Banco de Dados (Drizzle ORM):**
  Leia `.gemini/skills/drizzle-schema/SKILL.md`

- **Arquitetura de Features (Feature-Based):**
  Leia `.gemini/skills/feature-architecture/SKILL.md` 

- **Busca de Dados e Mutação (React Query):**
  Leia `.gemini/skills/react-query/SKILL.md`

- **Ações no Servidor (Server Actions):**
  Leia `.gemini/skills/server-actions/SKILL.md`

- **Componentes Visuais (shadcn/ui):**
  Leia `.gemini/skills/shadcn-ui/SKILL.md`
