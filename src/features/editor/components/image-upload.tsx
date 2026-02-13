"use client";

import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";

interface ImageUploadProps {
  onUpload: (imageUrl: string, width: number, height: number) => void;
  trigger?: React.ReactNode;
}

export function ImageUpload({ onUpload, trigger }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verificar se é uma imagem
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        onUpload(event.target?.result as string, img.width, img.height);
        toast.success("Imagem adicionada com sucesso!");
        setOpen(false); // Fechar modal após upload
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Upload Imagem
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Imagem</DialogTitle>
          <DialogDescription>
            Adicione uma imagem ao seu criativo. Você pode redimensionar e
            posicionar a imagem após o upload.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              Clique para selecionar uma imagem
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
            >
              Selecionar Arquivo
            </Button>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>Formatos aceitos: PNG, JPG, JPEG, GIF, WebP</p>
            <p>A imagem será redimensionada automaticamente para o canvas</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
