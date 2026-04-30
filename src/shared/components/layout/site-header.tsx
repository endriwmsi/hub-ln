import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/core";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { SidebarTrigger } from "../ui/sidebar";
import { SidebarSearch } from "./sidebar-search";

export function SiteHeader() {
  const { data: session } = authClient.useSession();

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
      className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)"
    >
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />

        <div className="max-w-64 w-full px-2 group-data-[collapsible=icon]:hidden">
          <SidebarSearch isAdmin={session?.user.role === "admin"} />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* <NotificationsDropdown /> */}
          <Link
            href="/configuracoes"
            className="inline-flex items-center justify-center rounded-md h-9 w-9 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Settings className="w-4 h-4" />
          </Link>
          <Link href="/configuracoes/perfil" className="rounded-full">
            <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity">
              <AvatarImage
                src={session?.user?.image ?? ""}
                alt={session?.user?.name ?? ""}
              />
              <AvatarFallback>{session?.user?.name?.[0]}</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
