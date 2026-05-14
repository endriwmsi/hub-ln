---
name: data-tables
description: Implementação de data-tables com react-table, react-query e filtros persistentes na URL.
---

# Data Tables

Skill para criação de tabelas de dados com filtros, paginação e integração com React Query.

## Arquitetura

```
features/{feature}/components/

├── data-table.tsx                 # Tabela genérica
├── data-table-skeleton.tsx        # Loading skeleton
└── columns.tsx                    # Definição de colunas
```

## Hook de Filtros com URL Persistence

```typescript
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export function useFilters<T extends Record<string, unknown>>() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(
    () => ({
      search: searchParams.get("search") || undefined,
      status: searchParams.get("status") || undefined,
      page: Number(searchParams.get("page")) || 1,
      pageSize: Number(searchParams.get("pageSize")) || 10,
    }),
    [searchParams],
  );

  const updateFilters = useCallback(
    (newFilters: Partial<T>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(newFilters).forEach(([key, value]) => {
        if (value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      // Reset page on filter change
      if (newFilters.page === undefined) {
        params.set("page", "1");
      }

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return { filters, updateFilters };
}
```

## Container com React Query

```typescript
const { data, isLoading } = useQuery({
  queryKey: ["entities", filters],
  queryFn: () => getEntities(filters),
});
```

## Fluxo

1. Usuário altera filtro → `updateFilters()` atualiza URL
2. URL muda → `useFilters()` retorna novos filters
3. `filters` muda → React Query refaz fetch
4. Dados atualizam → Tabela re-renderiza

> [!TIP]
> Use debounce no campo de busca para evitar requisições excessivas.

## Referências

- Exemplos: [examples/](./examples/)
