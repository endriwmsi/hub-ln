"use client";

import { Network, UserCheck, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import type { ReferralStats } from "../types";

interface ReferralStatsCardProps {
  stats: ReferralStats;
}

export function ReferralStatsCard({ stats }: ReferralStatsCardProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Indicações Diretas
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.directReferrals}</div>
          <p className="text-xs text-muted-foreground">
            Usuários que você indicou
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Indicações Indiretas
          </CardTitle>
          <Network className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.indirectReferrals}</div>
          <p className="text-xs text-muted-foreground">
            Indicados pelos seus indicados
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Aprovados</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.approvedReferrals}</div>
          <p className="text-xs text-muted-foreground">
            Usuários ativos na rede
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
