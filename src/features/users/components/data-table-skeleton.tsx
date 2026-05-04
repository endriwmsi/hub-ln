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
import type { ViewMode } from "../schemas";

interface DataTableSkeletonProps {
  columnCount?: number;
  rowCount?: number;
  viewMode?: ViewMode;
}

function GridSkeleton({ count = 18 }: { count?: number }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
          <Skeleton className="h-10 w-full md:max-w-sm" />
          <Skeleton className="h-10 w-full md:w-45" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={`card-skeleton-${i}`}
            className="flex flex-col items-center rounded-xl border bg-card p-5 space-y-3"
          >
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
            <div className="flex gap-1.5">
              <Skeleton className="h-4 w-12 rounded-full" />
              <Skeleton className="h-4 w-12 rounded-full" />
              <Skeleton className="h-4 w-14 rounded-full" />
            </div>
            <div className="flex items-center justify-between w-full pt-3 border-t">
              <Skeleton className="h-4 w-14 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center justify-between gap-4 px-2 py-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-17.5" />
        </div>
        <div className="flex items-center gap-6 lg:gap-8">
          <Skeleton className="h-6 w-32" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DataTableSkeleton({
  columnCount = 8,
  rowCount = 10,
  viewMode = "grid",
}: DataTableSkeletonProps) {
  if (viewMode === "grid") {
    return <GridSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
          <Skeleton className="h-10 w-full md:max-w-sm" />
          <Skeleton className="h-10 w-full md:w-45" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

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

      <div className="flex flex-col items-center justify-between gap-4 px-2 py-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-17.5" />
        </div>
        <div className="flex items-center gap-6 lg:gap-8">
          <Skeleton className="h-6 w-32" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </div>
    </div>
  );
}

