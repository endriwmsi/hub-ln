---
name: drizzle-schema
description: Criação de schemas Drizzle ORM com UUIDv7, timestamps e convenções do projeto.
---

# Drizzle Schema

Skill para criação de schemas de banco de dados com Drizzle ORM.

## Padrão Base

```typescript
import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";

export const entities = pgTable("entities", {
  // ID com UUIDv7
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),

  // Campos da entidade
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),

  // Status
  status: varchar("status", { length: 50 }).default("pending"),
  isActive: boolean("is_active").default(true).notNull(),

  // Relacionamentos
  createdById: text("created_by_id")
    .references(() => users.id)
    .notNull(),

  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
```

## Convenções

| Campo         | Tipo            | Descrição          |
| ------------- | --------------- | ------------------ |
| `id`          | `text` + UUIDv7 | Chave primária     |
| `createdAt`   | `timestamp`     | Data de criação    |
| `updatedAt`   | `timestamp`     | Última atualização |
| `createdById` | `text`          | FK para users      |
| `status`      | `varchar(50)`   | Status da entidade |
| `isActive`    | `boolean`       | Soft delete        |

> [!IMPORTANT]
> Sempre use UUIDv7 para IDs (ordenação cronológica).

> [!TIP]
> Use `varchar` com tamanho definido para strings curtas, `text` para strings longas.

## Referências

- Exemplos: [examples/](./examples/)
