"use client";

import {
  type Icon,
  IconAlertCircle,
  IconImageInPicture,
  IconPackage,
  IconTicket,
  IconUsers,
} from "@tabler/icons-react";
import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar";
import { SidebarItemGlow } from "./sidebar-item-glow";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.4,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 15,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

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

type AdminNavItem = {
  name: string;
  url: string;
  icon: Icon;
};

const AdminItems: AdminNavItem[] = [
  {
    name: "Gerenciar Ações",
    url: "/gerenciar-acoes",
    icon: IconTicket,
  },
  {
    name: "Gerenciar Usuários",
    url: "/gerenciar-usuarios",
    icon: IconUsers,
  },
  {
    name: "Gerenciar Avisos",
    url: "/gerenciar-avisos",
    icon: IconAlertCircle,
  },
  {
    name: "Gerenciar Serviços",
    url: "/gerenciar-servicos",
    icon: IconPackage,
  },
  {
    name: "Gerenciar Criativos",
    url: "/gerenciar-criativos",
    icon: IconImageInPicture,
  },
  {
    name: "Gerenciar Clientes",
    url: "/gerenciar-clientes",
    icon: IconUsers,
  },
  {
    name: "Gerenciar Cupons",
    url: "/gerenciar-cupons",
    icon: IconTicket,
  },
];

const NavAdmin = () => {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // const [openItems, setOpenItems] = useState<string[]>([]);

  // const toggleItem = (title: string) => {
  //   setOpenItems((prev) =>
  //     prev.includes(title)
  //       ? prev.filter((item) => item !== title)
  //       : [...prev, title],
  //   );
  // };

  const isActive = (url: string) => {
    return pathname === url || pathname.startsWith(`${url}/`);
  };

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupContent className="flex flex-col gap-2">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarMenu>
            {AdminItems.map((item, index) => (
              <motion.div
                key={item.name}
                variants={itemVariants}
                custom={index}
              >
                <SidebarMenuItem>
                  <motion.div
                    variants={hoverVariants}
                    initial="initial"
                    whileHover="hover"
                  >
                    <SidebarMenuButton
                      asChild
                      tooltip={item.name}
                      isActive={isActive(item.url)}
                    >
                      <Link
                        href={item.url}
                        onMouseEnter={() => setHoveredItem(item.name)}
                        onMouseLeave={() => setHoveredItem(null)}
                        className={cn(
                          "relative overflow-hidden w-full flex items-center gap-2 px-2 py-1.5 text-sm font-medium rounded-md transition-all",
                          isActive(item.url)
                            ? "text-sidebar-foreground bg-sidebar-accent shadow-sm border border-sidebar-border"
                            : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50 border border-transparent",
                        )}
                      >
                        <item.icon />
                        <span>{item.name}</span>
                        <SidebarItemGlow
                          visible={
                            hoveredItem === item.name || isActive(item.url)
                          }
                        />
                      </Link>
                    </SidebarMenuButton>
                  </motion.div>
                </SidebarMenuItem>
              </motion.div>
            ))}
          </SidebarMenu>
        </motion.div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default NavAdmin;
