"use client";

import { Loader2 } from "lucide-react";
import type { Acao } from "@/core/db/schema";
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
import { useDeleteAcao } from "../hooks/use-delete-acao";

type DeleteAcaoDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  acao: Acao | null;
};

export function DeleteAcaoDialog({
  open,
  onOpenChange,
  acao,
}: DeleteAcaoDialogProps) {
  const { mutate: deleteAcao, isPending } = useDeleteAcao();

  const handleDelete = () => {
    if (!acao) return;

    deleteAcao(acao.id, {
      onSuccess: (result) => {
        if (result.success) {
          onOpenChange(false);
        }
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Ação</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a ação <strong>{acao?.nome}</strong>?
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
