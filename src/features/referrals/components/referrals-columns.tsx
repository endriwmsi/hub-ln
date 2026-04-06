"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Badge } from "@/shared/components/ui/badge";
import { Checkbox } from "@/shared/components/ui/checkbox";

export type ReferralRow = {
  id: string;
  name: string;
  email: string;
  referralCode: string | null;
  referredBy: string | null;
  createdAt: Date;
  approved: boolean;
  childrenCount: number;
  prices: Record<string, string>;
};

export const getColumns = (
  services: { id: string; title: string }[],
): ColumnDef<ReferralRow>[] => {
  const baseColumns: ColumnDef<ReferralRow>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Selecionar tudo da página"
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
      header: "Nome",
      cell: ({ row }) => {
        const name = row.getValue("name") as string;
        const approved = row.original.approved;

        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-medium whitespace-nowrap">{name}</span>
              {!approved && (
                <Badge variant="secondary" className="text-[10px] h-5">Pendente</Badge>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "E-mail",
    },
    {
      accessorKey: "createdAt",
      header: "Data de Cadastro",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as Date;
        return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
      },
    },
    {
      accessorKey: "childrenCount",
      header: "Indicados Diretos",
      cell: ({ row }) => {
        const count = row.getValue("childrenCount") as number;
        return <span className="font-medium text-muted-foreground">{count}</span>;
      },
    },
  ];

  const serviceColumns: ColumnDef<ReferralRow>[] = services.map((service) => ({
    id: `price_${service.id}`,
    header: service.title,
    cell: ({ row }) => {
      const price = row.original.prices?.[service.id];
      const numPrice = Number(price || 0);
      return (
        <span className="font-semibold text-primary">
          R$ {numPrice.toFixed(2).replace(".", ",")}
        </span>
      );
    },
  }));

  return [...baseColumns, ...serviceColumns];
};
