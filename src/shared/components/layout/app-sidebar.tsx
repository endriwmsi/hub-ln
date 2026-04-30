"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import type * as React from "react";
import { authClient } from "@/core";
import { NotificationsDropdown } from "@/features/notifications";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/shared/components/ui/sidebar";
import { Logo } from "./logo";
import NavAdmin from "./nav-admin";
import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";

const headerVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const footerVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
      delay: 0.6,
    },
  },
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = authClient.useSession();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="gap-0 p-0">
        <motion.div
          variants={headerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex h-12 items-center gap-2 px-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            <Link
              href="/dashboard"
              className="flex min-w-0 items-center gap-2.5"
            >
              <Logo variant="compact" className="h-5 w-auto shrink-0" />
              <span className="truncate text-sm font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
                HUB-LN
              </span>
            </Link>
            <div className="ml-auto group-data-[collapsible=icon]:hidden">
              <NotificationsDropdown />
            </div>
          </div>
        </motion.div>
      </SidebarHeader>

      <SidebarContent className="justify-between">
        <NavMain />
        {session?.user.role === "admin" && <NavAdmin />}
        <NavSecondary className="" />
      </SidebarContent>

      <SidebarFooter className="">
        <motion.div
          variants={footerVariants}
          initial="hidden"
          animate="visible"
        >
          <NavUser />
        </motion.div>
      </SidebarFooter>
    </Sidebar>
  );
}
