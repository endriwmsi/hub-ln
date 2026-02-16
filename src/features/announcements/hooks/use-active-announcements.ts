"use client";

import { useQuery } from "@tanstack/react-query";
import { getActiveAnnouncements } from "../actions";

export function useActiveAnnouncements() {
  return useQuery({
    queryKey: ["announcements", "active"],
    queryFn: () => getActiveAnnouncements(),
  });
}
