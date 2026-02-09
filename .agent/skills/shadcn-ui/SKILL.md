---
name: shadcn-ui
description: Uso de componentes shadcn/ui com formulários React Hook Form e validação Zod.
---

# ShadcnUI

Skill para uso de componentes shadcn/ui no projeto.

## Formulários com React Hook Form + Zod

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";

const schema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
});

export function EntityForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "" },
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    // ...
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Salvar</Button>
      </form>
    </Form>
  );
}
```

## Componentes Comuns

| Componente | Uso              |
| ---------- | ---------------- |
| `Button`   | Ações e submits  |
| `Input`    | Campos de texto  |
| `Select`   | Dropdowns        |
| `Dialog`   | Modais           |
| `Card`     | Containers       |
| `Alert`    | Mensagens        |
| `Table`    | Tabelas de dados |

## Instalação de Componentes

```bash
pnpm dlx shadcn@latest add button input form dialog card
```

> [!TIP]
> Use o componente `Form` do shadcn para integração automática com React Hook Form.

## Referências

- [shadcn/ui Docs](https://ui.shadcn.com/)
- Exemplos: [examples/](./examples/)
