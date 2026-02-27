"use client";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { formatCurrency } from "@/shared";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { getPendingWithdrawals, processWithdrawal } from "../actions";

type PendingWithdrawal = {
  id: string;
  amount: string;
  status: string;
  requestedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    pixKey: string | null;
  };
};

export function PendingWithdrawals() {
  const router = useRouter();
  const [withdrawals, setWithdrawals] = useState<PendingWithdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Carregar saques pendentes
  useEffect(() => {
    const loadWithdrawals = async () => {
      const result = await getPendingWithdrawals();
      if (result.success && result.data) {
        setWithdrawals(result.data.withdrawals);
      }
      setIsLoading(false);
    };

    loadWithdrawals();
  }, []);

  // Marcar saque como pago
  const handleMarkAsPaid = async (withdrawalId: string) => {
    setProcessingId(withdrawalId);
    startTransition(async () => {
      const result = await processWithdrawal(withdrawalId);
      if (result.success) {
        toast.success("Saque marcado como pago!");
        setWithdrawals((prev) => prev.filter((w) => w.id !== withdrawalId));
        router.refresh();
      } else {
        toast.error(result.error || "Erro ao processar saque");
      }
      setProcessingId(null);
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saques Pendentes</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (withdrawals.length === 0) {
    return null;
  }

  return (
    <Card className="border-amber-200 dark:border-amber-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          Saques Pendentes
        </CardTitle>
        <CardDescription>
          {withdrawals.length} solicitação(ões) aguardando pagamento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Chave PIX</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Solicitado</TableHead>
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {withdrawals.map((withdrawal) => (
              <TableRow key={withdrawal.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{withdrawal.user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {withdrawal.user.email}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {withdrawal.user.pixKey || "Não informada"}
                  </code>
                </TableCell>
                <TableCell className="font-medium text-green-600">
                  {formatCurrency(withdrawal.amount)}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDistanceToNow(new Date(withdrawal.requestedAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        disabled={processingId === withdrawal.id || isPending}
                      >
                        {processingId === withdrawal.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Pagar
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Pagamento</AlertDialogTitle>
                        <AlertDialogDescription>
                          Você está marcando o saque de{" "}
                          <strong>{formatCurrency(withdrawal.amount)}</strong>{" "}
                          do usuário <strong>{withdrawal.user.name}</strong>{" "}
                          como pago. Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleMarkAsPaid(withdrawal.id)}
                        >
                          Confirmar Pagamento
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
