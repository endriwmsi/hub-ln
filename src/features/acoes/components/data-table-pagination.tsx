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
import { useAcaoFilters } from "../hooks/use-acao-filters";

interface DataTablePaginationProps {
  totalPages: number;
  total: number;
}

export function DataTablePagination({
  totalPages,
  total,
}: DataTablePaginationProps) {
  const { filters, updateFilters } = useAcaoFilters();
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
            {[10, 25, 50, 100].map((size) => (
              <SelectItem key={size} value={`${size}`}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-6 lg:gap-8">
        <div className="flex items-center justify-center text-sm font-medium">
          {total > 0
            ? `Mostrando ${from} - ${to} de ${total}`
            : "Nenhum resultado"}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => updateFilters({ page: 1 })}
            disabled={!canPreviousPage}
          >
            <span className="sr-only">Primeira página</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => updateFilters({ page: page - 1 })}
            disabled={!canPreviousPage}
          >
            <span className="sr-only">Página anterior</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium">
              Página {page} de {totalPages || 1}
            </span>
          </div>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => updateFilters({ page: page + 1 })}
            disabled={!canNextPage}
          >
            <span className="sr-only">Próxima página</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => updateFilters({ page: totalPages })}
            disabled={!canNextPage}
          >
            <span className="sr-only">Última página</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
