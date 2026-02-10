"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  Eye,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import type { Acao } from "@/core/db/schema";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import type { AcaoFilters } from "../schemas";
import { ToggleCell } from "./toggle-cell";

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

type StatusSummary = {
  aguardando: number;
  iniciadas: number;
  completas: number;
};

function getStatusSummary(acao: Acao): StatusSummary {
  const statuses = [
    acao.statusSpc,
    acao.statusBoaVista,
    acao.statusSerasa,
    acao.statusCenprotNacional,
    acao.statusCenprotSp,
    acao.statusOutros,
  ];

  return {
    aguardando: statuses.filter((s) => s === "aguardando_baixas").length,
    iniciadas: statuses.filter((s) => s === "baixas_iniciadas").length,
    completas: statuses.filter((s) => s === "baixas_completas").length,
  };
}

function StatusSummaryBadges({ acao }: { acao: Acao }) {
  const summary = getStatusSummary(acao);

  return (
    <div className="flex gap-1.5 flex-wrap">
      {summary.completas > 0 && (
        <Badge variant="default" className="text-xs bg-green-600">
          {summary.completas} ✓
        </Badge>
      )}
      {summary.iniciadas > 0 && (
        <Badge variant="secondary" className="text-xs">
          {summary.iniciadas} ⏳
        </Badge>
      )}
      {summary.aguardando > 0 && (
        <Badge variant="outline" className="text-xs">
          {summary.aguardando} ⏸
        </Badge>
      )}
    </div>
  );
}

type ColumnsProps = {
  filters: AcaoFilters;
  updateFilters: (newFilters: Partial<AcaoFilters>) => void;
  onEdit: (acao: Acao) => void;
  onDelete: (acao: Acao) => void;
  expandedRows: Set<string>;
  toggleRow: (id: string) => void;
};

export const createColumns = ({
  filters,
  updateFilters,
  onEdit,
  onDelete,
  expandedRows,
  toggleRow,
}: ColumnsProps): ColumnDef<Acao>[] => [
  {
    id: "expander",
    header: () => <div className="w-8" />,
    cell: ({ row }) => {
      const isExpanded = expandedRows.has(row.original.id);
      return (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => toggleRow(row.original.id)}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
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
    header: () => {
      const isActive = filters.sortBy === "nome";
      const isAsc = filters.sortOrder === "asc";

      return (
        <div className="text-left">
          <Button
            variant="ghost"
            onClick={() => {
              updateFilters({
                sortBy: "nome",
                sortOrder: isActive && isAsc ? "desc" : "asc",
              });
            }}
          >
            Nome
            <ArrowUpDown
              className={`ml-2 h-4 w-4 ${isActive ? "text-primary" : ""}`}
            />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="font-medium text-left max-w-[200px] truncate">
          {row.getValue("nome")}
        </div>
      );
    },
  },
  {
    accessorKey: "dataInicio",
    header: () => {
      const isActive = filters.sortBy === "dataInicio";
      const isAsc = filters.sortOrder === "asc";

      return (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => {
              updateFilters({
                sortBy: "dataInicio",
                sortOrder: isActive && isAsc ? "desc" : "asc",
              });
            }}
          >
            Início
            <ArrowUpDown
              className={`ml-2 h-4 w-4 ${isActive ? "text-primary" : ""}`}
            />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="text-center text-sm">
        {formatDate(row.getValue("dataInicio"))}
      </div>
    ),
  },
  {
    accessorKey: "dataFim",
    header: () => {
      const isActive = filters.sortBy === "dataFim";
      const isAsc = filters.sortOrder === "asc";

      return (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => {
              updateFilters({
                sortBy: "dataFim",
                sortOrder: isActive && isAsc ? "desc" : "asc",
              });
            }}
          >
            Fim
            <ArrowUpDown
              className={`ml-2 h-4 w-4 ${isActive ? "text-primary" : ""}`}
            />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="text-center text-sm">
        {formatDate(row.getValue("dataFim"))}
      </div>
    ),
  },
  {
    id: "status",
    header: () => <div className="text-center">Status Geral</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <StatusSummaryBadges acao={row.original} />
      </div>
    ),
  },
  {
    accessorKey: "visivel",
    header: () => <div className="text-center">Visível</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <ToggleCell acao={row.original} field="visivel" />
      </div>
    ),
  },
  {
    accessorKey: "permiteEnvios",
    header: () => <div className="text-center">Envios</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <ToggleCell acao={row.original} field="permiteEnvios" />
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const acao = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/gerenciar-acoes/${acao.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                Ver Clientes
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(acao.id)}
            >
              Copiar ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(acao)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(acao)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
