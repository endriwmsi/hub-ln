---
applyTo: "**"
---

# Documentação Técnica - Plataforma SaaS Multi-Tenant para Agência

## 📋 Visão Geral do Projeto

Plataforma SaaS multi-tenant para agência de serviços financeiros (limpa nome, recuperação de rating bancário, etc.) com sistema de comissionamento em pirâmide, gestão de créditos compartilhados, assinaturas e múltiplos gateways de pagamento.

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

- **PostgreSQL** (recomendado: Supabase ou Neon)
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

### Regras de Importação

```typescript
// ✅ CORRETO - Importar da Public API
import { CommissionBalance, useCommissions } from "@/features/commissions";

// ❌ ERRADO - Não importar diretamente de subpastas
import { CommissionBalance } from "@/features/commissions/components/commission-balance";
```

---

## 🔐 Autenticação & Autorização (Next.js 16)

### ⚠️ Mudança Importante: proxy.ts (Next.js 16)

No Next.js 16, `middleware.ts` foi substituído por `proxy.ts` [25][26][28].

**O que mudou:**

- `middleware.ts` → `proxy.ts`
- `export function middleware()` → `export function proxy()`
- Proxy deve ser usado APENAS para routing, rewrites e redirects
- **Autenticação NÃO deve estar no proxy** (vulnerabilidade de segurança)

### proxy.ts - Apenas Routing

```typescript
// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ OK - Redirects simples
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ✅ OK - Rewrites
  if (pathname.startsWith("/docs")) {
    return NextResponse.rewrite(new URL("/documentation", request.url));
  }

  // ❌ NÃO FAZER - Auth checks aqui são inseguros
  // const token = request.cookies.get('auth_token');
  // if (!token) return NextResponse.redirect(new URL('/login', request.url));

  return NextResponse.next();
}
```

### Data Access Layer (DAL) - Onde a Auth DEVE estar

```typescript
// core/auth/dal.ts
import "server-only";
import { cache } from "react";
import { auth } from "./config";
import { redirect } from "next/navigation";

export const verifySession = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return { isAuth: true, userId: session.user.id };
});

export const requireAdmin = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return session;
});

export const requireActiveSubscription = cache(async () => {
  const { userId } = await verifySession();

  const subscription = await db.query.subscriptions.findFirst({
    where: and(
      eq(subscriptions.userId, userId),
      eq(subscriptions.status, "active"),
    ),
  });

  if (!subscription) {
    redirect("/assinaturas");
  }

  return subscription;
});
```

### Uso nas Pages e Server Actions

```typescript
// app/(dashboard)/editor/page.tsx
import { requireActiveSubscription } from "@/core/auth/dal";
import { EditorCanvas } from "@/features/editor";

export default async function EditorPage() {
  // Verificação de auth + subscription
  await requireActiveSubscription();

  return <EditorCanvas />;
}
```

```typescript
// features/acoes/actions/create-acao.ts
"use server";

import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import { acoes } from "../db/schema";

export async function createAcao(data: CreateAcaoInput) {
  const { userId } = await verifySession();

  const acao = await db
    .insert(acoes)
    .values({
      ...data,
      createdById: userId,
    })
    .returning();

  return acao[0];
}
```

---

## 🗄 Modelagem do Banco de Dados

### Estrutura Multi-Tenant

```typescript
// features/users/db/schema.ts
import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { uuidv7 } from 'uuidv7';

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => uuidv7())

  // Autenticação (únicos)
  email: varchar('email', { length: 255 })
    .notNull()
    .unique(),

  // Documentos (únicos)
  cpf: varchar('cpf', { length: 11 })
    .unique(), // Apenas números, sem pontuação

  cnpj: varchar('cnpj', { length: 14 })
    .unique(), // Apenas números, sem pontuação

  // Informações Pessoais
  fullName: varchar('full_name', { length: 255 })
    .notNull(),

  phone: varchar('phone', { length: 20 })
    .notNull(), // Formato: +55 (11) 98765-4321

  // Endereço Completo
  addressStreet: varchar('address_street', { length: 255 }),
  addressNumber: varchar('address_number', { length: 20 }),
  addressComplement: varchar('address_complement', { length: 100 }),
  addressNeighborhood: varchar('address_neighborhood', { length: 100 }),
  addressCity: varchar('address_city', { length: 100 }),
  addressState: varchar('address_state', { length: 2 }), // UF: SP, RJ, etc
  addressZipCode: varchar('address_zip_code', { length: 8 }), // CEP sem hífen

  // Sistema
  role: varchar('role', { length: 50 })
    .default('user')
    .notNull(), // 'admin' | 'user'

  // Sistema de Indicação
  referrerId: uuid('referrer_id')
    .references(() => users.id, { onDelete: 'set null' }),

  // Status
  isActive: boolean('is_active')
    .default(true)
    .notNull(),

  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});
```

### Ações e Envios

````typescript
// features/acoes/db/schema.ts
import { pgTable, uuid, varchar, date, timestamp } from 'drizzle-orm/pg-core';
import { users } from '@/features/users/db/schema';
import { uuidv7 } from 'uuidv7';

export const acoes = pgTable('acoes', {
id: text('id').primaryKey().$defaultFn(() => uuidv7()),
name: varchar('name', { length: 255 }).notNull(),
type: varchar('type', { length: 100 }).notNull(), // 'limpa_nome' | 'rating' | etc
date: date('date').notNull(),
createdById: uuid('created_by_id').references(() => users.id).notNull(),
status: varchar('status', { length: 50 }).default('pending'),
createdAt: timestamp('created_at').defaultNow(),
});
```

```typescript
// features/envios/db/schema.ts
import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { acoes } from '@/features/acoes/db/schema';
import { users } from '@/features/users/db/schema';
import { uuidv7 } from 'uuidv7';


export const envios = pgTable('envios', {
  id: text('id').primaryKey().$defaultFn(() => uuidv7()),
  acaoId: uuid('acao_id').references(() => acoes.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  clientName: varchar('client_name', { length: 255 }).notNull(),
  document: varchar('document', { length: 20 }).notNull(), // CPF/CNPJ
  status: varchar('status', { length: 50 }).default('pending'), // 'pending' | 'cleared'
  createdAt: timestamp('created_at').defaultNow(),
});
```

### Sistema de Comissões (Pirâmide)

```typescript
// features/services/db/schema.ts
import { pgTable, uuid, varchar, decimal, boolean } from 'drizzle-orm/pg-core';
import { uuidv7 } from 'uuidv7';

export const services = pgTable('services', {
  id: text('id').primaryKey().$defaultFn(() => uuidv7()),
  name: varchar('name', { length: 255 }).notNull(),
  basePrice: decimal('base_price', { precision: 10, scale: 2 }).notNull(), // Preço do User 01
  createdById: uuid('created_by_id').references(() => users.id),
  isActive: boolean('is_active').default(true),
});

export const servicePrices = pgTable('service_prices', {
  id: text('id').primaryKey().$defaultFn(() => uuidv7()),
  serviceId: uuid('service_id').references(() => services.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  customPrice: decimal('custom_price', { precision: 10, scale: 2 }).notNull(),
});
```

```typescript
// features/commissions/db/schema.ts
import { pgTable, uuid, decimal, varchar, timestamp } from 'drizzle-orm/pg-core';
import { uuidv7 } from 'uuidv7';

export const commissions = pgTable('commissions', {
  id: text('id').primaryKey().$defaultFn(() => uuidv7()),
  userId: uuid('user_id').references(() => users.id).notNull(),
  envioId: uuid('envio_id').references(() => envios.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 50 }).default('pending'), // 'pending' | 'available' | 'withdrawn'
  createdAt: timestamp('created_at').defaultNow(),
});

export const withdrawals = pgTable('withdrawals', {
  id: text('id').primaryKey().$defaultFn(() => uuidv7()),
  userId: uuid('user_id').references(() => users.id).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 50 }).default('pending'),
  requestedAt: timestamp('requested_at').defaultNow(),
  processedAt: timestamp('processed_at'),
});
```

### Créditos Compartilhados

```typescript
// features/credits/db/schema.ts
import { pgTable, uuid, integer, timestamp } from 'drizzle-orm/pg-core';
import { uuidv7 } from 'uuidv7';

export const credits = pgTable('credits', {
  id: text('id').primaryKey().$defaultFn(() => uuidv7()),
  userId: uuid('user_id').references(() => users.id).notNull().unique(),
  amount: integer('amount').default(0),
  maxAllowed: integer('max_allowed'), // Baseado no saldo do User 01
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const creditTransactions = pgTable('credit_transactions', {
  id: text('id').primaryKey().$defaultFn(() => uuidv7()),
  userId: uuid('user_id').references(() => users.id).notNull(),
  amount: integer('amount').notNull(), // Negativo = consumo, Positivo = compra
  type: varchar('type', { length: 50 }).notNull(), // 'purchase' | 'consumption' | 'refund'
  description: varchar('description', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
});
```

### Assinaturas

```typescript
// features/subscriptions/db/schema.ts
import { pgTable, uuid, varchar, decimal, timestamp } from 'drizzle-orm/pg-core';
import { uuidv7 } from 'uuidv7';

export const subscriptions = pgTable('subscriptions', {
  id: text('id').primaryKey().$defaultFn(() => uuidv7()),
  userId: uuid('user_id').references(() => users.id).notNull(),
  status: varchar('status', { length: 50 }).notNull(), // 'active' | 'canceled' | 'expired' | 'past_due'
  planType: varchar('plan_type', { length: 100 }),
  amount: decimal('amount', { precision: 10, scale: 2 }),
  paymentGateway: varchar('payment_gateway', { length: 50 }), // 'abacatepay' | 'asaas'
  externalId: varchar('external_id', { length: 255 }), // ID no gateway
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

### Consolidação no Core

```typescript
// core/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import _ as usersSchema from '@/features/users/db/schema';
import _ as acoesSchema from '@/features/acoes/db/schema';
import _ as enviosSchema from '@/features/envios/db/schema';
import _ as commissionsSchema from '@/features/commissions/db/schema';
import _ as creditsSchema from '@/features/credits/db/schema';
import _ as servicesSchema from '@/features/services/db/schema';
import * as subscriptionsSchema from '@/features/subscriptions/db/schema';

const schema = {
...usersSchema,
...acoesSchema,
...enviosSchema,
...commissionsSchema,
...creditsSchema,
...servicesSchema,
...subscriptionsSchema,
};

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, { schema });
```

---

## ⚡ Server Actions Pattern

### Estrutura de uma Server Action

```typescript
// features/acoes/actions/create-acao.ts
'use server'

import { verifySession } from '@/core/auth/dal';
import { db } from '@/core/db';
import { acoes } from '../db/schema';
import { createAcaoSchema } from '../schemas';
import { revalidatePath } from 'next/cache';

export async function createAcao(input: unknown) {
  // 1. Verificar autenticação
  const { userId } = await verifySession();

  // 2. Validar input
  const validatedData = createAcaoSchema.parse(input);

  // 3. Lógica de negócio
  const [acao] = await db.insert(acoes).values({
  ...validatedData,
  createdById: userId,
  }).returning();

  // 4. Revalidar cache
  revalidatePath('/acoes');

  // 5. Retornar resultado
  return { success: true, data: acao };
}
```

### Public API da Feature

```typescript
// features/acoes/index.ts
export { AcaoForm } from './components/acao-form';
export { AcoesTable } from './components/acoes-table';
export { AcaoCard } from './components/acao-card';

export { useAcoes } from './hooks/use-acoes';
export { useCreateAcao } from './hooks/use-create-acao';

export { createAcao, updateAcao, deleteAcao } from './actions';

export type { Acao } from './types';
```

---

## 🔄 React Query Pattern

### Hook de Query com Auto-Refetch

```typescript
// features/commissions/hooks/use-commissions.ts
'use client'

import { useQuery } from '@tanstack/react-query';
import { getCommissions } from '../actions';

export function useCommissions() {
  return useQuery({
    queryKey: ['commissions'],
    queryFn: getCommissions,
    refetchInterval: 30000, // 30 segundos (requisito para página de transações)
    staleTime: 20000,
  });
}
```

### Hook de Mutation

```typescript
// features/commissions/hooks/use-request-withdrawal.ts
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { requestWithdrawal } from '../actions';
import { toast } from 'sonner';

export function useRequestWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requestWithdrawal,
    onSuccess: () => {
      toast.success('Solicitação de saque enviada!');
      queryClient.invalidateQueries({ queryKey: ['commissions'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
    },
    onError: (error) => {
      toast.error('Erro ao solicitar saque');
      console.error(error);
    },
  });
}
```

### Provider no Layout

```typescript
// core/providers/index.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
      staleTime: 60 * 1000, // 1 minuto
      retry: 1,
    },
  },
}));

return (
  <QueryClientProvider client={queryClient}>
    {children}
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
  );
}
```

---

## 💳 Integração com Gateways de Pagamento

### AbacatePay - Assinaturas Recorrentes

```typescript
// features/subscriptions/lib/abacatepay-client.ts
export class AbacatePayClient {
  private baseUrl = 'https://api.abacatepay.com/v1';
  private apiKey = process.env.ABACATEPAY_API_KEY!;

  async createSubscription(params: {
    userId: string;
    email: string;
    planId: string;
    amount: number;
  }) {
    const response = await fetch(`${this.baseUrl}/billing/subscription`, {
      method: 'POST',
      headers: {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    },
      body: JSON.stringify({
      customer_email: params.email,
      plan_id: params.planId,
      amount: params.amount,
      metadata: {
        user_id: params.userId,
      },
    }),
  });

  if (!response.ok) {
    throw new Error('Erro ao criar assinatura');
  }

  return response.json();

}

async cancelSubscription(subscriptionId: string) {
  const response = await fetch(
    `${this.baseUrl}/billing/subscription/${subscriptionId}/cancel`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    }
  );

  return response.json();
  }
}
```

### Webhook Handler

```typescript
// app/api/webhooks/abacatepay/route.ts
import { db } from '@/core/db';
import { subscriptions } from '@/features/subscriptions/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  const body = await request.json();

  // Validar webhook signature aqui

  switch (body.event) {
    case 'subscription.activated':
      await db.update(subscriptions)
        .set({ status: 'active' })
        .where(eq(subscriptions.externalId, body.data.id));
      break;

    case 'subscription.canceled':
      await db.update(subscriptions)
        .set({ status: 'canceled' })
        .where(eq(subscriptions.externalId, body.data.id));
      break;

    case 'subscription.payment_failed':
      await db.update(subscriptions)
        .set({ status: 'past_due' })
        .where(eq(subscriptions.externalId, body.data.id));
      break;
  }

  return Response.json({ received: true });
}
```

### Asaas - Pagamentos Avulsos

```typescript
// features/payments/lib/asaas-client.ts
export class AsaasClient {
  private baseUrl = 'https://api.asaas.com/v3';
  private apiKey = process.env.ASAAS_API_KEY!;

  async createPayment(params: {
    userId: string;
    value: number;
    description: string;
  }) {
    const response = await fetch(`${this.baseUrl}/payments`, {
    method: 'POST',
    headers: {
      'access_token': this.apiKey,
      'Content-Type': 'application/json',
    },
        body: JSON.stringify({
        customer: params.userId,
        billingType: 'PIX',
        value: params.value,
        dueDate: new Date().toISOString().split('T')[0],
        description: params.description,
      }),
    });

    return response.json();
  }
}
```

---

## 📊 Sistema de Comissionamento

### Cálculo de Comissão (Lógica Pirâmide)

```typescript
// features/commissions/lib/commission-calculator.ts
import { db } from '@/core/db';
import { users, servicePrices, commissions } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export async function calculateCommission(
  envioId: string,
  userId: string,
  serviceId: string
) {
// Buscar usuário e seu referrer
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user?.referrerId) {
    return null; // Usuário não tem referrer (é o User 01)
  }

// Buscar preço que o usuário vendeu
  const userPrice = await db.query.servicePrices.findFirst({
    where: and(
      eq(servicePrices.serviceId, serviceId),
      eq(servicePrices.userId, userId)
    ),
  });

  // Buscar preço do referrer
  const referrerPrice = await db.query.servicePrices.findFirst({
    where: and(
      eq(servicePrices.serviceId, serviceId),
      eq(servicePrices.userId, user.referrerId)
    ),
  });

  if (!userPrice || !referrerPrice) {
    throw new Error('Preços não encontrados');
  }

  // Comissão = Preço do usuário - Preço do referrer
  const commissionAmount =
  parseFloat(userPrice.customPrice) - parseFloat(referrerPrice.customPrice);

  if (commissionAmount <= 0) {
  return null;
  }

  // Criar registro de comissão
  const [commission] = await db.insert(commissions).values({
    userId: user.referrerId,
    envioId,
    amount: commissionAmount.toFixed(2),
    status: 'available',
  }).returning();

  return commission;
}
````

### Server Action de Envio com Comissão

```typescript
// features/envios/actions/create-envio.ts
"use server";

import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import { envios } from "../db/schema";
import { calculateCommission } from "@/features/commissions/lib/commission-calculator";

export async function createEnvio(input: {
  acaoId: string;
  clientName: string;
  document: string;
  serviceId: string;
}) {
  const { userId } = await verifySession();

  // Criar envio
  const [envio] = await db
    .insert(envios)
    .values({
      acaoId: input.acaoId,
      userId,
      clientName: input.clientName,
      document: input.document,
    })
    .returning();

  // Calcular e criar comissão para o referrer
  await calculateCommission(envio.id, userId, input.serviceId);

  return envio;
}
```

---

## 💰 Sistema de Créditos Compartilhados

### Lógica de Limite Global

```typescript
// features/credits/lib/credit-limiter.ts
import { db } from "@/core/db";
import { users, credits } from "../db/schema";
import { eq } from "drizzle-orm";

export async function getMaxAllowedCredits(userId: string) {
  // Buscar User 01 (admin)
  const admin = await db.query.users.findFirst({
    where: eq(users.role, "admin"),
  });

  if (!admin) {
    throw new Error("Admin não encontrado");
  }

  // Buscar créditos do admin
  const adminCredits = await db.query.credits.findFirst({
    where: eq(credits.userId, admin.id),
  });

  return adminCredits?.amount || 0;
}

export async function canPurchaseCredits(
  userId: string,
  amountToPurchase: number,
): Promise<boolean> {
  const maxAllowed = await getMaxAllowedCredits(userId);

  const userCredits = await db.query.credits.findFirst({
    where: eq(credits.userId, userId),
  });

  const currentAmount = userCredits?.amount || 0;

  return currentAmount + amountToPurchase <= maxAllowed;
}
```

### Server Action de Compra de Créditos

```typescript
// features/credits/actions/buy-credits.ts
"use server";

import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import { credits, creditTransactions } from "../db/schema";
import {
  canPurchaseCredits,
  getMaxAllowedCredits,
} from "../lib/credit-limiter";
import { eq } from "drizzle-orm";

export async function buyCredits(amount: number) {
  const { userId } = await verifySession();

  // Verificar limite
  const canPurchase = await canPurchaseCredits(userId, amount);

  if (!canPurchase) {
    const maxAllowed = await getMaxAllowedCredits(userId);
    throw new Error(
      `Limite de créditos excedido. Máximo permitido: ${maxAllowed}`,
    );
  }

  // Atualizar saldo
  const userCredit = await db.query.credits.findFirst({
    where: eq(credits.userId, userId),
  });

  if (userCredit) {
    await db
      .update(credits)
      .set({ amount: userCredit.amount + amount })
      .where(eq(credits.userId, userId));
  } else {
    await db.insert(credits).values({
      userId,
      amount,
    });
  }

  // Registrar transação
  await db.insert(creditTransactions).values({
    userId,
    amount,
    type: "purchase",
    description: `Compra de ${amount} créditos`,
  });

  return { success: true };
}
```

---

## 📤 Import de Excel

### Parser de Excel

```typescript
// features/envios/lib/excel-parser.ts
import * as XLSX from "xlsx";
import { z } from "zod";

const envioRowSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  documento: z.string().regex(/^d{11}$|^d{14}$/, "CPF/CNPJ inválido"),
});

export type EnvioRow = z.infer<typeof envioRowSchema>;

export async function parseExcelFile(file: File): Promise<EnvioRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);

  const validatedData = jsonData.map((row, index) => {
    try {
      return envioRowSchema.parse(row);
    } catch (error) {
      throw new Error(`Erro na linha ${index + 2}: ${error.message}`);
    }
  });

  return validatedData;
}
```

### Componente de Upload

```typescript
// features/envios/components/excel-import.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useBulkCreateEnvios } from "../hooks/use-bulk-create-envios";

const schema = z.object({
  acaoId: z.string().uuid(),
  file: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, "Arquivo obrigatório"),
});

export function ExcelImport({ acaoId }: { acaoId: string }) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { acaoId },
  });

  const { mutate, isPending } = useBulkCreateEnvios();

  const onSubmit = async (data: z.infer<typeof schema>) => {
    const file = data.file[0];
    mutate({ acaoId: data.acaoId, file });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input type="file" accept=".xlsx" {...form.register("file")} />
      <button type="submit" disabled={isPending}>
        {isPending ? "Importando..." : "Importar Excel"}
      </button>
    </form>
  );
}
```

### Server Action Bulk Create

```typescript
// features/envios/actions/bulk-create-envios.ts
"use server";

import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import { envios } from "../db/schema";
import { parseExcelFile } from "../lib/excel-parser";

export async function bulkCreateEnvios(acaoId: string, file: File) {
  const { userId } = await verifySession();

  // Parse do Excel
  const rows = await parseExcelFile(file);

  // Inserir em lote
  const values = rows.map((row) => ({
    acaoId,
    userId,
    clientName: row.nome,
    document: row.documento,
  }));

  const result = await db.insert(envios).values(values).returning();

  return { success: true, count: result.length };
}
```

---

## 🔍 Consulta CPF/CNPJ com Consumo de Créditos

### Server Action

```typescript
// features/consultas/actions/realizar-consulta.ts
"use server";

import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import { credits, creditTransactions } from "@/features/credits/db/schema";
import { consultaCPFCNPJ } from "../lib/consulta-api-client";
import { eq } from "drizzle-orm";

export async function realizarConsulta(document: string) {
  const { userId } = await verifySession();

  // Verificar saldo de créditos
  const userCredit = await db.query.credits.findFirst({
    where: eq(credits.userId, userId),
  });

  if (!userCredit || userCredit.amount < 1) {
    throw new Error("Créditos insuficientes");
  }

  // Realizar consulta na API externa
  const result = await consultaCPFCNPJ(document);

  // Consumir 1 crédito
  await db
    .update(credits)
    .set({ amount: userCredit.amount - 1 })
    .where(eq(credits.userId, userId));

  // Registrar transação
  await db.insert(creditTransactions).values({
    userId,
    amount: -1,
    type: "consumption",
    description: `Consulta CPF/CNPJ: ${document}`,
  });

  return result;
}
```

---

## 🎨 Componentes shadcn/ui

### Instalação

```bash
npx shadcn@latest init
npx shadcn@latest add button input form table card dialog
```

### Exemplo de Formulário com React Hook Form

```typescript
// features/acoes/components/acao-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/shared/components/ui/form";
import { createAcaoSchema } from "../schemas";
import { useCreateAcao } from "../hooks/use-create-acao";

export function AcaoForm() {
  const form = useForm({
    resolver: zodResolver(createAcaoSchema),
    defaultValues: {
      name: "",
      type: "limpa_nome",
      date: new Date().toISOString().split("T")[0],
    },
  });

  const { mutate, isPending } = useCreateAcao();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutate(data))}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Ação</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? "Criando..." : "Criar Ação"}
        </Button>
      </form>
    </Form>
  );
}
```

---

## 🚀 Setup do Projeto

### 1. Instalar Dependências

```bash

# Core

pnpm add drizzle-orm postgres
pnpm add -D drizzle-kit

# Auth

pnpm add better-auth

# State & Forms

pnpm add @tanstack/react-query zod react-hook-form @hookform/resolvers/zod

# UI

pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button input form table card dialog select

# Utils

pnpm add xlsx date-fns sonner

# Dev

pnpm add -D @types/node
```

### 3. Configurar Environment Variables

```env

# .env.local

DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Better Auth

BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# AbacatePay

ABACATEPAY_API_KEY="your-api-key"

# Asaas

ASAAS_API_KEY="your-api-key"

# API de Consulta CPF/CNPJ

CONSULTA_API_URL="https://api.exemplo.com"
CONSULTA_API_KEY="your-api-key"
```

### 4. Configurar Drizzle

```typescript
// drizzle.config.ts
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/features/*/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

### 5. Scripts package.json

```json
{
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio"
  }
}
```

---

## 📝 Convenções de Código

### Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`)
- **Files**: kebab-case (`user-profile.tsx`)
- **Hooks**: camelCase com prefixo "use" (`useUserData.ts`)
- **Server Actions**: camelCase (`createUser.ts`)
- **Types**: PascalCase (`User`, `CreateUserInput`)

### Import Order

```typescript
// 1. React/Next
import { useState } from "react";
import { redirect } from "next/navigation";

// 2. External libraries
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

// 3. Internal - Features
import { useCommissions } from "@/features/commissions";

// 4. Internal - Shared
import { Button } from "@/shared/components/ui/button";

// 5. Internal - Core
import { db } from "@/core/db";

// 6. Relative imports
import { schema } from "./schema";
```

### Server-Only Code

```typescript
// Sempre use 'server-only' em arquivos que não devem ser incluídos no bundle do cliente
import "server-only";

export async function sensitiveServerFunction() {
  // código que usa secrets, db direto, etc.
}
```

---

## 🔒 Segurança

### Checklist de Segurança

- ✅ Nunca colocar lógica de autenticação no proxy.ts
- ✅ Sempre usar Data Access Layer (DAL) para verificações de auth
- ✅ Validar TODOS os inputs com Zod (client + server)
- ✅ Usar 'server-only' em código sensível
- ✅ Verificar permissões em CADA Server Action
- ✅ Validar webhooks com signatures
- ✅ Usar variáveis de ambiente para secrets
- ✅ Implementar rate limiting em APIs públicas
- ✅ Sanitizar inputs de usuário antes de armazenar

### Exemplo de Validação Completa

```typescript
// features/acoes/actions/create-acao.ts
"use server";

import "server-only";
import { verifySession } from "@/core/auth/dal";
import { createAcaoSchema } from "../schemas";

export async function createAcao(rawInput: unknown) {
  // 1. Auth
  const { userId } = await verifySession();

  // 2. Validation
  const input = createAcaoSchema.parse(rawInput);

  // 3. Authorization (se necessário)
  // const user = await getUser(userId);
  // if (!user.canCreateAcao) throw new Error('Unauthorized');

  // 4. Business Logic
  const acao = await db
    .insert(acoes)
    .values({
      ...input,
      createdById: userId,
    })
    .returning();

  return acao;
}
```

---

## 🧪 Testing (Opcional mas Recomendado)

### Unit Tests

```typescript
// features/commissions/lib/commission-calculator.test.ts
import { describe, it, expect } from "vitest";
import { calculateCommission } from "./commission-calculator";

describe("calculateCommission", () => {
  it("should calculate correct commission amount", async () => {
    const result = await calculateCommission(
      "envio-id",
      "user-id",
      "service-id",
    );

    expect(result?.amount).toBe("10.00");
  });
});
```

---

## 📚 Recursos Adicionais

# AbacatePay - Guia de Integração para Modelos de Linguagem (Atualizado e Sincronizado)

## Visão Geral

A AbacatePay é um gateway de pagamento que permite a criação e gestão de cobranças de forma eficiente.
Atualmente, aceita pagamentos via **PIX** e **Cartão**.
Outros métodos (boleto, crypto, etc.) poderão ser implementados futuramente.

## Autenticação

- **Método:** Bearer Token
- **Detalhes:** Todas as requisições à API devem incluir um token JWT no cabeçalho de autorização.
- **Exemplo de Cabeçalho:**
  Authorization: Bearer {SEU_TOKEN_AQUI}
- **Documentação:** [Authentication](https://docs.abacatepay.com/pages/authentication)

## Modo Desenvolvedor (Dev Mode)

- **Descrição:** Ambiente para testes e desenvolvimento. Todas as operações realizadas neste modo são simuladas e não afetam o ambiente de produção.
- **Documentação:** [Dev Mode](https://docs.abacatepay.com/pages/devmode)

---

## Endpoints Principais

### Clientes

#### ➤ Criar Cliente

- **Endpoint:** `POST /v1/customer/create`
- **curl esperado como exemplo:**

```bash
curl --request POST \
  --url https://api.abacatepay.com/v1/customer/create \
  --header 'accept: application/json' \
  --header 'authorization: Bearer {SEU_TOKEN_AQUI}' \
  --header 'content-type: application/json' \
  --data '{
    "name": "Fulano de tal",
    "cellphone": "(00) 0000-0000",
    "email": "cliente@gmail.com",
    "taxId": "123.456.789-01"
  }'
```

**Explicação de cada parâmetro do Body:**

- **name** (string, obrigatório): Nome completo do cliente. Exemplo: "Fulano de tal".
- **cellphone** (string, obrigatório): Telefone celular do cliente. Exemplo: "(00) 0000-0000".
- **email** (string, obrigatório): Endereço de e-mail do cliente. Exemplo: "cliente@gmail.com".
- **taxId** (string, obrigatório): CPF ou CNPJ válido do cliente. Exemplo: "123.456.789-01".

**Modelo de resposta:**

```json
{
  "data": {
    "id": "cust_abcdef123456",
    "metadata": {
      "name": "Fulano de tal",
      "cellphone": "(00) 0000-0000",
      "email": "cliente@gmail.com",
      "taxId": "123.456.789-01"
    }
  },
  "error": null
}
```

- **Documentação:** [Criar Cliente](https://docs.abacatepay.com/pages/client/create)

---

#### ➤ Listar Clientes

- **Endpoint:** `GET /v1/customer/list`
- **curl esperado como exemplo:**

```bash
curl --request GET \
  --url https://api.abacatepay.com/v1/customer/list \
  --header 'accept: application/json' \
  --header 'authorization: Bearer {SEU_TOKEN_AQUI}'
```

_Esta rota não necessita de body. Os parâmetros de autenticação via cabeçalho são obrigatórios._

**Modelo de resposta:**

```json
{
  "data": [
    {
      "id": "cust_abcdef123456",
      "metadata": {
        "name": "Fulano de tal",
        "cellphone": "(00) 0000-0000",
        "email": "cliente@gmail.com",
        "taxId": "123.456.789-01"
      }
    }
  ],
  "error": null
}
```

- **Documentação:** [Listar Clientes](https://docs.abacatepay.com/pages/client/list)

---

### Cupons de Desconto

#### ➤ Criar Cupom

- **Endpoint:** `POST /v1/coupon/create`
- **curl esperado como exemplo:**

```bash
curl --request POST \
  --url https://api.abacatepay.com/v1/coupon/create \
  --header 'accept: application/json' \
  --header 'authorization: Bearer {SEU_TOKEN_AQUI}' \
  --header 'content-type: application/json' \
  --data '{
    "data": {
      "code": "DEYVIN_20",
      "notes": "Cupom de desconto para meu público",
      "maxRedeems": 10,
      "discountKind": "PERCENTAGE",
      "discount": 20,
      "metadata": {}
    }
  }'
```

**Explicação de cada parâmetro do Body (dentro do objeto "data"):**

- **code** (string, obrigatório): Identificador único do cupom. Exemplo: "DEYVIN_20".
- **notes** (string): Descrição ou observação sobre o cupom. Exemplo: "Cupom de desconto para meu público".
- **maxRedeems** (number, obrigatório): Número máximo de vezes que o cupom pode ser resgatado. Exemplo: 10. Use `-1` para ilimitado.
- **discountKind** (string, obrigatório): Tipo de desconto, podendo ser "PERCENTAGE" ou "FIXED".
- **discount** (number, obrigatório): Valor de desconto a ser aplicado. Exemplo: 20.
- **metadata** (object, opcional): Objeto para incluir metadados adicionais do cupom.

**Modelo de resposta:**

```json
{
  "data": {
    "id": "DEYVIN_20",
    "notes": "Cupom de desconto para meu público",
    "maxRedeems": 10,
    "redeemsCount": 0,
    "discountKind": "PERCENTAGE",
    "discount": 20,
    "devMode": true,
    "status": "ACTIVE",
    "createdAt": "2025-05-25T23:43:25.250Z",
    "updatedAt": "2025-05-25T23:43:25.250Z",
    "metadata": {}
  },
  "error": null
}
```

- **Documentação:** https://docs.abacatepay.com/api-reference/criar-um-novo-cupom

---

#### ➤ Listar Cupons

- **Endpoint:** `GET /v1/coupon/list`
- **curl esperado como exemplo:**

```bash
curl --request GET \
  --url https://api.abacatepay.com/v1/coupon/list \
  --header 'accept: application/json' \
  --header 'authorization: Bearer {SEU_TOKEN_AQUI}'
```

_Esta rota não necessita de parâmetros no body._

**Modelo de resposta:**

```json
{
  "data": [
    {
      "id": "DEYVIN_20",
      "notes": "Cupom de desconto para meu público",
      "maxRedeems": -1,
      "redeemsCount": 0,
      "discountKind": "PERCENTAGE",
      "discount": 20,
      "devMode": true,
      "status": "ACTIVE",
      "createdAt": "2025-05-25T23:43:25.250Z",
      "updatedAt": "2025-05-25T23:43:25.250Z",
      "metadata": {}
    }
  ],
  "error": null
}
```

- **Documentação:** [Listar Cupons](https://docs.abacatepay.com/pages/payment/list)

---

### Cobranças

#### ➤ Criar Cobrança

- **Endpoint:** `POST /v1/billing/create`
- **curl esperado como exemplo:**

```bash
curl --request POST \
  --url https://api.abacatepay.com/v1/billing/create \
  --header 'accept: application/json' \
  --header 'authorization: Bearer {SEU_TOKEN_AQUI}' \
  --header 'content-type: application/json' \
  --data '{
    "frequency": "ONE_TIME",
    "methods": ["PIX","CARD"],
    "products": [
      {
        "externalId": "prod-1234",
        "name": "Assinatura de Programa Fitness",
        "description": "Acesso ao programa fitness premium por 1 mês.",
        "quantity": 2,
        "price": 2000
      }
    ],
    "returnUrl": "https://example.com/billing",
    "completionUrl": "https://example.com/completion",
    "customerId": "cust_abcdefghij"
  }'
```

**Explicação de cada parâmetro do Body:**

- **frequency** (string, obrigatório): Define o tipo de frequência da cobrança. Valores possíveis: `"ONE_TIME"` ou `"MULTIPLE_PAYMENTS"`.
- **methods** (array de string, obrigatório): Lista com os métodos de pagamento aceitos. Agora aceita `"PIX"` e `"CARD"`.
- **products** (array de objeto, obrigatório): Lista de produtos incluso na cobrança.
  - **externalId** (string, obrigatório): Identificador único do produto no seu sistema.
  - **name** (string, obrigatório): Nome do produto.
  - **description** (string): Descrição do produto.
  - **quantity** (integer, obrigatório, ≥1): Quantidade do produto.
  - **price** (integer, obrigatório, mínimo 100): Preço unitário em centavos.
- **returnUrl** (string, obrigatório - URI): URL para redirecionamento caso o cliente escolha a opção "Voltar".
- **completionUrl** (string, obrigatório - URI): URL para redirecionamento após a conclusão do pagamento.
- **customerId** (string, opcional): ID de um cliente já cadastrado.
- **customer** (object, opcional): Objeto contendo os dados do cliente para criação imediata.

**Modelo de resposta:**

```json
{
  "data": {
    "id": "bill_123456",
    "url": "https://pay.abacatepay.com/bill-5678",
    "amount": 4000,
    "status": "PENDING",
    "devMode": true,
    "methods": ["PIX", "CARD"],
    "products": [
      {
        "id": "prod_123456",
        "externalId": "prod-1234",
        "quantity": 2
      }
    ],
    "frequency": "ONE_TIME",
    "nextBilling": null,
    "customer": {
      "id": "cust_abcdef123456",
      "metadata": {
        "name": "Fulano de tal",
        "cellphone": "(00) 0000-0000",
        "email": "cliente@gmail.com",
        "taxId": "123.456.789-01"
      }
    },
    "createdAt": "2025-03-24T21:50:20.772Z",
    "updatedAt": "2025-03-24T21:50:20.772Z"
  },
  "error": null
}
```

- **Documentação:** [Criar Cobrança](https://docs.abacatepay.com/pages/payment/create)

---

#### ➤ Buscar Cobrança

- **Endpoint:** `GET /v1/billing/get?id=bill_123456`
- **curl esperado como exemplo:**

```bash
curl --request GET \
  --url 'https://api.abacatepay.com/v1/billing/get?id=bill_123456' \
  --header 'accept: application/json' \
  --header 'authorization: Bearer {SEU_TOKEN_AQUI}'
```

**Modelo de resposta:** Igual ao modelo da criação de cobrança, retornando os detalhes de uma cobrança específica.

---

#### ➤ Listar Cobranças

- **Endpoint:** `GET /v1/billing/list`
- **curl esperado como exemplo:**

```bash
curl --request GET \
  --url https://api.abacatepay.com/v1/billing/list \
  --header 'accept: application/json' \
  --header 'authorization: Bearer {SEU_TOKEN_AQUI}'
```

**Modelo de resposta:**

```json
{
  "data": [
    {
      "id": "bill_123456",
      "url": "https://pay.abacatepay.com/bill-5678",
      "amount": 4000,
      "status": "PENDING",
      "devMode": true,
      "methods": ["PIX", "CARD"],
      "products": [
        {
          "id": "prod_123456",
          "externalId": "prod-1234",
          "quantity": 2
        }
      ],
      "frequency": "ONE_TIME",
      "nextBilling": null,
      "customer": {
        "id": "cust_abcdef123456",
        "metadata": {
          "name": "Fulano de tal",
          "cellphone": "(00) 0000-0000",
          "email": "cliente@gmail.com",
          "taxId": "123.456.789-01"
        }
      }
    }
  ],
  "error": null
}
```

- **Documentação:** [Listar Cobranças](https://docs.abacatepay.com/pages/payment/list)

---

### PIX QRCode

#### ➤ Criar QRCode PIX

- **Endpoint:** `POST /v1/pixQrCode/create`
- **curl esperado como exemplo:**

```bash
curl --request POST \
  --url https://api.abacatepay.com/v1/pixQrCode/create \
  --header 'accept: application/json' \
  --header 'authorization: Bearer {SEU_TOKEN_AQUI}' \
  --header 'content-type: application/json' \
  --data '{
    "amount": 100,
    "expiresIn": 3600,
    "description": "Pagamento de serviço",
    "customer": {
      "name": "Fulano de tal",
      "cellphone": "(00) 0000-0000",
      "email": "cliente@gmail.com",
      "taxId": "123.456.789-01"
    },
    "metadata": {
      "teste": "Valor do teste de metadata"
    }
  }'
```

**Explicação de cada parâmetro do Body:**

- **amount** (number, obrigatório): Valor da cobrança em centavos. Exemplo: 100 (R$1,00).
- **expiresIn** (number, opcional): Tempo de expiração da cobrança em segundos. Exemplo: 3600 (1 hora).
- **description** (string, opcional, máximo 140 caracteres): Mensagem que será exibida durante o pagamento do PIX. Exemplo: "Pagamento de serviço".
- **customer** (object, opcional): Objeto contendo os dados do cliente para criação, caso este ainda não esteja cadastrado.
  - **name** (string, obrigatório caso customer seja passado): Nome do cliente.
  - **cellphone** (string, obrigatório caso customer seja passado): Telefone do cliente.
  - **email** (string, obrigatório caso customer seja passado): E-mail do cliente.
  - **taxId** (string, obrigatório caso customer seja passado): CPF ou CNPJ do cliente.
- **metadata** (object, opcional): Objeto contendo os dados de um metadata customizável por parte de quem está integrando.

**Modelo de resposta:**

```json
{
  "data": {
    "id": "pix_char_123456",
    "amount": 100,
    "status": "PENDING",
    "devMode": true,
    "brCode": "00020101021226950014br.gov.bcb.pix",
    "brCodeBase64": "data:image/png;base64,iVBORw0KGgoAAA",
    "platformFee": 80,
    "createdAt": "2025-03-24T21:50:20.772Z",
    "updatedAt": "2025-03-24T21:50:20.772Z",
    "expiresAt": "2025-03-25T21:50:20.772Z",
    "metadata": {
      "teste": "Valor do teste de metadata"
    }
  },
  "error": null
}
```

- **Documentação:** [Criar QRCode PIX](https://docs.abacatepay.com/pages/pix)

---

#### ➤ Checar Status do QRCode PIX

- **Endpoint:** `GET /v1/pixQrCode/check`
- **curl esperado como exemplo:**

```bash
curl --request GET \
  --url 'https://api.abacatepay.com/v1/pixQrCode/check?id=pix_char_123456' \
  --header 'accept: application/json' \
  --header 'authorization: Bearer {SEU_TOKEN_AQUI}'
```

_Esta rota utiliza um parâmetro na query:_

- **id** (string, obrigatório): ID do QRCode PIX. Exemplo: "pix_char_123456".

**Modelo de resposta:**

```json
{
  "data": {
    "status": "PENDING",
    "expiresAt": "2025-03-25T21:50:20.772Z"
  },
  "error": null
}
```

- **Documentação:** [Checar Status](https://docs.abacatepay.com/pages/pix)

---

#### ➤ Simular Pagamento do QRCode PIX (Somente em Dev Mode)

- **Endpoint:** `POST /v1/pixQrCode/simulate-payment`
- **curl esperado como exemplo:**

```bash
curl --request POST \
  --url 'https://api.abacatepay.com/v1/pixQrCode/simulate-payment?id=pix_char_123456' \
  --header 'accept: application/json' \
  --header 'authorization: Bearer {SEU_TOKEN_AQUI}' \
  --header 'content-type: application/json' \
  --data '{
    "metadata": {}
  }'
```

**Explicação de cada parâmetro:**

- **Query Parameter - id** (string, obrigatório): ID do QRCode PIX que terá o pagamento simulado.
- **No Body:**
  - **metadata** (object, opcional): Objeto para incluir dados adicionais sobre a simulação, se necessário.

**Modelo de resposta:**

```json
{
  "data": {
    "id": "pix_char_123456",
    "amount": 100,
    "status": "PAID",
    "devMode": true,
    "brCode": "00020101021226950014br.gov.bcb.pix",
    "brCodeBase64": "data:image/png;base64,iVBORw0KGgoAAA",
    "platformFee": 80,
    "createdAt": "2025-03-24T21:50:20.772Z",
    "updatedAt": "2025-03-24T21:50:20.772Z",
    "expiresAt": "2025-03-25T21:50:20.772Z"
  },
  "error": null
}
```

- **Documentação:** [Simular Pagamento](https://docs.abacatepay.com/pages/pix)

---

### Saques (Novo)

#### ➤ Criar Saque

- **Endpoint:** `POST /v1/withdraw/create`
- **curl esperado como exemplo:**

```bash
curl --request POST \
  --url https://api.abacatepay.com/v1/withdraw/create \
  --header 'accept: application/json' \
  --header 'authorization: Bearer {SEU_TOKEN_AQUI}' \
  --header 'content-type: application/json' \
  --data '{
    "amount": 5000,
    "pixKey": "fulano@banco.com",
    "notes": "Saque de teste"
  }'
```

**Explicação de cada parâmetro:**

- **amount** (number, obrigatório): valor do saque em centavos.
- **pixKey** (string, obrigatório): chave PIX do destinatário.
- **notes** (string, opcional): observação ou descrição do saque.

**Modelo de resposta:**

```json
{
  "data": {
    "id": "wd_123456",
    "amount": 5000,
    "status": "PENDING",
    "pixKey": "fulano@banco.com",
    "createdAt": "2025-03-24T21:50:20.772Z",
    "updatedAt": "2025-03-24T21:50:20.772Z"
  },
  "error": null
}
```

---

#### ➤ Buscar Saque

- **Endpoint:** `GET /v1/withdraw/get?id=wd_123456`
- **curl esperado como exemplo:**

```bash
curl --request GET \
  --url 'https://api.abacatepay.com/v1/withdraw/get?id=wd_123456' \
  --header 'accept: application/json' \
  --header 'authorization: Bearer {SEU_TOKEN_AQUI}'
```

**Modelo de resposta:** igual ao da criação.

---

#### ➤ Listar Saques

- **Endpoint:** `GET /v1/withdraw/list`
- **curl esperado como exemplo:**

```bash
curl --request GET \
  --url https://api.abacatepay.com/v1/withdraw/list \
  --header 'accept: application/json' \
  --header 'authorization: Bearer {SEU_TOKEN_AQUI}'
```

**Modelo de resposta:**

```json
{
  "data": [
    {
      "id": "wd_123456",
      "amount": 5000,
      "status": "PENDING",
      "pixKey": "fulano@banco.com",
      "createdAt": "2025-03-24T21:50:20.772Z",
      "updatedAt": "2025-03-24T21:50:20.772Z"
    }
  ],
  "error": null
}
```

---

### Loja (Novo)

#### ➤ Obter Detalhes da Loja

- **Endpoint:** `GET /v1/store/get`
- **curl esperado como exemplo:**

```bash
curl --request GET \
  --url https://api.abacatepay.com/v1/store/get \
  --header 'accept: application/json' \
  --header 'authorization: Bearer {SEU_TOKEN_AQUI}'
```

**Modelo de resposta:**

```json
{
  "data": {
    "id": "store_123456",
    "name": "Minha Loja",
    "createdAt": "2025-03-24T21:50:20.772Z"
  },
  "error": null
}
```

---

## Webhooks

- Notificações automáticas enviadas pela AbacatePay.
- Eventos disponíveis: `billing.paid`, `pix.paid`, `pix.expired`, `withdraw.paid`.
- Sempre validar a assinatura enviada.
- Implementar retries para lidar com falhas de rede.

---

## SDKs

- SDKs oficiais disponíveis para integração em linguagens populares.

---

## Transição para Produção

- **Descrição:** Para migrar do ambiente de desenvolvimento para produção, é necessário desativar o Dev Mode e completar o cadastro com informações adicionais.
- **Documentação:** [Produção](https://docs.abacatepay.com/pages/production)

---

_Este guia foi elaborado para auxiliar modelos de linguagem e desenvolvedores a integrar-se de forma eficaz com a API da AbacatePay utilizando os endpoints atualizados._

# Configuração AWS S3 para Upload de Imagens

Este projeto utiliza AWS S3 para armazenamento de imagens (avatars de usuários e outros uploads futuros).

## Pré-requisitos

1. Conta AWS ativa
2. Bucket S3 criado
3. Credenciais de acesso (Access Key ID e Secret Access Key)

## Instalação

Instale o pacote AWS SDK:

```bash
pnpm add @aws-sdk/client-s3
```

## Configuração

### 1. Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env`:

```env
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=sua_access_key_aqui
AWS_SECRET_ACCESS_KEY=sua_secret_key_aqui
AWS_S3_BUCKET_NAME=nome-do-seu-bucket
```

### 2. Configurar Bucket S3

No console da AWS:

1. Acesse **S3** → **Buckets** → Selecione seu bucket
2. Vá em **Permissions** → **Block public access**
3. Desmarque "Block all public access" (apenas se quiser URLs públicas)
4. Configure **Bucket Policy** para permitir leitura pública:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::nome-do-seu-bucket/*"
    }
  ]
}
```

5. Em **CORS configuration**, adicione:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

### 3. Criar IAM User com Permissões

1. Acesse **IAM** → **Users** → **Create user**
2. Anexe a política **AmazonS3FullAccess** ou crie uma customizada:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::nome-do-seu-bucket/*"
    }
  ]
}
```

3. Gere as credenciais (Access Key) e adicione ao `.env`

## Funcionalidades Implementadas

### Upload de Avatar

- Localização: `/configuracoes/perfil`
- Formatos aceitos: JPEG, PNG, WebP
- Tamanho máximo: 5MB
- Preview em tempo real
- Substitui automaticamente avatar anterior

### Arquivos Criados

1. **`src/lib/s3.ts`**: Serviço de integração com S3
   - `uploadToS3()`: Upload de arquivos
   - `deleteFromS3()`: Exclusão de arquivos
   - `validateImageFile()`: Validação de imagens

2. **`src/features/settings/actions/upload-avatar.ts`**: Server Actions
   - `uploadAvatar()`: Upload e atualização no banco
   - `deleteAvatar()`: Remoção de avatar

3. **`src/features/settings/components/avatar-upload.tsx`**: Componente UI
   - Preview de imagem
   - Validação client-side
   - Feedback visual de upload

## Uso em Outras Features

Para usar o serviço S3 em outras partes do projeto:

```typescript
import { uploadToS3, deleteFromS3 } from "@/lib/s3";

// Upload
const imageUrl = await uploadToS3({
  file: buffer,
  fileName: "exemplo.jpg",
  contentType: "image/jpeg",
  folder: "minha-pasta", // opcional, padrão: "uploads"
});

// Delete
await deleteFromS3(imageUrl);
```

## Segurança

- ✅ Validação de tipo de arquivo (client e server)
- ✅ Validação de tamanho (5MB máximo)
- ✅ Nomes de arquivo únicos (timestamp + random string)
- ✅ Organização em pastas (avatars, uploads, etc.)
- ✅ Exclusão automática de arquivos antigos
- ✅ Autenticação obrigatória para uploads

## Custos AWS

O S3 cobra por:

- Armazenamento (GB/mês)
- Requisições (PUT, GET, DELETE)
- Transferência de dados

Para uso pessoal/pequeno, os custos são mínimos (centavos por mês).

## Troubleshooting

### Erro: "AWS S3 environment variables are not configured"

- Verifique se todas as variáveis estão no `.env`
- Reinicie o servidor de desenvolvimento

### Erro de permissão ao fazer upload

- Verifique as permissões do IAM user
- Confirme que o bucket policy permite PutObject

### Imagens não carregam

- Verifique se o bucket está configurado para acesso público
- Confirme a CORS configuration
- Verifique se a região está correta no `.env`

### Documentação Oficial

- [Next.js 16](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team/docs/overview)
- [Better Auth](https://better-auth.com/docs)
- [React Query](https://tanstack.com/query/latest)
- [shadcn/ui](https://ui.shadcn.com/)

### Patterns Recomendados

- [Feature-Sliced Design](https://feature-sliced.design/)
- [Server Actions Best Practices](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Data Access Layer Pattern](https://nextjs.org/blog/security-nextjs-server-components-actions)

---

## 🎯 Próximos Passos

1. **Setup Inicial**: Criar projeto e instalar dependências
2. **Database**: Configurar PostgreSQL e criar schemas com Drizzle
3. **Auth**: Implementar Better Auth e DAL
4. **Features Core**: Desenvolver features na ordem:
   - users (base para tudo)
   - auth
   - subscriptions
   - credits
   - services
   - acoes
   - envios
   - commissions
   - consultas
   - payments
   - editor
5. **Integrations**: Conectar AbacatePay e Asaas
6. **UI/UX**: Implementar componentes shadcn e dashboard
7. **Testing**: Adicionar testes críticos
8. **Deploy**: Configurar Vercel + Supabase/Neon

---

**Versão**: 1.0.0  
**Última Atualização**: Janeiro 2026  
**Next.js**: 16.x  
**Autor**: [Seu Nome]
