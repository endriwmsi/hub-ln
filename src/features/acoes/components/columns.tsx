"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { Acao } from "@/core/db/schema";
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
import { StatusCell } from "./status-cell";
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

type ColumnsProps = {
  filters: AcaoFilters;
  updateFilters: (newFilters: Partial<AcaoFilters>) => void;
  onEdit: (acao: Acao) => void;
  onDelete: (acao: Acao) => void;
};

export const createColumns = ({
  filters,
  updateFilters,
  onEdit,
  onDelete,
}: ColumnsProps): ColumnDef<Acao>[] => [
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
        <div className="font-medium text-left max-w-50 truncate">
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
      <div className="text-center">
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
      <div className="text-center">{formatDate(row.getValue("dataFim"))}</div>
    ),
  },
  {
    accessorKey: "statusSpc",
    header: () => <div className="text-center">SPC</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <StatusCell acao={row.original} field="statusSpc" />
      </div>
    ),
  },
  {
    accessorKey: "statusBoaVista",
    header: () => <div className="text-center">Boa Vista</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <StatusCell acao={row.original} field="statusBoaVista" />
      </div>
    ),
  },
  {
    accessorKey: "statusSerasa",
    header: () => <div className="text-center">Serasa</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <StatusCell acao={row.original} field="statusSerasa" />
      </div>
    ),
  },
  {
    accessorKey: "statusCenprotNacional",
    header: () => <div className="text-center">Cenprot Nacional</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <StatusCell acao={row.original} field="statusCenprotNacional" />
      </div>
    ),
  },
  {
    accessorKey: "statusCenprotSp",
    header: () => <div className="text-center">Cenprot SP</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <StatusCell acao={row.original} field="statusCenprotSp" />
      </div>
    ),
  },
  {
    accessorKey: "statusOutros",
    header: () => <div className="text-center">Outros</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <StatusCell acao={row.original} field="statusOutros" />
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
