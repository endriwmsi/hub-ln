"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import type { User } from "@/core/db/schema";
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
import type { UserFilters } from "../schemas";
import { ApprovalCell } from "./approval-cell";

function formatDate(date: Date | null | undefined): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

function formatPhone(phone: string | null | undefined): string {
  if (!phone) return "-";
  return phone;
}

type ColumnsProps = {
  filters: UserFilters;
  updateFilters: (newFilters: Partial<UserFilters>) => void;
};

export const createColumns = ({
  filters,
  updateFilters,
}: ColumnsProps): ColumnDef<User>[] => [
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
    accessorKey: "name",
    header: () => {
      const isActive = filters.sortBy === "name";
      const isAsc = filters.sortOrder === "asc";

      return (
        <div className="text-left">
          <Button
            variant="ghost"
            onClick={() => {
              updateFilters({
                sortBy: "name",
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
        <div className="font-medium text-left">{row.getValue("name")}</div>
      );
    },
  },
  {
    accessorKey: "email",
    header: () => {
      const isActive = filters.sortBy === "email";
      const isAsc = filters.sortOrder === "asc";

      return (
        <div className="text-left">
          <Button
            variant="ghost"
            onClick={() => {
              updateFilters({
                sortBy: "email",
                sortOrder: isActive && isAsc ? "desc" : "asc",
              });
            }}
          >
            Email
            <ArrowUpDown
              className={`ml-2 h-4 w-4 ${isActive ? "text-primary" : ""}`}
            />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      return <div className="lowercase text-left">{row.getValue("email")}</div>;
    },
  },
  {
    accessorKey: "phone",
    header: "Telefone",
    cell: ({ row }) => {
      return <div>{formatPhone(row.getValue("phone"))}</div>;
    },
  },
  {
    accessorKey: "role",
    header: () => <div className="text-center">Tipo</div>,
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <div className="text-center">
          <Badge variant={role === "admin" ? "default" : "secondary"}>
            {role === "admin" ? "Admin" : "Usuário"}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "emailVerified",
    header: () => <div className="text-center">Verificado</div>,
    cell: ({ row }) => {
      const verified = row.getValue("emailVerified") as boolean;
      return (
        <div className="text-center">
          <Badge variant={verified ? "default" : "destructive"}>
            {verified ? "Sim" : "Não"}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "approved",
    header: () => <div className="text-center">Aprovado</div>,
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          <ApprovalCell user={row.original} />
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: () => {
      const isActive = filters.sortBy === "createdAt";
      const isAsc = filters.sortOrder === "asc";

      return (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => {
              updateFilters({
                sortBy: "createdAt",
                sortOrder: isActive && isAsc ? "desc" : "asc",
              });
            }}
          >
            Data de Cadastro
            <ArrowUpDown
              className={`ml-2 h-4 w-4 ${isActive ? "text-primary" : ""}`}
            />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="text-center">
          {formatDate(row.getValue("createdAt"))}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

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
              onClick={() => navigator.clipboard.writeText(user.id)}
            >
              Copiar ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/usuarios/${user.id}`}>Ver detalhes</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
