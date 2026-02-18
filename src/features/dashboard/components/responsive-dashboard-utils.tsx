"use client";

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
            <button
              type="button"
              className="fixed right-0 top-3/4 -translate-y-1/2 z-50 h-32 w-8 rounded-l-4xl shadow-lg border border-r-0 border-primary/10 bg-primary/10 hover:bg-accent hover:w-10 transition-all duration-200 flex flex-col items-center justify-center gap-2 group"
            >
              <span className="text-xs font-semibold text-primary whitespace-nowrap -rotate-90">
                VER MAIS
              </span>

              {/* <PanelRight className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" /> */}
            </button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md overflow-y-auto p-2 items-center">
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
