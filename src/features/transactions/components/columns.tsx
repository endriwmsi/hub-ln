"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/shared";
import { Badge } from "@/shared/components/ui/badge";
import type { Transaction, TransactionStatus } from "../types";
import {
  transactionStatusColors,
  transactionStatusLabels,
  transactionTypeColors,
  transactionTypeLabels,
} from "../types";

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => {
      const type = row.getValue("type") as Transaction["type"];
      return (
        <Badge className={transactionTypeColors[type]} variant="secondary">
          {transactionTypeLabels[type]}
        </Badge>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Descrição",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("description")}</span>
    ),
  },
  {
    accessorKey: "amount",
    header: "Valor",
    cell: ({ row }) => {
      const amount = row.getValue("amount") as string;
      const isNegative = amount.startsWith("-");
      return (
        <span
          className={
            isNegative
              ? "text-red-600 dark:text-red-400"
              : "text-green-600 dark:text-green-400"
          }
        >
          {formatCurrency(amount.replace("-", ""))}
          {isNegative && " (saída)"}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as TransactionStatus;
      return (
        <Badge
          className={transactionStatusColors[status] || ""}
          variant="secondary"
        >
          {transactionStatusLabels[status] || status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Data",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return format(new Date(date), "dd/MM/yyyy HH:mm", {
        locale: ptBR,
      });
    },
  },
];
