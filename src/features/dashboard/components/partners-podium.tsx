"use client";

import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import type { TopPartner } from "../actions/get-top-partners";

interface PartnerWithRankAndStyle extends TopPartner {
  rank: number;
  color: string;
  height: string;
  initials: string;
}

interface PartnersPodiumProps {
  partners: TopPartner[];
}

function getInitials(name: string): string {
  const names = name.split(" ");
  if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
  return (names[0][0] + names[names.length - 1][0]).toUpperCase();
}

function getPodiumConfig(rank: number) {
  switch (rank) {
    case 1:
      return { color: "bg-yellow-400", height: "h-40" };
    case 2:
      return { color: "bg-slate-300", height: "h-32" };
    case 3:
      return { color: "bg-amber-600", height: "h-24" };
    default:
      return { color: "bg-gray-300", height: "h-20" };
  }
}

export const PartnersPodium = ({ partners }: PartnersPodiumProps) => {
  // Reordenar para exibir: 2º, 1º, 3º (pódio visual)
  const partnersWithStyle: PartnerWithRankAndStyle[] = partners.map(
    (partner, index) => {
      const rank = index + 1;
      const config = getPodiumConfig(rank);
      return {
        ...partner,
        rank,
        ...config,
        initials: getInitials(partner.name),
      };
    },
  );

  // Reordenar para visualização: 2º, 1º, 3º
  const displayOrder =
    partnersWithStyle.length === 3
      ? [partnersWithStyle[1], partnersWithStyle[0], partnersWithStyle[2]]
      : partnersWithStyle;

  if (partners.length === 0) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Top Parceiros</CardTitle>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Nenhum envio pago registrado ainda.
          </p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Top Parceiros</CardTitle>
      </CardHeader>
      <CardContent className="flex h-64 items-end justify-center gap-4 pb-6">
        {displayOrder.map((partner) => (
          <div
            key={partner.id}
            className="flex flex-col items-center justify-end gap-2"
          >
            <div className="flex flex-col items-center gap-1">
              <div className="relative">
                <Avatar className="h-12 w-12 border-2 border-background shadow-sm hover:scale-110 transition-transform duration-300">
                  <AvatarImage
                    src={partner.image || undefined}
                    alt={partner.name}
                  />
                  <AvatarFallback>{partner.initials}</AvatarFallback>
                </Avatar>
                {partner.rank === 1 && (
                  <div className="absolute -top-3 -right-2 rotate-12">
                    <Trophy className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                  </div>
                )}
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold whitespace-nowrap w-20 truncate text-center">
                  {partner.name.split(" ")[0]}
                </p>
                <p className="text-xs text-muted-foreground">
                  {partner.totalSubmissions} envios
                </p>
              </div>
            </div>

            <div
              className={cn(
                "w-20 rounded-t-lg flex items-end justify-center pb-2 shadow-sm transition-all duration-500 ease-in-out hover:opacity-90",
                partner.color,
                partner.height,
              )}
            >
              <span className="text-2xl font-bold text-white drop-shadow-md">
                {partner.rank}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
