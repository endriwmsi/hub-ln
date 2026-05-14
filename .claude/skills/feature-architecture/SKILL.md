---
name: feature-architecture
description: Estrutura feature-based com convenções de organização, importação e public API.
---

# Feature Architecture

Skill para organização de código seguindo a arquitetura feature-based do projeto.

## Estrutura de uma Feature

```
features/{feature-name}/
├── components/          # Componentes React específicos
│   ├── entity-form.tsx
│   ├── entity-table.tsx
│   └── index.ts         # Public exports
│
├── hooks/               # React hooks (React Query)
│   ├── use-entities.ts
│   ├── use-create-entity.ts
│   └── index.ts
│
├── actions/             # Server Actions
│   ├── create-entity.ts
│   ├── update-entity.ts
│   └── index.ts
│
├── schemas/             # Validação Zod
│   ├── entity.schema.ts
│   └── index.ts
│
├── types/               # TypeScript types
│   └── index.ts
│
├── db/                  # Schema Drizzle
│   ├── schema.ts
│   └── index.ts
│
├── lib/                 # Lógica de negócio
│   └── index.ts
│
└── index.ts             # 🔑 Public API
```

## Regras de Importação

```typescript
// ✅ CORRETO - Importar da Public API
import { EntityForm, useEntities } from "@/features/entities";

// ❌ ERRADO - Não importar de subpastas
import { EntityForm } from "@/features/entities/components/entity-form";
```

> [!IMPORTANT]
> Sempre exporte através do `index.ts` da feature.

> [!TIP]
> Use barrels (index.ts) em cada subpasta para organizar exports.

## Referências

- Exemplos: [examples/](./examples/)
