"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { updatePixKey } from "../actions/update-keys";
import { type UpdatePixKeyInput, updatePixKeySchema } from "../schemas";

interface UpdatePixKeyFormProps {
  defaultValues: {
    key: string | null;
  };
}

export function UpdatePixKeyForm({ defaultValues }: UpdatePixKeyFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<UpdatePixKeyInput>({
    resolver: zodResolver(updatePixKeySchema),
    defaultValues: {
      key: defaultValues.key ?? "",
    },
  });

  function onSubmit(data: UpdatePixKeyInput) {
    startTransition(async () => {
      const result = await updatePixKey(data);
      if (result.success) {
        toast.success(result.message);
        form.reset();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chave Pix</CardTitle>
        <CardDescription>Adicione ou atualize sua chave PIX.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chave Pix</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Chave Pix"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Alterar chave"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <div className="flex flex-col">
          <p className="text-sm text-muted-foreground">
            Você pode usar seu CPF, email ou número de telefone como chave Pix.
          </p>
          <p className="text-sm text-red-500">
            Não nos responsabilizamos por transações realizadas a chaves
            informadas incorretamente. Certifique-se de que a chave Pix está
            correta antes de salvar.
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
