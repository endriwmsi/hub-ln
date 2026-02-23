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
import { useClientFilters } from "../hooks";

type DataTablePaginationProps = {
  totalPages: number;
  total: number;
};

export function DataTablePagination({
  totalPages,
  total,
}: DataTablePaginationProps) {
  const { filters, updateFilters } = useClientFilters();
  const { page, pageSize } = filters;

  const canPreviousPage = page > 1;
  const canNextPage = page < totalPages;

  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
      <div className="text-sm text-muted-foreground">
        Mostrando {startIndex} - {endIndex} de {total} cliente(s)
      </div>

      <div className="flex items-center gap-6">
        {/* Page Size Selector */}
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">Linhas por página</p>
          <Select
            value={String(pageSize)}
            onValueChange={(value) =>
              updateFilters({ pageSize: Number(value), page: 1 })
            }
          >
            <SelectTrigger className="h-8 w-17.5">
              <SelectValue placeholder={String(pageSize)} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 40, 50, 100].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => updateFilters({ page: 1 })}
            disabled={!canPreviousPage}
          >
            <ChevronsLeft className="h-4 w-4" />
            <span className="sr-only">Primeira página</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => updateFilters({ page: page - 1 })}
            disabled={!canPreviousPage}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Página anterior</span>
          </Button>

          <div className="flex items-center gap-1 text-sm">
            <span className="font-medium">{page}</span>
            <span className="text-muted-foreground">de {totalPages}</span>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => updateFilters({ page: page + 1 })}
            disabled={!canNextPage}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Próxima página</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => updateFilters({ page: totalPages })}
            disabled={!canNextPage}
          >
            <ChevronsRight className="h-4 w-4" />
            <span className="sr-only">Última página</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
