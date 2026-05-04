"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useUserFilters } from "../hooks/use-user-filters";

interface DataTablePaginationProps {
  totalPages: number;
  total: number;
}

const GRID_PAGE_SIZES = [12, 18, 24, 36];
const LIST_PAGE_SIZES = [10, 25, 50, 100];

function getVisiblePages(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [];

  const start = Math.max(1, Math.min(current - 1, total - 3));
  const end = Math.min(total, Math.max(current + 1, 4));

  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push("ellipsis");
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < total) {
    if (end < total - 1) pages.push("ellipsis");
    pages.push(total);
  }

  return pages;
}

export function DataTablePagination({
  totalPages,
  total,
}: DataTablePaginationProps) {
  const { filters, viewMode, updateFilters } = useUserFilters();
  const { page, pageSize } = filters;

  const canPreviousPage = page > 1;
  const canNextPage = page < totalPages;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const pageSizeOptions =
    viewMode === "grid" ? GRID_PAGE_SIZES : LIST_PAGE_SIZES;
  const pageSizeLabel =
    viewMode === "grid" ? "Itens por página" : "Linhas por página";

  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <div className="flex flex-col items-center justify-between gap-4 px-2 py-4 sm:flex-row">
      <div className="flex items-center gap-6 lg:gap-8">
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => updateFilters({ page: page - 1 })}
            disabled={!canPreviousPage}
          >
            <span className="sr-only">Página anterior</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {visiblePages.map((p, i) =>
            p === "ellipsis" ? (
              <Button
                variant="secondary"
                key={`ellipsis-${
                  // biome-ignore lint/suspicious/noArrayIndexKey: Não importa agora...
                  i
                }`}
                className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground"
              >
                …
              </Button>
            ) : (
              <Button
                key={p}
                variant={p === page ? "default" : "outline"}
                className="h-8 w-8 p-0"
                onClick={() => updateFilters({ page: p })}
              >
                {p}
              </Button>
            ),
          )}

          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => updateFilters({ page: page + 1 })}
            disabled={!canNextPage}
          >
            <span className="sr-only">Próxima página</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center justify-center text-sm font-medium">
          Mostrando {from} - {to} de {total}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <p className="text-sm font-medium">{pageSizeLabel}</p>
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
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={`${size}`}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
