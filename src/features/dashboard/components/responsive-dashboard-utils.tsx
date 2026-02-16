"use client";

import { PanelRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import type { TopPartner } from "../actions/get-top-partners";
import { DashboardUtils } from "./dashboard-utils";

interface ResponsiveDashboardUtilsProps {
  topPartners: TopPartner[];
}

export const ResponsiveDashboardUtils = ({
  topPartners,
}: ResponsiveDashboardUtilsProps) => {
  return (
    <>
      <div className="hidden lg:block">
        <DashboardUtils topPartners={topPartners} />
      </div>

      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-lg border-primary bg-background hover:bg-accent"
            >
              <PanelRight className="h-6 w-6 text-primary" />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md overflow-y-auto p-2">
            <SheetHeader className="mb-4">
              <SheetTitle>Utilidades do Dashboard</SheetTitle>
              <SheetDescription>
                Acesso rápido a comunicados e ranking de parceiros.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-4">
              <DashboardUtils topPartners={topPartners} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};
