"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Loader2, Settings2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { getUsersWithServicePrice } from "../actions/get-users-with-service-price";
import { updateIndicatedUserPrices } from "../actions/update-indicated-user-prices";

interface ServiceUsersTableProps {
  serviceId: string;
  basePrice: string;
}

export function ServiceUsersTable({
  serviceId,
  basePrice,
}: ServiceUsersTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCostPrice, setNewCostPrice] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    data: usersData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["serviceUsers", serviceId],
    queryFn: async () => {
      const result = await getUsersWithServicePrice(serviceId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked && usersData) {
      setSelectedIds(new Set(usersData.map((u) => u.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (checked: boolean, id: string) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleUpdatePrices = async () => {
    if (!newCostPrice) {
      toast.error("Informe um novo preço");
      return;
    }
    const price = parseFloat(newCostPrice);
    if (Number.isNaN(price) || price <= 0) {
      toast.error("Preço inválido");
      return;
    }
    if (price < Number(basePrice)) {
      toast.error(`O preço não pode ser menor que o base: R$ ${basePrice}`);
      return;
    }

    setIsUpdating(true);
    try {
      const result = await updateIndicatedUserPrices({
        serviceId: serviceId,
        targetUserIds: Array.from(selectedIds),
        newCostPrice: price,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success("Preços atualizados com sucesso!");
      setIsModalOpen(false);
      setSelectedIds(new Set());
      setNewCostPrice("");
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro desconhecido");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const users = usersData || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Usuários e Preços</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie o custo desse serviço para cada usuário.
          </p>
        </div>
        <Button
          onClick={() => {
            setNewCostPrice(basePrice);
            setIsModalOpen(true);
          }}
          disabled={selectedIds.size === 0}
        >
          <Settings2 className="mr-2 h-4 w-4" />
          Alterar Preços ({selectedIds.size})
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    users.length > 0 && selectedIds.size === users.length
                  }
                  onCheckedChange={handleSelectAll}
                  aria-label="Selecionar todos"
                />
              </TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Preço Atual</TableHead>
              <TableHead>Configurado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(u.id)}
                    onCheckedChange={(checked) =>
                      handleSelectOne(checked as boolean, u.id)
                    }
                    aria-label={`Selecionar ${u.name}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell className="capitalize">{u.role}</TableCell>
                <TableCell className="font-semibold text-primary">
                  R$ {Number(u.costPrice).toFixed(2).replace(".", ",")}
                </TableCell>
                <TableCell>
                  {u.isCustomPrice ? (
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Manual
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="gap-1 text-muted-foreground"
                    >
                      <AlertCircle className="h-3 w-3" /> Herdado
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar Preços em Massa</DialogTitle>
            <DialogDescription>
              Altere o custo de {selectedIds.size} usuários selecionados.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="price">Novo Preço (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min={Number(basePrice)}
                value={newCostPrice}
                onChange={(e) => setNewCostPrice(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                O valor mínimo permitido para esse serviço é o preço base: R${" "}
                {basePrice}.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isUpdating}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdatePrices} disabled={isUpdating}>
              {isUpdating ? "Salvando..." : "Salvar Preços"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
