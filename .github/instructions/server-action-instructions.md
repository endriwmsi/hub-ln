## ⚡ Server Actions Pattern

### Estrutura de uma Server Action

```typescript
// features/acoes/actions/create-acao.ts
"use server";

import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import { acoes } from "../db/schema";
import { createAcaoSchema } from "../schemas";
import { revalidatePath } from "next/cache";

export async function createAcao(input: unknown) {
  // 1. Verificar autenticação
  const { userId } = await verifySession();

  // 2. Validar input
  const validatedData = createAcaoSchema.parse(input);

  // 3. Lógica de negócio
  const [acao] = await db
    .insert(acoes)
    .values({
      ...validatedData,
      createdById: userId,
    })
    .returning();

  // 4. Revalidar cache
  revalidatePath("/acoes");

  // 5. Retornar resultado
  return { success: true, data: acao };
}
```

### Public API da Feature

````typescript
// features/acoes/index.ts
export { AcaoForm } from './components/acao-form';
export { AcoesTable } from './components/acoes-table';
export { AcaoCard } from './components/acao-card';

export { useAcoes } from './hooks/use-acoes';
export { useCreateAcao } from './hooks/use-create-acao';

export { createAcao, updateAcao, deleteAcao } from './actions';

export type { Acao } from './types';
```-
````
