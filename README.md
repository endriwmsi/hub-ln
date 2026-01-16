# Hub LN - Plataforma SaaS Multi-Tenant

Plataforma SaaS multi-tenant para agência de serviços financeiros (limpa nome, recuperação de rating bancário, etc.) com sistema de comissionamento em pirâmide, gestão de créditos compartilhados, assinaturas e múltiplos gateways de pagamento.

## 🚀 Setup do Projeto

### 1. Instalar Dependências

```bash
pnpm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure as variáveis:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

- **DATABASE_URL**: String de conexão do PostgreSQL
- **BETTER_AUTH_SECRET**: Chave secreta para autenticação (pode gerar com `openssl rand -base64 32`)
- **BETTER_AUTH_URL**: URL base da aplicação
- **ABACATEPAY_API_KEY**: API key do AbacatePay
- **ASAAS_API_KEY**: API key do Asaas
- **CONSULTA_API_KEY**: API key para consulta de CPF/CNPJ

### 3. Configurar Banco de Dados

Execute as migrações do Drizzle:

```bash
# Gerar arquivos de migração
pnpm db:generate

# Aplicar migrações
pnpm db:migrate

# Ou fazer push direto (desenvolvimento)
pnpm db:push
```

### 4. Executar o Projeto

```bash
# Desenvolvimento
pnpm dev

# Build de produção
pnpm build
pnpm start
```

## 📁 Estrutura do Projeto

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Páginas de autenticação
│   ├── (dashboard)/       # Páginas protegidas
│   └── api/               # API Routes
├── features/              # Feature-based architecture
│   ├── auth/
│   ├── acoes/
│   ├── envios/
│   ├── consultas/
│   ├── credits/
│   ├── commissions/
│   ├── subscriptions/
│   ├── payments/
│   ├── services/
│   ├── users/
│   └── editor/
├── shared/                # Código compartilhado
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   └── types/
├── core/                  # Infraestrutura central
│   ├── db/               # Drizzle ORM
│   ├── auth/             # Better Auth + DAL
│   ├── providers/        # React Query, etc
│   └── config/
└── components/ui/         # shadcn/ui components
```

## 🛠 Stack Tecnológica

- **Framework**: Next.js 16 (App Router + Turbopack)
- **UI**: React 19.2 + TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Better Auth
- **State**: React Query (TanStack Query v5)
- **Forms**: React Hook Form + Zod
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Payments**: AbacatePay + Asaas

## 📚 Scripts Disponíveis

```bash
pnpm dev              # Iniciar servidor de desenvolvimento
pnpm build            # Build de produção
pnpm start            # Iniciar servidor de produção
pnpm lint             # Verificar código com Biome
pnpm format           # Formatar código com Biome
pnpm db:generate      # Gerar migrações Drizzle
pnpm db:migrate       # Aplicar migrações
pnpm db:push          # Push schema direto (dev)
pnpm db:studio        # Abrir Drizzle Studio
```

## 🔐 Autenticação (Next.js 16)

Este projeto usa **Better Auth** com a arquitetura **Data Access Layer (DAL)** recomendada pelo Next.js 16.

⚠️ **IMPORTANTE**: Não use `middleware.ts`. No Next.js 16, use `proxy.ts` apenas para routing/redirects. A autenticação deve estar no DAL.

### Verificar Sessão em Server Components

```tsx
import { verifySession } from "@/core/auth";

export default async function ProtectedPage() {
  const { userId, user } = await verifySession();

  return <div>Olá, {user.name}!</div>;
}
```

### Requer Assinatura Ativa

```tsx
import { requireActiveSubscription } from "@/core/auth";

export default async function EditorPage() {
  await requireActiveSubscription();

  return <EditorCanvas />;
}
```

### Server Actions

```tsx
"use server";

import { verifySession } from "@/core/auth";

export async function createAcao(data: CreateAcaoInput) {
  const { userId } = await verifySession();
  // ...
}
```

## 📖 Documentação Completa

Veja [`.github/copilot-instructions.md`](.github/copilot-instructions.md) para documentação técnica completa incluindo:

- Arquitetura feature-based detalhada
- Modelagem do banco de dados
- Regras de negócio
- Fluxos de pagamento
- Sistema de comissionamento
- E muito mais...

## 🎨 Adicionar Componentes shadcn/ui

```bash
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add card
pnpm dlx shadcn@latest add form
# etc...
```

## 🗃 Banco de Dados

### Drizzle Studio

Para visualizar e gerenciar o banco de dados:

```bash
pnpm db:studio
```

Acesse `https://local.drizzle.studio` no navegador.

## 📝 Notas Importantes

1. **Multi-Tenant**: Todos os dados são isolados por `userId`, exceto User 01 (admin) que tem acesso total
2. **Créditos Compartilhados**: Baseado no saldo do User 01
3. **Assinaturas**: Requerida para acessar o Editor de Criativos
4. **Next.js 16**: Use `proxy.ts` para routing, DAL para auth
5. **React 19**: Suporta React Compiler (habilitado no projeto)

---

Desenvolvido com ❤️ usando Next.js 16 e React 19
