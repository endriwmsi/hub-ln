/** biome-ignore-all lint/suspicious/noArrayIndexKey: It is safe to use array index as key here because the skeleton rows and columns are static and do not change order */
"use client";

import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

interface DataTableSkeletonProps {
  columnCount?: number;
  rowCount?: number;
}

export function DataTableSkeleton({
  columnCount = 11,
  rowCount = 10,
}: DataTableSkeletonProps) {
  return (
    <div className="space-y-4">
      {/* Filtros Skeleton */}
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-full max-w-2xl" />
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <Skeleton className="h-10 w-full md:w-45" />
          <Skeleton className="h-10 w-full md:w-45" />
          <Skeleton className="h-10 w-full md:w-45" />
          <Skeleton className="h-10 w-full md:w-40" />
        </div>
      </div>

      {/* Tabela Skeleton */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: columnCount }).map((_, i) => (
                <TableHead key={`header-${i}`}>
                  <Skeleton className="h-8 w-full" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rowCount }).map((_, i) => (
              <TableRow key={`row-${i}`}>
                {Array.from({ length: columnCount }).map((_, j) => (
                  <TableCell key={`cell-${i}-${j}`}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginação Skeleton */}
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <Skeleton className="h-4 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
    </div>
  );
}
