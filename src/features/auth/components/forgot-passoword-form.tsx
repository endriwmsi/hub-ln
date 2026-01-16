"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";
import { requestPasswordReset } from "@/core/auth/auth-client";
import { Button } from "@/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Spinner } from "@/shared/components/ui/spinner";
import { forgotPasswordSchema } from "../schemas";

export const ForgotPasswordForm = () => {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function handleSubmit(values: z.infer<typeof forgotPasswordSchema>) {
    setIsPending(true);

    try {
      const { error } = await requestPasswordReset({
        email: values.email,
        redirectTo: "/reset-password",
      });

      if (error) {
        toast.error(error.message || "Erro ao processar solicitação");
        setIsPending(false);
        return;
      }

      toast.success("Link de redefinição enviado para seu e-mail.");
      router.push("/forgot-password/success");
    } catch (error) {
      toast.error("Erro ao enviar o link de redefinição de senha.");
      console.error("Forgot password error:", error);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="w-full max-w-sm space-y-4"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <div className="grid gap-1">
              <Label htmlFor="email">Email</Label>
              <FormControl>
                <Input
                  id="email"
                  {...field}
                  className="text-primary border-0 bg-zinc-900 px-4 py-5"
                  placeholder="nome@exemplo.com"
                  autoComplete="email"
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </div>
          )}
        />

        <Button
          variant="secondary"
          className="w-full"
          type="submit"
          disabled={isPending}
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Spinner />
              Enviando link de redefinição
            </span>
          ) : (
            "Enviar link de redefinição"
          )}
        </Button>
      </form>
    </Form>
  );
};
