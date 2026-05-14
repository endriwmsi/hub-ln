# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start

### Common Commands

```bash
# Development
pnpm dev                # Start dev server (http://localhost:3000)
pnpm build              # Production build
pnpm start              # Run production build

# Code quality
pnpm lint               # Check with Biome
pnpm format             # Format with Biome

# Database
pnpm db:push            # Push schema changes (dev only)
pnpm db:generate        # Generate migrations
pnpm db:migrate         # Apply migrations
pnpm db:studio          # Visual database editor at https://local.drizzle.studio

# UI Components
pnpm dlx shadcn@latest add [component]  # Add shadcn/ui components
```

## Architecture Overview

### Feature-Based Structure

This project uses a feature-based architecture. Each major domain (auth, payments, acoes, etc.) is a self-contained feature in `src/features/[feature-name]/`.

**Standard feature anatomy:**
```
features/[feature-name]/
├── components/        # React components specific to this feature
├── hooks/            # React Query hooks (queries & mutations)
├── actions/          # Server Actions
├── schemas/          # Zod validation schemas
├── types/            # TypeScript types
├── db/               # Drizzle schema & queries
├── lib/              # Isolated business logic
└── index.ts          # Public API exports
```

### Directory Structure

- **`src/app/`** – Next.js App Router
  - `(app)/(auth)/` – Login, register, password reset pages
  - `(app)/(dashboard)/` – Protected pages (require authentication)
  - `api/` – API routes and webhooks
  
- **`src/features/`** – Feature implementations (auth, acoes, envios, payments, users, services, subscriptions, etc.)

- **`src/shared/`** – Reusable code
  - `components/` – UI components (layout, shared UI)
  - `hooks/` – Shared React hooks
  - `lib/` – Utilities
  - `types/` – Global types

- **`src/core/`** – Infrastructure
  - `db/` – Drizzle ORM setup and database connection
  - `auth/` – Better Auth configuration and Data Access Layer
  - `providers/` – React Context providers (Query, Theme, etc.)
  - `config/` – Global configuration

## Key Technologies & Patterns

### Next.js 16 + React 19

- **App Router** with route groups: `(auth)`, `(dashboard)`
- **React 19**: Server components by default; use `"use client"` for interactive components
- **Turbopack**: Faster builds and HMR
- React Compiler is enabled (babel-plugin-react-compiler)

**Auth Pattern**: Use Next.js 16's **Data Access Layer (DAL)** approach instead of middleware:
```tsx
// ✅ In server components or Server Actions
import { verifySession } from "@/core/auth";

export default async function Page() {
  const { userId, user } = await verifySession();
  // ...
}
```

⚠️ **Do not use `middleware.ts`** for authentication. Use `proxy.ts` only for routing/redirects.

### Database: PostgreSQL + Drizzle ORM

- **Type-safe ORM** with Drizzle
- **UUID v7** for all IDs
- Schema defined in `src/core/db/schema/`
- Queries co-located in feature `db/queries.ts` files
- Always run `pnpm db:push` after schema changes in development

### State Management: React Query (TanStack Query v5)

- Used for server state and async operations
- Hooks defined in feature `hooks/` directories
- Auto-refetch on window focus and at 30s intervals for transaction pages
- Optimistic updates where applicable

### Authentication: Better Auth

- Modern, type-safe auth library with Next.js native support
- Session verified via DAL in server components
- Client-side auth client at `src/core/auth/auth-client.ts`

### Forms & Validation

- **React Hook Form** for performance
- **Zod** for schema validation
- Schemas defined in feature `schemas/` directories

### UI: shadcn/ui + Tailwind CSS v4

- All components use shadcn/ui for consistency
- Tailwind CSS v4 with PostCSS
- Responsive mobile-first design with Radix UI primitives

## Important Patterns & Conventions

### Server Actions

All data mutations go through Server Actions in `features/[feature]/actions/`:
```tsx
"use server";
import { verifySession } from "@/core/auth";

export async function updateAcao(id: string, data: UpdateAcaoInput) {
  const { userId } = await verifySession();
  // Perform DB operations
  // Return result or throw error
}
```

### React Query Hooks

Client-side hooks for querying:
```tsx
// features/acoes/hooks/use-acoes.ts
export function useAcoes(filters?: AcoesFilters) {
  return useQuery({
    queryKey: ["acoes", filters],
    queryFn: () => getAcoes(filters),
  });
}
```

### Multi-Tenant Isolation

- **User 01 (admin)**: Has access to all data
- **Regular users**: Data isolated by `userId`
- Always filter queries by `userId` in Server Actions

### Créditos Compartilhados (Shared Credits)

- Global credit limit based on User 01's balance
- Consumed by CPF/CNPJ queries and other services
- Check balance before operations that consume credits

### Subscription Requirement

- Editor page requires active subscription
- Use `requireActiveSubscription()` in page components:
```tsx
import { requireActiveSubscription } from "@/core/auth";

export default async function EditorPage() {
  await requireActiveSubscription();
  // ...
}
```

## Payment Gateways

- **AbacatePay**: Recurring subscriptions
- **Asaas**: One-time service payments
- Webhooks at `src/app/api/webhooks/`

## Database Maintenance

Use Drizzle Studio to inspect/debug database:
```bash
pnpm db:studio
```

Opens at `https://local.drizzle.studio`

## Environment Variables Required

- `DATABASE_URL` – PostgreSQL connection string
- `BETTER_AUTH_SECRET` – Auth encryption key
- `BETTER_AUTH_URL` – Application base URL
- `ABACATEPAY_API_KEY` – AbacatePay API key
- `ASAAS_API_KEY` – Asaas API key
- `CONSULTA_API_KEY` – CPF/CNPJ lookup API key

See `.env.example` for full list.

## Code Quality

- **Linter & Formatter**: Biome (configured in `biome.json`)
- Run `pnpm lint` before committing
- Run `pnpm format` to auto-fix formatting
- TypeScript strict mode enabled

## File Organization Tips

When adding features:
1. Create `src/features/[feature-name]` with standard anatomy
2. Export public API via `index.ts`
3. Keep components, hooks, and logic isolated to the feature
4. Import shared code from `src/shared/`
5. Import infrastructure from `src/core/`
