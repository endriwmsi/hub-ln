"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import type { Coupon } from "@/core/db/schema";
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
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Switch } from "@/shared/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { useDeleteCoupon, useUpdateCoupon } from "../hooks";
import { discountTypeLabels } from "../schemas";

type CouponsTableProps = {
  coupons: Coupon[];
};

export function CouponsTable({ coupons }: CouponsTableProps) {
  const { mutate: updateCoupon } = useUpdateCoupon();
  const { mutate: deleteCoupon } = useDeleteCoupon();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleToggleActive = (coupon: Coupon) => {
    updateCoupon({
      id: coupon.id,
      active: !coupon.active,
    });
  };

  const handleDelete = (couponId: string) => {
    setDeletingId(couponId);
    deleteCoupon(couponId);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDiscountValue = (type: string, value: string) => {
    const numValue = Number(value);
    if (type === "percentage") {
      return `${numValue}%`;
    }
    return `R$ ${numValue.toFixed(2)}`;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Desconto</TableHead>
            <TableHead>Uso</TableHead>
            <TableHead>Limite</TableHead>
            <TableHead>Validade</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ativo</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coupons.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={9}
                className="text-center text-muted-foreground"
              >
                Nenhum cupom criado ainda
              </TableCell>
            </TableRow>
          ) : (
            coupons.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell className="font-mono font-semibold">
                  {coupon.code}
                </TableCell>
                <TableCell>{discountTypeLabels[coupon.discountType]}</TableCell>
                <TableCell>
                  {formatDiscountValue(
                    coupon.discountType,
                    coupon.discountValue,
                  )}
                </TableCell>
                <TableCell>
                  {coupon.usageCount}
                  {coupon.singleUse && (
                    <Badge variant="outline" className="ml-2">
                      Uso Único
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{coupon.usageLimit ?? "Ilimitado"}</TableCell>
                <TableCell className="text-xs">
                  <div>De: {formatDate(coupon.validFrom)}</div>
                  <div>Até: {formatDate(coupon.validUntil)}</div>
                </TableCell>
                <TableCell>
                  {coupon.active ? (
                    <Badge variant="default" className="bg-green-600">
                      Ativo
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Inativo</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={coupon.active}
                    onCheckedChange={() => handleToggleActive(coupon)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={deletingId === coupon.id}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o cupom{" "}
                          <strong>{coupon.code}</strong>? Esta ação não pode ser
                          desfeita.
                          {coupon.usageCount > 0 && (
                            <span className="block mt-2 text-destructive font-semibold">
                              Este cupom já foi usado {coupon.usageCount}{" "}
                              {coupon.usageCount === 1 ? "vez" : "vezes"} e não
                              pode ser excluído.
                            </span>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(coupon.id)}
                          disabled={coupon.usageCount > 0}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
