"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Upload } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
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
import type { CreateCreativeInput } from "../schemas";

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<Omit<CreateCreativeInput, "imageUrl">>({
    defaultValues: {
      title: "",
      description: "",
      category: "other",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Formato inválido. Use JPEG, PNG ou WebP");
      return;
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 5MB");
      return;
    }

    setSelectedFile(file);

    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: Omit<CreateCreativeInput, "imageUrl">) => {
    if (!selectedFile) {
      toast.error("Selecione uma imagem");
      return;
    }

    setIsUploading(true);

    try {
      // Upload para API route que vai usar S3
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("folder", "creatives");

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.error || "Erro ao fazer upload");
      }

      const { url } = await uploadResponse.json();

      // Criar criativo com a URL do S3
      const result = await createCreative({
        title: data.title,
        description: data.description,
        category: data.category,
        imageUrl: url,
      });

      if (!result.success) {
        throw new Error("Erro ao criar criativo");
      }

      toast.success("Criativo criado com sucesso!");

      // Reset do formulário
      form.reset();
      setSelectedFile(null);
      setPreviewUrl(null);

      // Atualizar lista
      queryClient.invalidateQueries({ queryKey: ["creatives"] });

      // Callback de sucesso (fecha o dialog)
      onSuccess?.();
    } catch (error) {
      console.error("Erro:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao criar criativo",
      );
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
              />
              {previewUrl && (
                <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg border">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
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

        <Button type="submit" disabled={isUploading || !selectedFile}>
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Fazer Upload
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
