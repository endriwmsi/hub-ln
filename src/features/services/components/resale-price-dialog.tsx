"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatCurrency } from "@/shared";
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
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Spinner } from "@/shared/components/ui/spinner";
import { updateUserServicePrice } from "../actions/update-user-service-price";

type ResalePriceDialogProps = {
  serviceId: string;
  serviceTitle: string;
  costPrice: string;
  currentResalePrice: string | null;
  onSuccess?: () => void;
};

export function ResalePriceDialog({
  serviceId,
  serviceTitle,
  costPrice,
  currentResalePrice,
  onSuccess,
}: ResalePriceDialogProps) {
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState(currentResalePrice || costPrice);
  const [isLoading, setIsLoading] = useState(false);

  const minPrice = Number(costPrice);
  const inputPrice = Number(price) || 0;
  const isValid = inputPrice >= minPrice;
  const commission = inputPrice - minPrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) return;

    setIsLoading(true);
    try {
      const result = await updateUserServicePrice({
        serviceId,
        resalePrice: inputPrice,
      });

      if (result.success) {
        toast.success("Preço de revenda atualizado!");
        setOpen(false);
        onSuccess?.();
      } else {
        toast.error(result.error || "Erro ao atualizar preço");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao processar solicitação");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4 mr-2" />
          Editar Preço
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Preço de Revenda</DialogTitle>
          <DialogDescription>{serviceTitle}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Info do preço de custo */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Seu preço de custo:</span>
              <span className="font-medium">{formatCurrency(costPrice)}</span>
            </div>

            {/* Input do preço de revenda */}
            <div className="grid gap-2">
              <Label htmlFor="resalePrice">Preço de revenda</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground">
                  R$
                </span>
                <Input
                  id="resalePrice"
                  type="number"
                  step="0.01"
                  min={minPrice}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0,00"
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
              {price && !isValid && (
                <p className="text-sm text-destructive">
                  Preço mínimo é {formatCurrency(costPrice)}
                </p>
              )}
            </div>

            {/* Comissão estimada */}
            {isValid && commission > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                <span className="text-sm text-muted-foreground">
                  Comissão por nome:
                </span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(commission.toFixed(2))}
                </span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!isValid || isLoading}>
              {isLoading && <Spinner className="mr-2 h-4 w-4" />}
              Salvar Preço
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
