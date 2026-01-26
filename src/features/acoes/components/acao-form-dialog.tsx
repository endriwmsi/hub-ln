"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Acao } from "@/core/db/schema";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Switch } from "@/shared/components/ui/switch";
import { useCreateAcao } from "../hooks/use-create-acao";
import { useUpdateAcao } from "../hooks/use-update-acao";
import {
  type CreateAcaoInput,
  createAcaoBaseSchema,
  orgaoLabels,
  type StatusOrgao,
  statusOrgaoLabels,
} from "../schemas";

type AcaoFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  acao?: Acao | null;
};

export function AcaoFormDialog({
  open,
  onOpenChange,
  acao,
}: AcaoFormDialogProps) {
  const isEditing = !!acao;

  const { mutate: createAcao, isPending: isCreating } = useCreateAcao();
  const { mutate: updateAcao, isPending: isUpdating } = useUpdateAcao();

  const isPending = isCreating || isUpdating;

  const form = useForm<CreateAcaoInput>({
    resolver: zodResolver(createAcaoBaseSchema),
    defaultValues: {
      nome: "",
      dataInicio: new Date(),
      dataFim: new Date(),
      statusSpc: "aguardando_baixas",
      statusBoaVista: "aguardando_baixas",
      statusSerasa: "aguardando_baixas",
      statusCenprotNacional: "aguardando_baixas",
      statusCenprotSp: "aguardando_baixas",
      statusOutros: "aguardando_baixas",
      visivel: true,
      permiteEnvios: true,
    },
  });

  // Preencher form quando editar
  useEffect(() => {
    if (acao) {
      form.reset({
        nome: acao.nome,
        dataInicio: new Date(acao.dataInicio),
        dataFim: new Date(acao.dataFim),
        statusSpc: acao.statusSpc as StatusOrgao,
        statusBoaVista: acao.statusBoaVista as StatusOrgao,
        statusSerasa: acao.statusSerasa as StatusOrgao,
        statusCenprotNacional: acao.statusCenprotNacional as StatusOrgao,
        statusCenprotSp: acao.statusCenprotSp as StatusOrgao,
        statusOutros: acao.statusOutros as StatusOrgao,
        visivel: acao.visivel,
        permiteEnvios: acao.permiteEnvios,
      });
    } else {
      form.reset({
        nome: "",
        dataInicio: new Date(),
        dataFim: new Date(),
        statusSpc: "aguardando_baixas",
        statusBoaVista: "aguardando_baixas",
        statusSerasa: "aguardando_baixas",
        statusCenprotNacional: "aguardando_baixas",
        statusCenprotSp: "aguardando_baixas",
        statusOutros: "aguardando_baixas",
        visivel: true,
        permiteEnvios: true,
      });
    }
  }, [acao, form]);

  const onSubmit = (data: CreateAcaoInput) => {
    if (isEditing && acao) {
      updateAcao(
        { id: acao.id, ...data },
        {
          onSuccess: (result) => {
            if (result.success) {
              onOpenChange(false);
            }
          },
        },
      );
    } else {
      createAcao(data, {
        onSuccess: (result) => {
          if (result.success) {
            onOpenChange(false);
          }
        },
      });
    }
  };

  const statusFields = [
    { name: "statusSpc", label: orgaoLabels.statusSpc },
    { name: "statusBoaVista", label: orgaoLabels.statusBoaVista },
    { name: "statusSerasa", label: orgaoLabels.statusSerasa },
    { name: "statusCenprotNacional", label: orgaoLabels.statusCenprotNacional },
    { name: "statusCenprotSp", label: orgaoLabels.statusCenprotSp },
    { name: "statusOutros", label: orgaoLabels.statusOutros },
  ] as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Ação" : "Nova Ação"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Altere os dados da ação limpa nome"
              : "Preencha os dados para criar uma nova ação limpa nome"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Informações básicas */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Ação</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Ação Limpa Nome Janeiro 2026"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dataInicio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Início</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={
                            field.value ? format(field.value, "yyyy-MM-dd") : ""
                          }
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? new Date(e.target.value) : null,
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dataFim"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Fim</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={
                            field.value ? format(field.value, "yyyy-MM-dd") : ""
                          }
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? new Date(e.target.value) : null,
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Status por órgão */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Status por Órgão</h3>
              <div className="grid grid-cols-2 gap-4">
                {statusFields.map(({ name, label }) => (
                  <FormField
                    key={name}
                    control={form.control}
                    name={name}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{label}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(statusOrgaoLabels).map(
                              ([value, statusLabel]) => (
                                <SelectItem key={value} value={value}>
                                  {statusLabel}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Configurações */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Configurações</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="visivel"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Visível para usuários
                        </FormLabel>
                        <FormDescription>
                          Se ativado, outros usuários podem ver esta ação
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="permiteEnvios"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Permite envios
                        </FormLabel>
                        <FormDescription>
                          Se ativado, usuários podem enviar nomes
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Salvar alterações" : "Criar ação"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
