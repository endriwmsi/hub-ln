"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, Eye, MoreHorizontal, Trash2, X } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/shared";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import type { Submission } from "../types";

type ColumnsOptions = {
  onDelete?: (id: string) => void;
};

export function createColumns(
  options?: ColumnsOptions,
): ColumnDef<Submission>[] {
  const { onDelete } = options || {};
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Selecionar todos"
        />
      ),
      cell: ({ row }) => {
        const isPaid = row.original.paid;
        return (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            disabled={isPaid}
            aria-label="Selecionar linha"
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "service.title",
      header: "Serviço",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.service.title}</span>
      ),
    },
    {
      accessorKey: "acao.nome",
      header: "Ação",
      cell: ({ row }) =>
        row.original.acao?.nome || (
          <span className="text-muted-foreground text-sm">-</span>
        ),
    },
    {
      accessorKey: "quantity",
      header: "Quantidade",
      cell: ({ row }) => row.original.quantity,
    },
    {
      accessorKey: "totalPrice",
      header: "Valor Total",
      cell: ({ row }) => formatCurrency(row.original.totalPrice),
    },
    {
      accessorKey: "paid",
      header: "Pagamento",
      cell: ({ row }) =>
        row.original.paid ? (
          <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
            <Check className="h-4 w-4" />
            <span className="text-sm font-medium">Pago</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
            <X className="h-4 w-4" />
            <span className="text-sm">Pendente</span>
          </div>
        ),
    },
    {
      accessorKey: "createdAt",
      header: "Data",
      cell: ({ row }) =>
        format(new Date(row.original.createdAt), "dd/MM/yyyy HH:mm", {
          locale: ptBR,
        }),
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/envios/${row.original.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalhes
              </Link>
            </DropdownMenuItem>
            {onDelete && !row.original.paid && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(row.original.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
