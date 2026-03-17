import { motion } from "framer-motion";
import { NotificationsDropdown } from "@/features/notifications";
import { SidebarTrigger } from "../ui/sidebar";
import { ModeToggle } from "./mode-toggle";

export function SiteHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
      className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)"
    >
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <div className="ml-auto flex items-center gap-2">
          {/* Notifications Dropdown */}
          <NotificationsDropdown />
          <div className="flex items-center gap-2">
            <ModeToggle />
          </div>

          {/*  Added user info dropdown */}
          {/*<DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="h-8 w-8">
                  {session?.user.image && (
                    <AvatarImage
                      src={session?.user.image || "/assets/placeholder.svg"}
                      alt={session?.user.name || ""}
                    />
                  )}
                  <AvatarFallback className="rounded-lg">
                    {getUserInitials(session?.user.name || "")}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden max-w-40 flex-col items-start md:flex">
                  {isPending ? (
                    <>
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32 mt-1" />
                    </>
                  ) : (
                    <>
                      <span className="truncate font-medium">
                        {session?.user.name || ""}
                      </span>
                      <span className="text-muted-foreground truncate text-xs">
                        {session?.user.email}
                      </span>
                    </>
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href="/configuracoes/perfil"
                  className="flex w-full cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/configuracoes"
                  className="flex w-full cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  await authClient.signOut({
                    fetchOptions: {
                      onSuccess: () => {
                        redirect("/login");
                      },
                    },
                  });
                }}
                className="cursor-pointer"
              >
                <IconLogout />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>*/}
        </div>
      </div>
    </motion.header>
  );
}
