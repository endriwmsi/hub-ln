"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { resetPassword } from "better-auth/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";
import { Button } from "@/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/shared/components/ui/form";
import { Label } from "@/shared/components/ui/label";
import { PasswordInput } from "@/shared/components/ui/password-input";
import { Spinner } from "@/shared/components/ui/spinner";
import { resetPasswordSchema } from "../schemas";

interface ResetPasswordFormProps {
  token: string;
}

export const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof resetPasswordSchema>) => {
    setIsPending(true);

    try {
      await resetPassword({
        newPassword: values.password,
        token,
        fetchOptions: {
          onRequest: () => {
            setIsPending(true);
          },
          onResponse: () => {
            setIsPending(false);
          },
          onError: (ctx) => {
            toast.error(ctx.error.message);
          },
          onSuccess: () => {
            toast.success("Senha redefinida com sucesso.");
            router.push("/login");
          },
        },
      });
    } catch (error) {
      toast.error("Erro ao redefinir a senha.");
      console.error("Reset password error:", error);
      setIsPending(false);
    }
  };

  return (
    <Form {...form}>
      <form
        className="w-full max-w-sm space-y-4"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <div className="grid gap-1">
              <FormItem>
                <Label htmlFor="password">Nova senha</Label>
                <FormControl>
                  <PasswordInput id="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            </div>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <div className="grid gap-1">
              <FormItem>
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <FormControl>
                  <PasswordInput id="confirmPassword" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            </div>
          )}
        />

        <Button className="w-full" type="submit" disabled={isPending}>
          {isPending ? (
            <span className="flex items-center gap-2">
              <Spinner />
              Redefinindo senha
            </span>
          ) : (
            "Redefinir senha"
          )}
        </Button>
      </form>
    </Form>
  );
};
