"use client";

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
import { requestWithdrawal } from "../actions";

type WithdrawalDialogProps = {
  availableBalance: string;
  onSuccess?: () => void;
};

export function WithdrawalDialog({
  availableBalance,
  onSuccess,
}: WithdrawalDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const maxAmount = Number(availableBalance) || 0;
  const inputAmount = Number(amount) || 0;
  const isValid = inputAmount >= 10 && inputAmount <= maxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) return;

    setIsLoading(true);
    try {
      const result = await requestWithdrawal({ amount: inputAmount });

      if (result.success) {
        toast.success("Solicitação de saque enviada com sucesso!");
        setOpen(false);
        setAmount("");
        onSuccess?.();
      } else {
        toast.error(result.error || "Erro ao solicitar saque");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao processar solicitação");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMaxClick = () => {
    setAmount(maxAmount.toFixed(2));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={maxAmount < 10}>Solicitar Saque</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Solicitar Saque</DialogTitle>
          <DialogDescription>
            Informe o valor que deseja sacar. Valor mínimo: R$ 10,00
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Disponível:</span>
              <span className="font-medium text-green-600">
                {formatCurrency(availableBalance)}
              </span>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Valor do saque</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">
                    R$
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="10"
                    max={maxAmount}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0,00"
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleMaxClick}
                  disabled={isLoading}
                >
                  Máx
                </Button>
              </div>
              {amount && !isValid && (
                <p className="text-sm text-destructive">
                  {inputAmount < 10
                    ? "Valor mínimo é R$ 10,00"
                    : `Valor máximo é ${formatCurrency(availableBalance)}`}
                </p>
              )}
            </div>
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
              Confirmar Saque
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
