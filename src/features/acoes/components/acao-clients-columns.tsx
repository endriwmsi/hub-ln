"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle2, Hourglass, MoreHorizontal, XCircle } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import type { AcaoClientItem } from "../actions/get-acao-clients";

type StatusType = "aguardando" | "baixas_completas" | "baixas_negadas";

const statusConfig = {
  aguardando: {
    label: "Aguardando",
    className:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    icon: Hourglass,
  },
  baixas_completas: {
    label: "Baixas Completas",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    icon: CheckCircle2,
  },
  baixas_negadas: {
    label: "Baixas Negadas",
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    icon: XCircle,
  },
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

type ColumnsOptions = {
  onStatusUpdate: (
    requestId: string,
    itemIndex: number,
    status: StatusType,
  ) => void;
  isPending?: boolean;
};

export function createAcaoClientsColumns(
  options: ColumnsOptions,
): ColumnDef<AcaoClientItem>[] {
  const { onStatusUpdate, isPending } = options;

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
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={`Selecionar ${row.original.nome}`}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "nome",
      header: "Nome",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.nome}</span>
      ),
    },
    {
      accessorKey: "documento",
      header: "Documento",
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.documento}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = statusConfig[row.original.status];
        const Icon = status.icon;
        return (
          <Badge variant="secondary" className={`gap-1 ${status.className}`}>
            <Icon className="h-3 w-3" />
            {status.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "precoUnitario",
      header: "Valor Unit.",
      cell: ({ row }) => (
        <span className="text-sm font-medium">
          {formatCurrency(row.original.precoUnitario)}
        </span>
      ),
    },
    {
      id: "user",
      header: "Usuário",
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium">{row.original.userName}</p>
          <p className="text-xs text-muted-foreground">
            {row.original.userEmail}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "requestCreatedAt",
      header: "Data Envio",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(row.original.requestCreatedAt), "dd/MM/yyyy", {
            locale: ptBR,
          })}
        </span>
      ),
    },
    {
      id: "paid",
      header: "Pagamento",
      cell: ({ row }) => {
        const { requestPaid } = row.original;
        if (requestPaid) {
          return (
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
            >
              Pago
            </Badge>
          );
        }
        return (
          <Badge
            variant="secondary"
            className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
          >
            Pendente
          </Badge>
        );
      },
    },
    {
      id: "extracted",
      header: "Extraído",
      cell: ({ row }) => {
        const { extracted, extractedAt } = row.original;
        if (extracted && extractedAt) {
          return (
            <div>
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
              >
                Sim
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(extractedAt), "dd/MM/yy", {
                  locale: ptBR,
                })}
              </p>
            </div>
          );
        }
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Não
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" disabled={isPending}>
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() =>
                onStatusUpdate(
                  row.original.requestId,
                  row.original.itemIndex,
                  "aguardando",
                )
              }
            >
              <Hourglass className="h-4 w-4 mr-2 text-yellow-600" />
              Aguardando
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                onStatusUpdate(
                  row.original.requestId,
                  row.original.itemIndex,
                  "baixas_completas",
                )
              }
            >
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
              Baixas Completas
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                onStatusUpdate(
                  row.original.requestId,
                  row.original.itemIndex,
                  "baixas_negadas",
                )
              }
            >
              <XCircle className="h-4 w-4 mr-2 text-red-600" />
              Baixas Negadas
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
