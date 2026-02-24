"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, Hourglass, XCircle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/shared/components/ui/badge";
import { Checkbox } from "@/shared/components/ui/checkbox";
import type { Client, ClientStatus } from "../types";

const statusConfig: Record<
  ClientStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive";
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  aguardando: { label: "Aguardando", variant: "secondary", icon: Hourglass },
  baixas_completas: { label: "Completo", variant: "default", icon: Check },
  baixas_negadas: { label: "Negado", variant: "destructive", icon: XCircle },
};

export const columns: ColumnDef<Client>[] = [
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
        aria-label="Selecionar linha"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "nome",
    header: "Nome",
    cell: ({ row }) => (
      <div className="max-w-50 truncate font-medium">{row.original.nome}</div>
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
      const status = row.original.status;
      const config = statusConfig[status];
      const Icon = config.icon;
      return (
        <Badge variant={config.variant} className="gap-1.5">
          <Icon className="h-3.5 w-3.5" />
          {config.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "serviceTitle",
    header: "Serviço",
    cell: ({ row }) => (
      <div className="max-w-37.5 truncate">{row.original.serviceTitle}</div>
    ),
  },
  {
    accessorKey: "acaoNome",
    header: "Ação",
    cell: ({ row }) =>
      row.original.acaoNome ? (
        <div className="max-w-37.5 truncate">{row.original.acaoNome}</div>
      ) : (
        <span className="text-muted-foreground text-sm">-</span>
      ),
  },
  {
    accessorKey: "userName",
    header: "Usuário",
    cell: ({ row }) => (
      <div>
        <p className="max-w-37.5 truncate font-medium">
          {row.original.userName}
        </p>
        <p className="max-w-37.5 truncate text-xs text-muted-foreground">
          {row.original.userEmail}
        </p>
      </div>
    ),
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
          <Hourglass className="h-4 w-4" />
          <span className="text-sm font-medium">Pendente</span>
        </div>
      ),
  },
  {
    accessorKey: "createdAt",
    header: "Data de Envio",
    cell: ({ row }) =>
      format(new Date(row.original.createdAt), "dd/MM/yyyy HH:mm", {
        locale: ptBR,
      }),
  },
  {
    accessorKey: "processedAt",
    header: "Processado em",
    cell: ({ row }) =>
      row.original.processedAt ? (
        format(new Date(row.original.processedAt), "dd/MM/yyyy HH:mm", {
          locale: ptBR,
        })
      ) : (
        <span className="text-muted-foreground text-sm">-</span>
      ),
  },
  {
    accessorKey: "observacao",
    header: "Observação",
    cell: ({ row }) =>
      row.original.observacao ? (
        <div className="max-w-50 truncate text-sm">
          {row.original.observacao}
        </div>
      ) : (
        <span className="text-muted-foreground text-sm">-</span>
      ),
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => (
      <Link
        href={`/envios/${row.original.serviceRequestId}`}
        className="text-sm text-primary hover:underline"
      >
        Ver Envio
      </Link>
    ),
  },
];
