"use client";

import { useQuery } from "@tanstack/react-query";
import { getAnnouncements } from "../actions";

export function useAnnouncements() {
  return useQuery({
    queryKey: ["announcements"],
    queryFn: () => getAnnouncements(),
  });
}
