---
applyTo: "**/*.ts,**/*.tsx"
---

# Authentication

Skill para implementação de autenticação usando o padrão DAL.

## DAL Pattern

O Data Access Layer centraliza verificações de autenticação e autorização.

```typescript
// core/auth/dal.ts
import "server-only";
import { cache } from "react";
import { auth } from "./config";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export const verifySession = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return { isAuth: true, userId: session.user.id };
});
```

## Funções Disponíveis

| Função                        | Uso                         |
| ----------------------------- | --------------------------- |
| `verifySession()`             | Verifica se há sessão ativa |
| `requireAdmin()`              | Requer role admin           |
| `requireActiveSubscription()` | Requer assinatura ativa     |

## Uso em Server Actions

```typescript
"use server";

import { verifySession } from "@/core/auth/dal";

export async function myAction(data: unknown) {
  const { userId } = await verifySession();
  // ... resto da lógica
}
```

## Uso em Pages

```typescript
// app/(dashboard)/admin/page.tsx
import { requireAdmin } from "@/core/auth/dal";

export default async function AdminPage() {
  await requireAdmin();
  return <AdminDashboard />;
}
```

> [!IMPORTANT]
> Nunca coloque lógica de auth no `proxy.ts` (Next.js 16).

> [!TIP]
> Use `cache()` do React para evitar múltiplas verificações na mesma request.

## Referências

- Exemplos: [examples/](./examples/)
