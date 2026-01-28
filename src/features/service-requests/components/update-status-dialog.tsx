"use client";

import { Edit, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  type ServiceRequestStatus,
  serviceRequestStatuses,
  serviceRequestStatusLabels,
  updateServiceRequestStatus,
} from "@/features/service-requests";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";

type UpdateStatusDialogProps = {
  requestId: string;
  currentStatus: ServiceRequestStatus;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function UpdateStatusDialog({
  requestId,
  currentStatus,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: UpdateStatusDialogProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const [status, setStatus] = useState<ServiceRequestStatus>(currentStatus);
  const [notes, setNotes] = useState("");
  const [isPending, setIsPending] = useState(false);

  // Support both controlled and uncontrolled modes
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const onOpenChange = isControlled ? controlledOnOpenChange : setInternalOpen;

  const handleSubmit = async () => {
    setIsPending(true);

    try {
      const result = await updateServiceRequestStatus({
        id: requestId,
        status,
        notes: notes || undefined,
      });

      if (!result.success) {
        throw new Error(result.error || "Erro ao atualizar status");
      }

      toast.success("Status atualizado com sucesso!");
      onOpenChange?.(false);
      router.refresh();
    } catch (error) {
      console.error("Erro:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao atualizar status",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Atualizar Status
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atualizar Status</DialogTitle>
          <DialogDescription>
            Altere o status da solicitação e adicione observações se necessário.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Novo Status</Label>
            <Select
              value={status}
              onValueChange={(value) =>
                setStatus(value as ServiceRequestStatus)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {serviceRequestStatuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {serviceRequestStatusLabels[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Observações (opcional)</Label>
            <Textarea
              placeholder="Adicione observações sobre esta atualização..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange?.(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
