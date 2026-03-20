"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { createCreative } from "../actions";
import { type CreateCreativeInput, createCreativeSchema } from "../schemas";

const categories = [
  { value: "instagram_post", label: "Post Instagram" },
  { value: "instagram_story", label: "Story Instagram" },
  { value: "facebook_post", label: "Post Facebook" },
  { value: "linkedin_post", label: "Post LinkedIn" },
  { value: "banner", label: "Banner" },
  { value: "flyer", label: "Flyer" },
  { value: "other", label: "Outro" },
];

interface UploadCreativeFormProps {
  onSuccess?: () => void;
}

export function UploadCreativeForm({
  onSuccess,
}: UploadCreativeFormProps = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const form = useForm<Omit<CreateCreativeInput, "imageUrl">>({
    resolver: zodResolver(createCreativeSchema.omit({ imageUrl: true })),
    defaultValues: {
      title: "",
      description: "",
      category: "instagram_post",
    },
  });

  // Limpar previews quando desmontar ou trocar arquivos
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [previewUrls]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    const validFiles = files.filter((file) => {
      if (!validTypes.includes(file.type)) {
        toast.error(`Formato inválido: ${file.name}`);
        return false;
      }
      if (file.size > maxSize) {
        toast.error(`Arquivo muito grande: ${file.name}`);
        return false;
      }
      return true;
    });

    if (!validFiles.length) return;

    setSelectedFiles((prev) => [...prev, ...validFiles]);

    // Criar previews
    const newPreviewUrls = validFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);

    // Reseta o input para permitir selecionar o mesmo arquivo novamente se tiver sido removido
    e.target.value = "";
  };

  const removeFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      const urls = [...prev];
      URL.revokeObjectURL(urls[index]); // Limpa a memória
      urls.splice(index, 1);
      return urls;
    });
  }, []);

  const onSubmit = async (data: Omit<CreateCreativeInput, "imageUrl">) => {
    if (!selectedFiles.length) {
      toast.error("Selecione pelo menos uma imagem");
      return;
    }

    setIsUploading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      // Usar Promise.all para upload e criação em paralelo ou sequencial?
      // Usaremos sequencial para evitar problemas de limite de upload caso sejam muitos arquivos.
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        try {
          // Upload para API route
          const formData = new FormData();
          formData.append("file", file);
          formData.append("folder", "creatives");

          const uploadResponse = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!uploadResponse.ok) {
            const error = await uploadResponse.json();
            throw new Error(
              error.error || `Erro ao fazer upload: ${file.name}`,
            );
          }

          const { url } = await uploadResponse.json();

          // Criar criativo
          // Sufixo o título se for mais de um arquivo
          const titleToUse =
            selectedFiles.length > 1 ? `${data.title} ${i + 1}` : data.title;

          const result = await createCreative({
            title: titleToUse,
            description: data.description,
            category: data.category,
            imageUrl: url,
          });

          if (!result.success) {
            throw new Error(`Erro ao criar registro: ${file.name}`);
          }
          successCount++;
        } catch (error) {
          console.error(`Erro processando ${file.name}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} criativo(s) criado(s) com sucesso!`);
      }
      if (errorCount > 0) {
        toast.error(`Falha em ${errorCount} criativo(s). Verifique o console.`);
      }

      if (successCount === selectedFiles.length) {
        // Reset do formulário apenas se tudo deu certo
        form.reset();
        setSelectedFiles([]);
        setPreviewUrls([]);
        onSuccess?.();
      } else if (successCount > 0) {
        // Remover arquivos que deram certo do estado - simplificação: fechar form se algum sucesso?
        // Aqui optamos por não limpar o form se houver erros, e deixar a UX prosseguir.
        onSuccess?.();
      }

      // Atualizar lista
      queryClient.invalidateQueries({ queryKey: ["creatives"] });
    } catch (error) {
      console.error("Erro geral no envio:", error);
      toast.error("Ocorreu um erro no processo de envio.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Upload de Imagem */}
        <FormItem>
          <FormLabel>Imagem</FormLabel>
          <FormControl>
            <div className="space-y-4">
              <Input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                disabled={isUploading}
                multiple
              />
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {previewUrls.map((url, index) => (
                    <div
                      key={url}
                      className="group relative aspect-video overflow-hidden rounded-lg border"
                    >
                      <Image
                        src={url}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute right-1 top-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => removeFile(index)}
                        disabled={isUploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FormControl>
          <FormDescription>
            Formatos aceitos: JPEG, PNG, WebP. Máximo 5MB.
          </FormDescription>
        </FormItem>

        {/* Título */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Post para Instagram - Promoção"
                  {...field}
                  disabled={isUploading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Descrição */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva o criativo..."
                  {...field}
                  disabled={isUploading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Categoria */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isUploading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isUploading || selectedFiles.length === 0}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Fazer Upload{" "}
              {selectedFiles.length > 0 && `(${selectedFiles.length})`}
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
