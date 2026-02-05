"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import { deleteSubmissions } from "../actions";
import type { Submission } from "../types";

type DeleteActionsBarProps = {
  selectedSubmissions: Submission[];
  onDeleted: () => void;
};

export function DeleteActionsBar({
  selectedSubmissions,
  onDeleted,
}: DeleteActionsBarProps) {
  const [isPending, startTransition] = useTransition();

  // Apenas envios não pagos podem ser deletados
  const deletableSubmissions = selectedSubmissions.filter((s) => !s.paid);
  const paidCount = selectedSubmissions.length - deletableSubmissions.length;

  const handleDelete = () => {
    if (deletableSubmissions.length === 0) {
      toast.error("Nenhum envio selecionado pode ser excluído");
      return;
    }

    startTransition(async () => {
      const result = await deleteSubmissions(
        deletableSubmissions.map((s) => s.id),
      );

      if (!result.success) {
        toast.error(result.error || "Erro ao excluir envios");
        return;
      }

      toast.success(`${result.data?.deleted} envio(s) excluído(s) com sucesso`);
      onDeleted();
    });
  };

  if (selectedSubmissions.length === 0) {
    return null;
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          disabled={isPending || deletableSubmissions.length === 0}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Excluindo...
            </>
          ) : (
            <>
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir ({deletableSubmissions.length})
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir {deletableSubmissions.length}{" "}
            envio(s)? Esta ação não pode ser desfeita.
            {paidCount > 0 && (
              <span className="block mt-2 text-amber-600 dark:text-amber-400">
                Nota: {paidCount} envio(s) pago(s) não serão excluídos.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
