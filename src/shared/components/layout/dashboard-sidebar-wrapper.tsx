"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/shared/components/layout/app-sidebar";

export function DashboardSidebarWrapper() {
  const pathname = usePathname();
  const isSettings = pathname.startsWith("/configuracoes");

  return <AppSidebar variant={isSettings ? "sidebar" : "inset"} />;
}
