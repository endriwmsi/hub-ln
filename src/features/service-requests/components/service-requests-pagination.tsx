"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useServiceRequestFilters } from "../hooks/use-service-request-filters";

interface ServiceRequestsPaginationProps {
  totalPages: number;
  total: number;
}

export function ServiceRequestsPagination({
  totalPages,
  total,
}: ServiceRequestsPaginationProps) {
  const { filters, updateFilters } = useServiceRequestFilters();
  const { page, pageSize } = filters;

  const canPreviousPage = page > 1;
  const canNextPage = page < totalPages;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col items-center justify-between gap-4 px-2 py-4 sm:flex-row">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium">Linhas por página</p>
        <Select
          value={`${pageSize}`}
          onValueChange={(value) => {
            updateFilters({ pageSize: Number(value) });
          }}
        >
          <SelectTrigger className="h-8 w-17.5">
            <SelectValue placeholder={pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {[10, 20, 30, 50, 100].map((size) => (
              <SelectItem key={size} value={`${size}`}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 text-sm font-medium">
        {total > 0 ? (
          <span>
            Mostrando {from} a {to} de {total} resultado(s)
          </span>
        ) : (
          <span>Nenhum resultado</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={() => updateFilters({ page: 1 })}
          disabled={!canPreviousPage}
        >
          <span className="sr-only">Ir para primeira página</span>
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => updateFilters({ page: page - 1 })}
          disabled={!canPreviousPage}
        >
          <span className="sr-only">Ir para página anterior</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="text-sm font-medium">
          Página {page} de {totalPages || 1}
        </span>

        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => updateFilters({ page: page + 1 })}
          disabled={!canNextPage}
        >
          <span className="sr-only">Ir para próxima página</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={() => updateFilters({ page: totalPages })}
          disabled={!canNextPage}
        >
          <span className="sr-only">Ir para última página</span>
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
