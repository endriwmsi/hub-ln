"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { ServiceWithPrice } from "@/features/services/actions/get-user-service-prices";
import { updateIndicatedUserPrices } from "@/features/services/actions/update-indicated-user-prices";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { ReferralNode } from "../types";

interface ReferralsBulkPriceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedReferrals: ReferralNode[];
  services: ServiceWithPrice[];
  onSuccess?: () => void;
}

export function ReferralsBulkPriceModal({
  open,
  onOpenChange,
  selectedReferrals,
  services,
  onSuccess,
}: ReferralsBulkPriceModalProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [newCostPrice, setNewCostPrice] = useState<string>("");
  const queryClient = useQueryClient();

  const selectedService = services.find((s) => s.id === selectedServiceId);

  // Setar o preço padrão quando selecionar um serviço
  useEffect(() => {
    if (selectedService) {
      setNewCostPrice(selectedService.costPrice.toString());
    } else {
      setNewCostPrice("");
    }
  }, [selectedService]);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!selectedServiceId || !newCostPrice) {
        throw new Error("Preencha todos os campos");
      }

      const price = parseFloat(newCostPrice);
      if (Number.isNaN(price) || price <= 0) {
        throw new Error("Preço inválido");
      }

      if (selectedService && price < Number(selectedService.costPrice)) {
        throw new Error(
          `O valor não pode ser menor que o seu custo atual (R$ ${selectedService.costPrice})`,
        );
      }

      const targetUserIds = selectedReferrals.map((r) => r.id);

      const result = await updateIndicatedUserPrices({
        serviceId: selectedServiceId,
        targetUserIds,
        newCostPrice: price,
      });

      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      toast.success("Preços atualizados com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["paginated-referrals"] });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atualizar Preços em Massa</DialogTitle>
          <DialogDescription>
            Defina o novo preço de custo para os {selectedReferrals.length}{" "}
            usuários indicados selecionados.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="service">Serviço</Label>
            <Select
              value={selectedServiceId}
              onValueChange={setSelectedServiceId}
            >
              <SelectTrigger id="service">
                <SelectValue placeholder="Selecione um serviço" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.title} (Seu custo: R$ {service.costPrice})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Novo Preço para os Indicados (R$)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min={selectedService ? Number(selectedService.costPrice) : 0}
              value={newCostPrice}
              onChange={(e) => setNewCostPrice(e.target.value)}
              disabled={!selectedServiceId}
            />
            {selectedService && (
              <p className="text-xs text-muted-foreground">
                O valor mínimo permitido para você repassar é o seu próprio
                preço de custo (R$ {selectedService.costPrice}).
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button onClick={() => mutate()} disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar Preços"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
