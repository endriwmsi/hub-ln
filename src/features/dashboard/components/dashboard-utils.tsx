"use client";

import { AnnouncementsCard } from "../../announcements/components/announcements-card";
import type { TopPartner } from "../actions/get-top-partners";
import { PartnersPodium } from "./partners-podium";

interface DashboardUtilsProps {
  topPartners: TopPartner[];
}

export const DashboardUtils = ({ topPartners }: DashboardUtilsProps) => {
  return (
    <div className="flex flex-col space-y-4">
      <AnnouncementsCard />

      <PartnersPodium partners={topPartners} />
    </div>
  );
};
