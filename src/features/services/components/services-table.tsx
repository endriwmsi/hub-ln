"use client";

import { FileText, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { Service } from "@/core/db/schema";
import { formatCurrency } from "@/shared";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { DeleteServiceDialog } from "./delete-service-dialog";
import { ServiceFormDialog } from "./service-form-dialog";

type ServicesTableProps = {
  services: Service[];
};

export function ServicesTable({ services }: ServicesTableProps) {
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingService, setDeletingService] = useState<Service | null>(null);

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Valor Base</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-17.5">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  Nenhum serviço cadastrado
                </TableCell>
              </TableRow>
            ) : (
              services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.title}</TableCell>
                  <TableCell className="max-w-75 truncate">
                    {service.description || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={service.type === "form" ? "default" : "outline"}
                    >
                      {service.type === "form" ? "Formulário" : "Simples"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(service.basePrice)}</TableCell>
                  <TableCell>
                    <Badge variant={service.isActive ? "default" : "secondary"}>
                      {service.isActive ? "Ativo" : "Inativo"}
                    </Badge>
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
                          <Link href={`/gerenciar-servicos/${service.id}`}>
                            <FileText className="mr-2 h-4 w-4" />
                            Configurar Formulário
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setEditingService(service)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeletingService(service)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
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

      <ServiceFormDialog
        open={!!editingService}
        onOpenChange={(open) => !open && setEditingService(null)}
        service={editingService}
      />

      <DeleteServiceDialog
        open={!!deletingService}
        onOpenChange={(open) => !open && setDeletingService(null)}
        serviceId={deletingService?.id ?? null}
        serviceName={deletingService?.title ?? ""}
      />
    </>
  );
}
