"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { FormField, Service } from "@/core/db/schema";
import { estadosOptions, type FieldType } from "@/features/form-fields";
import { createServiceRequest } from "@/features/service-requests";
import { Button } from "@/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField as FormFieldComponent,
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
import { Textarea } from "@/shared/components/ui/textarea";

type DynamicFormRendererProps = {
  service: Service;
  fields: FormField[];
  acaoId?: string;
  costPrice?: string;
};

type UploadedDocument = {
  url: string;
  name: string;
  type: string;
  size: number;
};

// Gerar schema Zod dinamicamente baseado nos campos
function generateZodSchema(fields: FormField[], requiresDocument: boolean) {
  const schemaObj: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    let fieldSchema: z.ZodTypeAny;

    switch (field.type as FieldType) {
      case "email":
        fieldSchema = z.email("E-mail inválido");
        break;
      case "phone":
        fieldSchema = z.string().min(10, "Telefone inválido");
        break;
      case "cpf":
        fieldSchema = z.string().length(11, "CPF deve ter 11 dígitos");
        break;
      case "cnpj":
        fieldSchema = z.string().length(14, "CNPJ deve ter 14 dígitos");
        break;
      case "number":
      case "currency":
        fieldSchema = z.string().min(1, "Campo obrigatório");
        break;
      default:
        fieldSchema = z.string();
    }

    if (field.required) {
      // Ensure we have a string schema with min validation
      fieldSchema = z.string().min(1, "Campo obrigatório");
    } else {
      fieldSchema = z.string().optional();
    }

    schemaObj[field.name] = fieldSchema;
  }

  // Se requer documento, adicionar campo de documento (pelo menos 1)
  if (requiresDocument) {
    schemaObj["_documentCount"] = z
      .number()
      .min(1, "Envie pelo menos um documento");
  }

  return z.object(schemaObj);
}

// Máscara para CPF
function maskCPF(value: string) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
}

// Máscara para CNPJ
function maskCNPJ(value: string) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
}

// Máscara para telefone
function maskPhone(value: string) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{4})\d+?$/, "$1");
}

// Máscara para moeda
function maskCurrency(value: string) {
  const numericValue = value.replace(/\D/g, "");
  const formatted = (Number(numericValue) / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  return formatted;
}

export function DynamicFormRenderer({
  service,
  fields,
  acaoId,
  costPrice,
}: DynamicFormRendererProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<
    UploadedDocument[]
  >([]);
  const [isUploading, setIsUploading] = useState(false);

  const schema = generateZodSchema(fields, service.requiresDocument);
  type FormData = z.infer<typeof schema>;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...fields.reduce(
        (acc, field) => {
          acc[field.name] = "";
          return acc;
        },
        {} as Record<string, string>,
      ),
      ...(service.requiresDocument ? { _documentCount: 0 } : {}),
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validar tipo e tamanho de cada arquivo
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];

    for (const file of Array.from(files)) {
      if (!validTypes.includes(file.type)) {
        toast.error(`Arquivo "${file.name}" inválido. Use JPG, PNG ou PDF.`);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Arquivo "${file.name}" muito grande. Máximo 5MB.`);
        return;
      }
    }

    setIsUploading(true);

    try {
      const newDocuments: UploadedDocument[] = [];

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Erro no upload de ${file.name}`);
        }

        const data = await response.json();

        newDocuments.push({
          url: data.url,
          name: file.name,
          type: file.type,
          size: file.size,
        });
      }

      const updatedDocs = [...uploadedDocuments, ...newDocuments];
      setUploadedDocuments(updatedDocs);
      form.setValue("_documentCount", updatedDocs.length);
      toast.success(
        `${newDocuments.length} documento(s) enviado(s) com sucesso!`,
      );
    } catch (error) {
      console.error("Erro no upload:", error);
      toast.error("Erro ao enviar documento. Tente novamente.");
    } finally {
      setIsUploading(false);
      // Limpar o input para permitir selecionar o mesmo arquivo novamente
      e.target.value = "";
    }
  };

  const removeDocument = (index: number) => {
    const updatedDocs = uploadedDocuments.filter((_, i) => i !== index);
    setUploadedDocuments(updatedDocs);
    form.setValue("_documentCount", updatedDocs.length);
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      // Remover campos internos
      const { _documentCount, ...formData } = data as Record<string, unknown>;

      const documents = uploadedDocuments.map((doc) => ({
        ...doc,
        uploadedAt: new Date().toISOString(),
      }));

      const result = await createServiceRequest({
        serviceId: service.id,
        acaoId: acaoId || undefined,
        formData,
        documents,
        quantity: 1,
      });

      if (!result.success) {
        throw new Error(result.error || "Erro ao criar solicitação");
      }

      toast.success("Solicitação enviada com sucesso!");
      router.push("/envios");
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao enviar solicitação. Tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renderizar campo baseado no tipo
  const renderField = (field: FormField) => {
    const fieldType = field.type as FieldType;
    const options = field.options as Record<string, unknown> | null;

    return (
      <FormFieldComponent
        key={field.id}
        control={form.control}
        name={field.name}
        render={({ field: formField }) => (
          <FormItem>
            <FormLabel>
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </FormLabel>
            <FormControl>
              {fieldType === "textarea" ? (
                <Textarea
                  placeholder={field.placeholder || ""}
                  {...formField}
                  value={formField.value as string}
                />
              ) : fieldType === "select" ? (
                <Select
                  onValueChange={formField.onChange}
                  defaultValue={formField.value as string}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={field.placeholder || "Selecione..."}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      (options?.options as Array<{
                        value: string;
                        label: string;
                      }>) || []
                    ).map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : fieldType === "state" ? (
                <Select
                  onValueChange={formField.onChange}
                  defaultValue={formField.value as string}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado..." />
                  </SelectTrigger>
                  <SelectContent>
                    {estadosOptions.map((estado) => (
                      <SelectItem key={estado.value} value={estado.value}>
                        {estado.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={fieldType === "email" ? "email" : "text"}
                  placeholder={field.placeholder || ""}
                  {...formField}
                  value={formField.value as string}
                  onChange={(e) => {
                    let value = e.target.value;

                    // Aplicar máscaras
                    if (fieldType === "cpf") {
                      value = maskCPF(value);
                    } else if (fieldType === "cnpj") {
                      value = maskCNPJ(value);
                    } else if (fieldType === "phone") {
                      value = maskPhone(value);
                    } else if (fieldType === "currency") {
                      value = maskCurrency(value);
                    }

                    formField.onChange(value);
                  }}
                />
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Campos dinâmicos */}
        <div className="grid gap-4 md:grid-cols-2">
          {fields.map((field) => renderField(field))}
        </div>

        {/* Upload de documento */}
        {service.requiresDocument && (
          <div className="space-y-2">
            <FormLabel>
              Documentos
              <span className="text-destructive ml-1">*</span>
            </FormLabel>
            <FormDescription>
              Envie os documentos necessários (RG, CNH, comprovantes, etc.).
              Você pode enviar múltiplos arquivos. Formatos aceitos: JPG, PNG ou
              PDF. Máximo 5MB por arquivo.
            </FormDescription>

            {/* Lista de documentos já enviados */}
            {uploadedDocuments.length > 0 && (
              <div className="space-y-2">
                {uploadedDocuments.map((doc, index) => (
                  <div
                    key={doc.url}
                    className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(doc.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeDocument(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Área de upload */}
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="document-upload"
                disabled={isUploading}
                multiple
              />
              <label
                htmlFor="document-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                {isUploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  <Upload className="h-8 w-8 text-muted-foreground" />
                )}
                <span className="text-sm text-muted-foreground">
                  {isUploading
                    ? "Enviando..."
                    : uploadedDocuments.length > 0
                      ? "Clique para adicionar mais arquivos"
                      : "Clique para selecionar ou arraste os arquivos"}
                </span>
              </label>
            </div>
            {form.formState.errors._documentCount && (
              <p className="text-sm text-destructive">
                {form.formState.errors._documentCount.message as string}
              </p>
            )}
          </div>
        )}

        {/* Resumo do preço */}
        <div className="border rounded-lg p-4 bg-muted/50">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Valor do serviço:</span>
            <span className="text-xl font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(Number(costPrice || service.basePrice))}
            </span>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || isUploading}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            "Enviar Solicitação"
          )}
        </Button>
      </form>
    </Form>
  );
}
