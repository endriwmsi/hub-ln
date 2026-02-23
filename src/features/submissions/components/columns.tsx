"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Ban,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  Hourglass,
  Loader2,
  MoreHorizontal,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import {
  type ServiceRequestStatus,
  serviceRequestStatusColors,
  serviceRequestStatusLabels,
} from "@/features/service-requests";
import { formatCurrency } from "@/shared";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import type { GlobalStatus, Submission } from "../types";

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
      accessorKey: "globalStatus",
      header: "Status",
      cell: ({ row }) => {
        const { globalStatus, status, quantity } = row.original;

        // Para envios individuais (quantity === 1), mostrar status individual
        if (quantity === 1 && status) {
          const statusIconMap: Record<
            ServiceRequestStatus,
            typeof CheckCircle2
          > = {
            pending: Clock,
            processing: Loader2,
            completed: CheckCircle2,
            cancelled: Ban,
            rejected: XCircle,
          };

          const Icon = statusIconMap[status];
          const label = serviceRequestStatusLabels[status];
          const colorClass = serviceRequestStatusColors[status];

          return (
            <Badge
              variant="secondary"
              className={`gap-1 ${colorClass} dark:bg-opacity-30`}
            >
              <Icon className="h-3 w-3" />
              {label}
            </Badge>
          );
        }

        // Para envios em bulk (quantity > 1), mostrar globalStatus
        if (quantity > 1 && globalStatus) {
          const globalStatusConfig: Record<
            GlobalStatus,
            { label: string; className: string; icon: typeof CheckCircle2 }
          > = {
            aguardando: {
              label: "Aguardando",
              className:
                "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
              icon: Hourglass,
            },
            baixas_completas: {
              label: "Completas",
              className:
                "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
              icon: CheckCircle2,
            },
            baixas_parciais: {
              label: "Parciais",
              className:
                "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
              icon: Hourglass,
            },
            baixas_negadas: {
              label: "Negadas",
              className:
                "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
              icon: XCircle,
            },
          };

          const config = globalStatusConfig[globalStatus];
          const Icon = config.icon;

          return (
            <Badge variant="secondary" className={`gap-1 ${config.className}`}>
              <Icon className="h-3 w-3" />
              {config.label}
            </Badge>
          );
        }

        // Fallback se não houver status
        return <span className="text-muted-foreground text-sm">-</span>;
      },
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
