"use client";

import { type Icon, IconSettings } from "@tabler/icons-react";
import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar";
import { SidebarItemGlow } from "./sidebar-item-glow";

const hoverVariants: Variants = {
  hover: {
    x: 4,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  initial: {
    x: 0,
  },
};

type SecondaryNavItem = {
  title: string;
  url: string;
  icon: Icon;
};

const NavSecondaryItems: SecondaryNavItem[] = [
  {
    title: "Configurações",
    url: "/configuracoes",
    icon: IconSettings,
  },
];

export function NavSecondary({
  ...props
}: React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const isActive = (url: string) => pathname.startsWith(url);

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {NavSecondaryItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <motion.div
                variants={hoverVariants}
                initial="initial"
                whileHover="hover"
              >
                <SidebarMenuButton asChild isActive={isActive(item.url)}>
                  <Link
                    href={item.url}
                    onMouseEnter={() => setHoveredItem(item.title)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={cn(
                      "relative overflow-hidden w-full flex items-center gap-2 px-2 py-1.5 text-sm font-medium rounded-md transition-all",
                      isActive(item.url)
                        ? "text-sidebar-foreground bg-sidebar-accent shadow-sm border border-sidebar-border"
                        : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50 border border-transparent",
                    )}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                    <SidebarItemGlow
                      visible={hoveredItem === item.title || isActive(item.url)}
                    />
                  </Link>
                </SidebarMenuButton>
              </motion.div>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
