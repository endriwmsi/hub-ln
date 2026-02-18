"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllUsersForAdmin, getReferralTree } from "../actions";

export function useReferralTree(userId?: string) {
  return useQuery({
    queryKey: ["referral-tree", userId],
    queryFn: () => getReferralTree(userId),
    refetchOnWindowFocus: false,
  });
}

export function useAllUsers() {
  return useQuery({
    queryKey: ["all-users-admin"],
    queryFn: () => getAllUsersForAdmin(),
    refetchOnWindowFocus: false,
  });
}
