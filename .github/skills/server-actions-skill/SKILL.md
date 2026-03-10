---
name: server-actions-skill
description: Guide for implementing Next.js Server Actions on this project.
---

# Next.js Server Actions

Esta skill orienta a implementação de Server Actions seguindo os padrões estabelecidos neste projeto (Next.js App Router + Drizzle ORM + Better Auth + Zod).

## Quando usar esta skill

- **Criar, atualizar ou deletar recursos** — qualquer mutação de dados no servidor
- **Buscar dados protegidos** — queries que exigem verificação de sessão
- **Operações admin-only** — ações restritas a usuários com `role === 'admin'`
- **Side-effects no servidor** — envio de notificações, revalidação de cache, integrações externas

---

## Estrutura de Arquivos

```
src/features/{feature}/
├── actions/
│   ├── create-{entity}.ts     # Criar recurso
│   ├── update-{entity}.ts     # Atualizar recurso
│   ├── delete-{entity}.ts     # Deletar recurso
│   ├── get-{entities}.ts      # Buscar lista (se não usar query direta)
│   └── index.ts               # Re-exporta tudo
├── schemas/
│   └── {entity}.schema.ts     # Schemas Zod compartilhados com actions e forms
└── hooks/
    ├── use-create-{entity}.ts # useMutation que chama a action
    └── use-{entities}.ts      # useQuery (ver react-query-skill)
```

---

## 1. Tipo de Retorno Padrão

Sempre use `ActionResponse<T>` de `@/shared/lib/server-actions`:

```typescript
// @/shared/lib/server-actions
export type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};
```

Nunca lance exceções para o cliente — capture e retorne `{ success: false, error: "..." }`.

---

## 2. Anatomia de uma Server Action

### Mutation (criar/atualizar/deletar)

```typescript
"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifySession } from "@/core/auth/dal"; // auth guard
import { db } from "@/core/db";
import { myTable } from "@/core/db/schema";
import type { ActionResponse } from "@/shared/lib/server-actions";

// 1. Schema Zod inline ou importado de schemas/
const createMyEntitySchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  value: z.number().positive("Valor deve ser positivo"),
});

export type CreateMyEntityInput = z.infer<typeof createMyEntitySchema>;

// 2. Função exportada com retorno tipado
export async function createMyEntity(
  input: CreateMyEntityInput,
): Promise<ActionResponse<{ id: string }>> {
  try {
    // 3. Verificar sessão (obrigatório para usuários autenticados)
    const session = await verifySession();

    // 4. Validar input via safeParse
    const validation = createMyEntitySchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0].message,
      };
    }

    // 5. Executar operação no banco
    const [created] = await db
      .insert(myTable)
      .values({
        ...validation.data,
        userId: session.userId,
      })
      .returning({ id: myTable.id });

    // 6. Revalidar cache das páginas afetadas
    revalidatePath("/minha-pagina");

    return {
      success: true,
      data: { id: created.id },
    };
  } catch (error) {
    console.error("Erro ao criar entidade:", error);
    return {
      success: false,
      error: "Erro interno ao criar entidade",
    };
  }
}
```

### Action Admin-only

```typescript
"use server";

import { requireAdmin } from "@/core/auth/dal"; // redireciona se não for admin

export async function adminOnlyAction(id: string): Promise<ActionResponse> {
  try {
    await requireAdmin(); // bloqueia não-admins

    // lógica...

    revalidatePath("/admin/pagina");
    return { success: true };
  } catch (error) {
    console.error("Erro:", error);
    return { success: false, error: "Erro interno" };
  }
}
```

### Query (buscar dados protegidos)

```typescript
"use server";

import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import { myTable } from "@/core/db/schema";
import { eq } from "drizzle-orm";
import type { ActionResponse } from "@/shared/lib/server-actions";

export async function getMyEntities(): Promise<ActionResponse<MyEntity[]>> {
  try {
    const session = await verifySession();

    const rows = await db
      .select()
      .from(myTable)
      .where(eq(myTable.userId, session.userId));

    return { success: true, data: rows };
  } catch (error) {
    console.error("Erro ao buscar entidades:", error);
    return { success: false, error: "Erro ao buscar dados" };
  }
}
```

---

## 3. Guards de Autenticação (dal.ts)

| Função          | Comportamento                                          |
| --------------- | ------------------------------------------------------ |
| `verifySession` | Retorna `{ userId, user }` — redireciona se não logado |
| `getSession`    | Retorna sessão ou `null` — sem redirect                |
| `getUser`       | Retorna `user` ou `null` — sem redirect                |
| `requireAdmin`  | Redireciona para `/dashboard` se `role !== 'admin'`    |

```typescript
import { verifySession, requireAdmin } from "@/core/auth/dal";

// Usuário autenticado qualquer
const session = await verifySession(); // { userId, user }

// Somente admins
const adminUser = await requireAdmin(); // user com role === 'admin'
```

---

## 4. Revalidação de Cache

Use `revalidatePath` após toda mutação para sincronizar o cache do Next.js:

```typescript
import { revalidatePath } from "next/cache";

// Revalida uma rota específica
revalidatePath("/minha-pagina");

// Revalida o layout inteiro (afeta toda a árvore)
revalidatePath("/", "layout");

// Revalida rota dinâmica
revalidatePath(`/entidades/${id}`);
```

> **Regra:** Sempre revalidar após `insert`, `update` ou `delete`.

---

## 5. Validação com Zod

Prefira `safeParse` para retornar erros sem lançar exceções:

```typescript
const validation = schema.safeParse(input);
if (!validation.success) {
  return {
    success: false,
    error: validation.error.issues[0].message, // primeira mensagem de erro
  };
}
const data = validation.data; // tipado e seguro
```

Use `.parse()` somente dentro de `try/catch` quando quiser lançar erro automaticamente.

---

## 6. Index de Exportação

Todo `actions/index.ts` deve re-exportar as actions públicas da feature:

```typescript
// features/my-feature/actions/index.ts
export { createMyEntity } from "./create-my-entity";
export { updateMyEntity } from "./update-my-entity";
export { deleteMyEntity } from "./delete-my-entity";
export { getMyEntities } from "./get-my-entities";
```

E o `features/my-feature/index.ts` expõe a API pública da feature:

```typescript
// features/my-feature/index.ts
export * from "./actions";
export * from "./schemas";
export type * from "./types";
```

---

## 7. Hook React Query que Consome a Action

Pair cada action de mutação com um `useMutation` hook (ver `react-query-skill` para queries):

```typescript
// features/my-feature/hooks/use-create-my-entity.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createMyEntity } from "../actions";
import type { CreateMyEntityInput } from "../schemas";

export function useCreateMyEntity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMyEntityInput) => createMyEntity(data),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Entidade criada com sucesso!");
        queryClient.invalidateQueries({ queryKey: ["my-entities"] });
      } else {
        toast.error(result.error ?? "Erro ao criar entidade");
      }
    },
    onError: () => {
      toast.error("Erro inesperado");
    },
  });
}
```

---

## 8. Boas Práticas & Regras

### ✅ Fazer

- Sempre adicionar `"use server"` no topo do arquivo
- Sempre verificar sessão — nunca confiar apenas no middleware
- Retornar `ActionResponse<T>` padronizado em todas as actions
- Usar `safeParse` para validação e retornar mensagem de erro amigável
- Chamar `revalidatePath` após mutações no banco
- Tipagem explícita no retorno: `Promise<ActionResponse<T>>`
- Logar erros com `console.error` antes de retornar `success: false`

### ❌ Evitar

- Expor detalhes de erros internos (stack traces, queries SQL) para o cliente
- Deixar actions sem verificação de autenticação
- Confiar apenas na validação do frontend — sempre revalidar no servidor
- Usar `throw` para comunicar erro ao cliente — use `return { success: false }`
- Esquecer de revalidar o cache após mutações
- Misturar lógica de apresentação dentro de actions

---

## Checklist de Implementação

- [ ] Arquivo com `"use server"` no topo
- [ ] Schema Zod definido e exportado
- [ ] `verifySession()` ou `requireAdmin()` chamado antes de qualquer operação
- [ ] Validação via `safeParse` com retorno de erro amigável
- [ ] Operação de banco com Drizzle ORM
- [ ] `revalidatePath` chamado após mutations
- [ ] Retorno `{ success: true, data }` ou `{ success: false, error }`
- [ ] Action exportada no `actions/index.ts` da feature
- [ ] Hook `useMutation` criado em `hooks/use-{verb}-{entity}.ts`
