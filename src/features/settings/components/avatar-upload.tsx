"use client";

import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { deleteAvatar, uploadAvatar } from "../actions/upload-avatar";

interface AvatarUploadProps {
  currentImage?: string | null;
  userName: string;
}

export function AvatarUpload({ currentImage, userName }: AvatarUploadProps) {
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Formato inválido. Use JPEG, PNG ou WebP");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Arquivo muito grande. Máximo 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Fazer upload
    startTransition(async () => {
      const formData = new FormData();
      formData.append("avatar", file);

      const result = await uploadAvatar(formData);
      if (result.success) {
        toast.success(result.message);
        if (result.imageUrl) {
          setPreview(result.imageUrl);
        }
      } else {
        toast.error(result.message);
        setPreview(currentImage || null);
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteAvatar();
      if (result.success) {
        toast.success(result.message);
        setPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Foto de Perfil</CardTitle>
        <CardDescription>
          Atualize sua foto de perfil. Formatos aceitos: JPEG, PNG, WebP (máximo
          5MB)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-6">
          {/* Preview do Avatar */}
          <div className="relative">
            {preview ? (
              <div className="relative h-24 w-24 overflow-hidden rounded-full">
                <Image
                  src={preview}
                  alt={userName}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                <span className="text-2xl font-semibold text-muted-foreground">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
              disabled={isPending}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending}
            >
              <Upload className="mr-2 h-4 w-4" />
              {isPending ? "Enviando..." : "Escolher imagem"}
            </Button>

            {preview && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isPending}
              >
                <X className="mr-2 h-4 w-4" />
                Remover foto
              </Button>
            )}
          </div>
        </div>

        {isPending && (
          <p className="text-sm text-muted-foreground">Processando imagem...</p>
        )}
      </CardContent>
    </Card>
  );
}
