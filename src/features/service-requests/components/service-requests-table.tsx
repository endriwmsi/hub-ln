"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, Eye, MoreHorizontal, X } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/shared";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { type ServiceRequestStatus } from "../schemas";

type ServiceRequestTableItem = {
  id: string;
  quantity: number;
  totalPrice: string;
  status: ServiceRequestStatus;
  paid: boolean;
  paidAt: Date | null;
  createdAt: Date;
  service: {
    id: string;
    title: string;
    slug: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
  acao?: {
    id: string;
    nome: string;
  } | null;
};

type ServiceRequestsTableProps = {
  requests: ServiceRequestTableItem[];
  showUser?: boolean;
  showCheckbox?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
};

export function ServiceRequestsTable({
  requests,
  showUser = false,
  showCheckbox = false,
  selectedIds = [],
  onSelectionChange,
}: ServiceRequestsTableProps) {
  // Apenas envios não pagos podem ser selecionados
  const selectableRequests = requests.filter((r) => !r.paid);
  const allSelectableSelected =
    selectableRequests.length > 0 &&
    selectableRequests.every((r) => selectedIds.includes(r.id));
  const someSelected = selectedIds.length > 0 && !allSelectableSelected;

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange(selectableRequests.map((r) => r.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    }
  };

  const columnCount = 7 + (showUser ? 1 : 0) + (showCheckbox ? 1 : 0);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {showCheckbox && (
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelectableSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Selecionar todos"
                  disabled={selectableRequests.length === 0}
                  className={
                    someSelected ? "data-[state=checked]:bg-primary" : ""
                  }
                />
              </TableHead>
            )}
            <TableHead>Serviço</TableHead>
            <TableHead>Ação</TableHead>
            {showUser && <TableHead>Usuário</TableHead>}
            <TableHead>Quantidade</TableHead>
            <TableHead>Valor Total</TableHead>
            {/* <TableHead>Status</TableHead> */}
            <TableHead>Pagamento</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="w-17.5">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columnCount}
                className="h-24 text-center text-muted-foreground"
              >
                Nenhuma solicitação encontrada
              </TableCell>
            </TableRow>
          ) : (
            requests.map((request) => (
              <TableRow
                key={request.id}
                className={
                  selectedIds.includes(request.id)
                    ? "bg-primary/5"
                    : request.paid
                      ? "bg-green-50/50 dark:bg-green-950/20"
                      : ""
                }
              >
                {showCheckbox && (
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(request.id)}
                      onCheckedChange={(checked) =>
                        handleSelectOne(request.id, !!checked)
                      }
                      disabled={request.paid}
                      aria-label={`Selecionar ${request.service.title}`}
                    />
                  </TableCell>
                )}
                <TableCell className="font-medium">
                  {request.service.title}
                </TableCell>
                <TableCell>
                  {request.acao?.nome || (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
                {showUser && (
                  <TableCell>
                    <div>
                      <p className="font-medium">{request.user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {request.user.email}
                      </p>
                    </div>
                  </TableCell>
                )}
                <TableCell>{request.quantity}</TableCell>
                <TableCell>{formatCurrency(request.totalPrice)}</TableCell>
                {/* <TableCell>
                  <Badge
                    className={serviceRequestStatusColors[request.status]}
                    variant="secondary"
                  >
                    {serviceRequestStatusLabels[request.status]}
                  </Badge>
                </TableCell> */}
                <TableCell>
                  {request.paid ? (
                    <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                      <Check className="h-4 w-4" />
                      <span className="text-sm font-medium">Pago</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                      <X className="h-4 w-4" />
                      <span className="text-sm">Pendente</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {format(new Date(request.createdAt), "dd/MM/yyyy HH:mm", {
                    locale: ptBR,
                  })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Abrir menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/envios/${request.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalhes
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
