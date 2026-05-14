---
name: react-query
description: Implementa gerenciamento de estado assíncrono com React Query (TanStack Query). Use para buscar, cachear, sincronizar e atualizar dados do servidor.
---

# React Query (TanStack Query)

Esta skill orienta a implementação de gerenciamento de dados assíncronos usando `@tanstack/react-query` v5, seguindo os padrões estabelecidos neste projeto.

## Quando usar esta skill

- **Buscar dados do servidor** - Listagens, detalhes, dados paginados
- **Criar, atualizar ou deletar recursos** - Operações CRUD com feedback visual
- **Sincronizar cache automaticamente** - Invalidar queries após mutations
- **Gerenciar loading/error states** - Estados de carregamento e erro de forma declarativa

## Como usar

### 1. Estrutura de Arquivos

Os hooks de React Query devem seguir a estrutura feature-based:

```
src/features/{feature-name}/
├── actions.ts          # Server actions (Next.js)
├── schemas.ts          # Tipos e validações Zod
└── hooks/
    ├── use-{entities}.ts        # Query para listar (ex: use-services.ts)
    ├── use-create-{entity}.ts   # Mutation para criar
    ├── use-update-{entity}.ts   # Mutation para atualizar
    └── use-delete-{entity}.ts   # Mutation para deletar
```

### 2. Convenções de Nomenclatura

| Tipo                 | Padrão              | Exemplo                   |
| -------------------- | ------------------- | ------------------------- |
| Query (listar)       | `use{Entities}`     | `useServices`, `useUsers` |
| Query (detalhe)      | `use{Entity}`       | `useService`, `useUser`   |
| Mutation (criar)     | `useCreate{Entity}` | `useCreateService`        |
| Mutation (atualizar) | `useUpdate{Entity}` | `useUpdateService`        |
| Mutation (deletar)   | `useDelete{Entity}` | `useDeleteService`        |

### 3. Query Keys

Use arrays estruturados para query keys:

```typescript
// ✅ Bom - permite invalidação granular
queryKey: ["services"]; // Lista todos
queryKey: ["services", { onlyActive: true }]; // Lista com filtro
queryKey: ["services", id]; // Detalhe por ID

// ❌ Evitar - dificulta invalidação
queryKey: ["all-services"];
queryKey: [`service-${id}`];
```

### 4. Padrão de useQuery (Buscar Dados)

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { getEntities } from "../actions";

export function useEntities(filter?: boolean) {
  return useQuery({
    queryKey: ["entities", { filter }],
    queryFn: () => getEntities(filter),
  });
}
```

### 5. Padrão de useMutation (Modificar Dados)

```typescript
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createEntity } from "../actions";
import type { CreateEntityInput } from "../schemas";

export function useCreateEntity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEntityInput) => createEntity(data),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Criado com sucesso!");
        queryClient.invalidateQueries({ queryKey: ["entities"] });
      } else {
        toast.error("Erro ao criar");
      }
    },
    onError: () => {
      toast.error("Erro ao criar");
    },
  });
}
```

### 6. Uso em Componentes

```tsx
"use client";

import { useEntities } from "../hooks/use-entities";
import { useCreateEntity } from "../hooks/use-create-entity";

export function EntitiesTable() {
  const { data, isLoading, error } = useEntities();
  const createMutation = useCreateEntity();

  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;

  const handleCreate = (data: CreateEntityInput) => {
    createMutation.mutate(data);
  };

  return <Table data={data} />;
}
```

## Regras importantes

> [!IMPORTANT]
> Todos os hooks de React Query devem incluir `"use client"` no topo do arquivo.

> [!TIP]
> Sempre invalide queries relacionadas após uma mutation para manter o cache sincronizado.

> [!WARNING]
> Não use `queryClient.setQueryData` para modificar o cache diretamente, prefira `invalidateQueries` para garantir dados frescos.

## Referências

- [TanStack Query Docs](https://tanstack.com/query/latest)
- Exemplos práticos: [examples/](./examples/)
