# AGENTS.md - Hub LN Development Guide

This document provides guidelines and commands for agents working in this repository.

## Project Overview

A SaaS platform for financial services (debt clearance, credit recovery) with pyramid commission system, shared credits, subscriptions, and dual payment gateways (AbacatePay + Asaas).

**Stack**: Next.js 16, React 19, TypeScript, PostgreSQL, Drizzle ORM, Better Auth, TanStack Query v5, Tailwind CSS v4, shadcn/ui

---

## Commands

### Development
```bash
pnpm dev              # Start development server
pnpm build            # Production build
pnpm start            # Start production server
```

### Linting & Formatting (Biome)
```bash
pnpm lint             # Check for linting issues
pnpm lint --write     # Auto-fix linting issues
pnpm format           # Format all files
pnpm format --write   # Format and write changes
```

### Database
```bash
pnpm db:generate      # Generate Drizzle migrations
pnpm db:migrate       # Apply migrations
pnpm db:push          # Push schema directly (dev only)
pnpm db:studio        # Open Drizzle Studio
```

---

## Code Style

### Formatting (Biome)
- **Indent**: 2 spaces (not tabs)
- **Indent Style**: space
- Biome handles formatting automatically - run `pnpm format --write` before committing
- **IMPORTANT**: Never add manual comments unless explicitly required

### TypeScript
- **Strict mode enabled** - no implicit any, strict null checks
- Use explicit types for function parameters and return types
- Use TypeScript inference where possible
- Export types from `index.ts` files in each feature

### Imports
- Use path aliases: `@/*` maps to `src/*`
- UI components: `@/shared/components/ui/{component}`
- Utilities: `@/shared/lib/utils`
- Always import from feature public API, never subfolders:
  ```typescript
  // ✅ CORRECT
  import { EntityForm } from "@/features/entities";
  
  // ❌ WRONG
  import { EntityForm } from "@/features/entities/components/entity-form";
  ```

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Variables | camelCase | `userName`, `isActive` |
| Functions | camelCase | `getUser()`, `createAcao()` |
| Components | PascalCase | `EntityForm`, `DataTable` |
| Files (components) | kebab-case | `entity-form.tsx`, `data-table.tsx` |
| Database tables | snake_case | `acao`, `user`, `subscription` |
| React Query hooks | use{Entity} | `useServices`, `useCreateEntity` |
| Query keys | lowercase | `["services"]`, `["users", id]` |
| Server actions | verb{Entity} | `createAcao()`, `updateUser()` |

### File Structure (Feature-Based)
```
features/{feature-name}/
├── components/          # React components
│   └── index.ts         # Public exports
├── hooks/               # React Query hooks
│   └── index.ts
├── actions/             # Server Actions
│   └── index.ts
├── schemas/             # Zod validation
│   └── index.ts
├── types/               # TypeScript types
│   └── index.ts
├── db/                  # Drizzle schema (if needed)
│   └── schema.ts
└── index.ts             # Public API
```

---

## Server Actions

Every server action must follow this pattern:

```typescript
"use server";

import { verifySession } from "@/core/auth/dal";
import { db } from "@/core/db";
import { entity } from "@/core/db/schema";
import { createEntitySchema } from "../schemas";
import { revalidatePath } from "next/cache";

export async function createEntity(input: unknown) {
  try {
    // 1. Verify authentication
    const { userId } = await verifySession();

    // 2. Validate input with Zod
    const validated = createEntitySchema.parse(input);

    // 3. Business logic
    const [newEntity] = await db
      .insert(entity)
      .values({ ...validated, createdById: userId })
      .returning();

    // 4. Revalidate cache
    revalidatePath("/entities");

    // 5. Return result
    return { success: true, data: newEntity };
  } catch (error) {
    console.error("Error:", error);
    return { success: false, error: "Error message" };
  }
}
```

### Server Action Response Pattern
```typescript
type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};
```

---

## React Query (TanStack Query v5)

### Hook Pattern
```typescript
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createEntity } from "../actions/create-entity";
import type { CreateEntityInput } from "../schemas";

export function useCreateEntity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateEntityInput) => createEntity(input),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Created successfully!");
        queryClient.invalidateQueries({ queryKey: ["entities"] });
      } else {
        toast.error(result.error || "Error");
      }
    },
    onError: () => toast.error("Error"),
  });
}
```

### Query Keys
```typescript
// List all
queryKey: ["entities"]

// Filtered list
queryKey: ["entities", { status: "active" }]

// Single item
queryKey: ["entities", id]
```

---

## Database (Drizzle ORM)

### Schema Conventions
- Use UUIDv7 for all IDs (ordered for pagination):
  ```typescript
  id: text("id").primaryKey().$defaultFn(() => uuidv7()),
  ```
- Use snake_case for column names in database
- Include timestamps on all tables:
  ```typescript
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).notNull(),
  ```
- Always include `createdById` reference to user table

### Standard Fields
| Field | Type | Notes |
|-------|------|-------|
| `id` | `text` + UUIDv7 | Primary key |
| `createdAt` | `timestamp` | Auto-set |
| `updatedAt` | `timestamp` | Auto-update |
| `createdById` | `text` | FK to users |
| `isActive` | `boolean` | Soft delete flag |

---

## Forms (React Hook Form + Zod)

```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/shared/components/ui/form";

const schema = z.object({
  name: z.string().min(3, "Min 3 characters"),
  email: z.string().email("Invalid email"),
});

export function EntityForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "" },
  });

  const onSubmit = (data: z.infer<typeof schema>) => { /* ... */ };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit">Save</Button>
      </form>
    </Form>
  );
}
```

---

## Error Handling

- Use try/catch in server actions
- Return `{ success: false, error: "message" }` for expected errors
- Log errors with `console.error()` before returning
- Use `toast.error()` in React Query mutations for user feedback
- Check for specific error types (e.g., Zod refine errors)

---

## Authentication (Better Auth + DAL)

### DAL Pattern
```typescript
import { verifySession } from "@/core/auth/dal";
import { requireAdmin } from "@/core/auth/dal";

export async function myAction(data: unknown) {
  const { userId } = await verifySession();  // Redirects if not authed
  // ...
}

export default async function AdminPage() {
  await requireAdmin();  // Redirects if not admin
  return <AdminPanel />;
}
```

---

## Adding shadcn/ui Components

```bash
pnpm dlx shadcn@latest add button input form dialog card
```

---

## Important Notes

1. **Next.js 16**: Use `proxy.ts` for routing/redirects only
2. **Auth**: Always use DAL functions, never put auth logic in middleware
3. **Client Components**: Add `"use client"` at the top of any file using hooks
4. **React Compiler**: Enabled - component code is optimized automatically
5. **Server-only**: Use `import "server-only"` in server-only files

---

## Additional Resources

- Feature architecture patterns: `.agent/skills/feature-architecture/`
- Server actions: `.agent/skills/server-actions/`
- React Query patterns: `.agent/skills/react-query/`
- Drizzle schemas: `.agent/skills/drizzle-schema/`
- shadcn/ui: `.agent/skills/shadcn-ui/`
- Data tables: `.agent/skills/data-tables/`
- Full docs: `.github/copilot-instructions.md`
