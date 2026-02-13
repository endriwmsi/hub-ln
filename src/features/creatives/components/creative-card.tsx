"use client";

import { Download, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { Creative } from "@/core/db/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { useDeleteCreative } from "../hooks";

interface CreativeCardProps {
  creative: Creative;
  isAdmin?: boolean;
}

const categoryLabels: Record<string, string> = {
  instagram_post: "Post Instagram",
  instagram_story: "Story Instagram",
  facebook_post: "Post Facebook",
  linkedin_post: "Post LinkedIn",
  banner: "Banner",
  flyer: "Flyer",
  other: "Outro",
};

export function CreativeCard({ creative, isAdmin = false }: CreativeCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const deleteCreative = useDeleteCreative();

  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      // Extrair extensão da URL
      const urlParts = creative.imageUrl.split(".");
      const extension = urlParts[urlParts.length - 1].split("?")[0];
      const fileName = `${creative.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.${extension}`;

      // Usar API route proxy para garantir download correto
      const downloadUrl = `/api/download?url=${encodeURIComponent(creative.imageUrl)}&fileName=${encodeURIComponent(fileName)}`;

      // Criar link temporário e simular clique
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erro ao baixar:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = () => {
    deleteCreative.mutate(creative.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
      },
    });
  };

  return (
    <>
      <Card className="overflow-hidden p-0">
        <CardHeader className="p-0">
          <div className="relative aspect-square w-full overflow-hidden bg-muted">
            <Image
              src={creative.imageUrl}
              alt={creative.title}
              width={500}
              height={500}
              className="object-cover"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <CardTitle className="mb-2">{creative.title}</CardTitle>
          {creative.description && (
            <CardDescription className="line-clamp-2">
              {creative.description}
            </CardDescription>
          )}
          <div className="mt-2">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              {categoryLabels[creative.category] || creative.category}
            </span>
          </div>
        </CardContent>
        <CardFooter className="gap-2 p-4 pt-0">
          <Button
            variant="default"
            size="sm"
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1"
          >
            <Download className="mr-2 h-4 w-4" />
            {isDownloading ? "Baixando..." : "Baixar"}
          </Button>
          {isAdmin && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={deleteCreative.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o criativo "{creative.title}"? Esta
              ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteCreative.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCreative.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
