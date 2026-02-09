---
name: server-actions
description: Padrões para criação de Server Actions com autenticação, validação Zod e revalidação de cache.
---

# Server Actions

Skill para implementação de Server Actions seguindo os padrões do projeto.

## Quando usar

- Criar, atualizar ou deletar recursos no banco
- Operações que requerem autenticação
- Ações que precisam revalidar cache

## Estrutura Padrão

```typescript
"use server";

import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import { entities } from "../db/schema";
import { createEntitySchema } from "../schemas";
import { revalidatePath } from "next/cache";

export async function createEntity(input: unknown) {
  // 1. Verificar autenticação
  const { userId } = await verifySession();

  // 2. Validar input com Zod
  const validatedData = createEntitySchema.parse(input);

  // 3. Lógica de negócio
  const [entity] = await db
    .insert(entities)
    .values({
      ...validatedData,
      createdById: userId,
    })
    .returning();

  // 4. Revalidar cache
  revalidatePath("/entities");

  // 5. Retornar resultado
  return { success: true, data: entity };
}
```

## Checklist

> [!IMPORTANT]
> Sempre inclua `"use server"` no topo do arquivo.

> [!TIP]
> Use `verifySession()` para obter o `userId` autenticado.

> [!WARNING]
> Nunca confie em inputs do cliente - sempre valide com Zod.

## Organização de Arquivos

```
features/{feature}/
└── actions/
    ├── create-entity.ts
    ├── update-entity.ts
    ├── delete-entity.ts
    └── index.ts  // Re-exports
```

## Referências

- Exemplos: [examples/](./examples/)
