"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getAllUsersForAdmin,
  getPaginatedReferrals,
  getReferralTree,
} from "../actions";

export * from "./use-referral-filters";

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

import type { PaginatedReferralsFilter } from "../actions/get-paginated-referrals";

export function usePaginatedReferrals(filters: PaginatedReferralsFilter) {
  return useQuery({
    queryKey: ["paginated-referrals", filters],
    queryFn: () => getPaginatedReferrals(filters),
  });
}
