---
applyTo: "**"
---

# Documentação Técnica - Plataforma SaaS Multi-Tenant para Agência

## 📋 Visão Geral do Projeto

Plataforma SaaS para agência de serviços financeiros (limpa nome, recuperação de rating bancário, etc.) com sistema de comissionamento em pirâmide, gestão de créditos compartilhados, assinaturas e múltiplos gateways de pagamento.

### Características Principais

- **Multi-tenant**: Usuário admin (User 01) com visibilidade total + usuários com dados isolados
- **Sistema de Comissionamento em Pirâmide**: Referrals com comissões sobre diferença de preços
- **Dual Payment Gateway**: AbacatePay (assinaturas) + Asaas (pagamentos avulsos)
- **Créditos Compartilhados**: Limite global baseado no saldo do User 01
- **Gestão de Ações**: Campanhas com múltiplos envios de clientes
- **Consulta CPF/CNPJ**: Integração com API externa consumindo créditos
- **Editor de Criativos**: Ferramenta tipo Canva simplificada (requer assinatura ativa)
- **Import Excel**: Upload de planilhas .xlsx para envio em massa

---

## 🛠 Stack Tecnológica

### Core Framework

- **Next.js 16** (App Router + Turbopack)
- **React 19.2**
- **TypeScript**

### Banco de Dados & ORM

- **PostgreSQL** (Neon)
- **Drizzle ORM** (type-safe, lightweight)
- **UUID v7** (Para ids da database)

### Autenticação & Autorização

- **Better Auth** (moderna, type-safe, Next.js native)

### State Management & Data Fetching

- **React Query (TanStack Query v5)**
  - Auto-refetch a cada 30s nas páginas de transações
  - Otimistic updates
  - Cache automático

### Validação & Formulários

- **Zod** (schemas de validação)
- **React Hook Form** (performance otimizada)

### UI Components

- **shadcn/ui** (Radix UI + Tailwind CSS)
- **Tailwind CSS**
- **Lucide Icons**

### Pagamentos

- **AbacatePay API** (assinaturas recorrentes)
- **Asaas API** (pagamentos avulsos de serviços)

### Utilitários

- **XLSX** (parse de planilhas Excel)
- **date-fns** (manipulação de datas)

---

## 📁 Arquitetura Feature-Based

### Estrutura de Diretórios

```
src/
├── app/ # Next.js App Router
│ ├── (app)/ # Route group - autenticação
│ │ ├── (auth)/ # Route group - autenticação
│ │ ├── (dashboard)/ # Route group - área logada
│ ├── api/ # API Routes (webhooks)
│ ├── layout.tsx
│
├── features/ # 🎯 CORE - Feature-based architecture
│ ├── auth/
│ ├── acoes/
│ ├── envios/
│ ├── consultas/
│ ├── credits/
│ ├── commissions/
│ ├── subscriptions/
│ ├── payments/
│ ├── services/
│ ├── users/
│ └── editor/
│
├── shared/ # Código compartilhado entre features
│ ├── components/
│ ├── hooks/
│ ├── lib/
│ └── types/
│
├── core/ # Infraestrutura central
│ ├── db/
│ ├── auth/
│ ├── providers/
│ └── config/
│
├── proxy.ts # ⚠️ Next.js 16 - substituiu middleware.ts
└── types/
```

### Anatomia de uma Feature

Cada feature segue este padrão:

```
features/[feature-name]/
├── components/ # Componentes React específicos
│ ├── feature-form.tsx
│ ├── feature-table.tsx
│ └── index.ts # Public exports
│
├── hooks/ # React hooks (React Query)
│ ├── use-feature.ts
│ ├── use-feature-mutation.ts
│ └── index.ts
│
├── actions/ # Server Actions
│ ├── create-feature.ts
│ ├── update-feature.ts
│ └── index.ts
│
├── schemas/ # Validação Zod
│ ├── feature.schema.ts
│ └── index.ts
│
├── types/ # TypeScript types
│ └── index.ts
│
├── db/ # Schema Drizzle
│ ├── schema.ts
│ ├── queries.ts
│ └── index.ts
│
├── lib/ # Lógica de negócio isolada
│ └── index.ts
│
└── index.ts # 🔑 Public API da feature
```
