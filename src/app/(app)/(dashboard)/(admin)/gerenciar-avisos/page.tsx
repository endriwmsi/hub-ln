"use client";

import { AnnouncementsTable, useAnnouncements } from "@/features/announcements";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function GerenciarAvisosPage() {
  const { data: announcements, isLoading } = useAnnouncements();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <AnnouncementsTable announcements={announcements || []} />
    </div>
  );
}
