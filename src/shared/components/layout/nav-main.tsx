"use client";

import {
  type Icon,
  IconChevronRight,
  IconCreditCard,
  IconImageInPicture,
  IconNetwork,
  IconPackage,
  IconPencil,
  IconSend,
  IconSmartHome,
} from "@tabler/icons-react";
import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/shared/components/ui/sidebar";
import { SidebarItemGlow } from "./sidebar-item-glow";

type NavItem = {
  title: string;
  url: string;
  icon?: Icon;
  items?: {
    title: string;
    url: string;
  }[];
};

const NavMainItems: NavItem[] = [
  {
    title: "Home",
    url: "/dashboard",
    icon: IconSmartHome,
  },
  {
    title: "Serviços",
    url: "/servicos",
    icon: IconPackage,
  },
  {
    title: "Envios",
    url: "/envios",
    icon: IconSend,
  },
  {
    title: "Financeiro",
    url: "/transacoes",
    icon: IconCreditCard,
  },
  {
    title: "Indicações",
    url: "/indicacoes",
    icon: IconNetwork,
  },
  {
    title: "Criativos",
    url: "/criativos",
    icon: IconImageInPicture,
  },
  {
    title: "Editor",
    url: "/editor",
    icon: IconPencil,
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    x: -20,
  },
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
    transition: {
      duration: 0.4,
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

export function NavMain() {
  const pathname = usePathname();
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [hoveredSubItem, setHoveredSubItem] = useState<string | null>(null);

  const toggleItem = (title: string) => {
    setOpenItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title],
    );
  };

  const isActive = (url: string) => {
    return pathname === url || pathname.startsWith(`${url}/`);
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/*<SidebarGroupLabel>Geral</SidebarGroupLabel>*/}
          <SidebarMenu>
            {NavMainItems.map((item, index) => (
              <motion.div
                key={item.title}
                variants={itemVariants}
                custom={index}
              >
                <SidebarMenuItem>
                  {item.items ? (
                    <Collapsible
                      open={openItems.includes(item.title)}
                      onOpenChange={() => toggleItem(item.title)}
                    >
                      <CollapsibleTrigger asChild>
                        <motion.div
                          variants={hoverVariants}
                          initial="initial"
                          whileHover="hover"
                          onHoverStart={() => setHoveredItem(item.title)}
                          onHoverEnd={() => setHoveredItem(null)}
                          className="relative overflow-hidden rounded-md"
                        >
                          <SidebarMenuButton
                            tooltip={item.title}
                            isActive={isActive(item.url)}
                          >
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                            <IconChevronRight
                              className={`ml-auto transition-transform ${openItems.includes(item.title) ? "rotate-90" : ""}`}
                            />
                          </SidebarMenuButton>
                          <SidebarItemGlow
                            visible={
                              hoveredItem === item.title || isActive(item.url)
                            }
                          />
                        </motion.div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem, subIndex) => (
                            <motion.div
                              key={subItem.title}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                duration: 0.3,
                                delay: subIndex * 0.1,
                                ease: "easeOut",
                              }}
                            >
                              <SidebarMenuSubItem>
                                <motion.div
                                  variants={hoverVariants}
                                  initial="initial"
                                  whileHover="hover"
                                >
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={isActive(subItem.url)}
                                  >
                                    <Link
                                      href={subItem.url}
                                      onMouseEnter={() =>
                                        setHoveredSubItem(subItem.title)
                                      }
                                      onMouseLeave={() =>
                                        setHoveredSubItem(null)
                                      }
                                      className={cn(
                                        "relative overflow-hidden w-full flex items-center gap-2 px-2 py-1.5 text-sm font-medium rounded-md transition-all",
                                        isActive(subItem.url)
                                          ? "text-sidebar-foreground bg-sidebar-accent shadow-sm border border-sidebar-border"
                                          : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50 border border-transparent",
                                      )}
                                    >
                                      <span>{subItem.title}</span>
                                      <SidebarItemGlow
                                        visible={
                                          hoveredSubItem === subItem.title ||
                                          isActive(subItem.url)
                                        }
                                      />
                                    </Link>
                                  </SidebarMenuSubButton>
                                </motion.div>
                              </SidebarMenuSubItem>
                            </motion.div>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <motion.div
                      variants={hoverVariants}
                      initial="initial"
                      whileHover="hover"
                    >
                      <SidebarMenuButton
                        tooltip={item.title}
                        asChild
                        isActive={isActive(item.url)}
                      >
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
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                          <SidebarItemGlow
                            visible={
                              hoveredItem === item.title || isActive(item.url)
                            }
                          />
                        </Link>
                      </SidebarMenuButton>
                    </motion.div>
                  )}
                </SidebarMenuItem>
              </motion.div>
            ))}
          </SidebarMenu>
        </motion.div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
