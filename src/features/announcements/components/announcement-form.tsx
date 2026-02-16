"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Switch } from "@/shared/components/ui/switch";
import { Textarea } from "@/shared/components/ui/textarea";
import { useCreateAnnouncement } from "../hooks/use-create-announcement";
import { useUpdateAnnouncement } from "../hooks/use-update-announcement";
import {
  type Announcement,
  type CreateAnnouncementInput,
  createAnnouncementSchema,
} from "../schemas";

interface AnnouncementFormProps {
  announcement?: Announcement;
  onSuccess?: () => void;
}

export function AnnouncementForm({
  announcement,
  onSuccess,
}: AnnouncementFormProps) {
  const isEditing = !!announcement;
  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();

  const form = useForm<CreateAnnouncementInput>({
    resolver: zodResolver(createAnnouncementSchema),
    defaultValues: {
      title: announcement?.title || "",
      description: announcement?.description || "",
      active: announcement?.active ?? true,
    },
  });

  useEffect(() => {
    if (announcement) {
      form.reset({
        title: announcement.title,
        description: announcement.description,
        active: announcement.active,
      });
    }
  }, [announcement, form]);

  function onSubmit(data: CreateAnnouncementInput) {
    if (isEditing) {
      updateMutation.mutate(
        { ...data, id: announcement.id },
        {
          onSuccess: (result) => {
            if (result.success) {
              onSuccess?.();
            }
          },
        },
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: (result) => {
          if (result.success) {
            form.reset();
            onSuccess?.();
          }
        },
      });
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input
                  placeholder="Digite o título do aviso"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Digite a descrição completa do aviso"
                  className="min-h-30"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Ativo</FormLabel>
                <FormDescription>
                  Avisos ativos são exibidos no dashboard
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? "Salvando..."
              : isEditing
                ? "Atualizar Aviso"
                : "Criar Aviso"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
