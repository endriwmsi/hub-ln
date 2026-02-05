/** biome-ignore-all lint/suspicious/noArrayIndexKey: Its a skeleton component */
import { Skeleton } from "@/shared/components/ui/skeleton";

export function DataTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Filters skeleton */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <Skeleton className="h-10 w-full md:max-w-64" />
        <Skeleton className="h-10 w-full md:w-40" />
        <Skeleton className="h-10 w-full md:w-40" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-md border">
        <div className="border-b">
          <div className="flex h-12 items-center gap-4 px-4">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={`skeleton-row-${i}`}
            className="flex h-14 items-center gap-4 border-b px-4 last:border-b-0"
          >
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-8" />
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between px-2 py-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}
