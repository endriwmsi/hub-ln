"use client";

import {
  type Icon,
  IconAlertCircle,
  IconCreditCard,
  IconImageInPicture,
  IconNetwork,
  IconPackage,
  IconPencil,
  IconSearch,
  IconSend,
  IconSettings,
  IconSmartHome,
  IconTicket,
  IconUsers,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/shared/components/ui/command";
import { DialogTitle } from "@/shared/components/ui/dialog";

type NavPage = {
  title: string;
  url: string;
  icon: Icon;
};

const generalPages: NavPage[] = [
  { title: "Home", url: "/dashboard", icon: IconSmartHome },
  { title: "Serviços", url: "/servicos", icon: IconPackage },
  { title: "Envios", url: "/envios", icon: IconSend },
  { title: "Financeiro", url: "/transacoes", icon: IconCreditCard },
  { title: "Indicações", url: "/indicacoes", icon: IconNetwork },
  { title: "Criativos", url: "/criativos", icon: IconImageInPicture },
  { title: "Editor", url: "/editor", icon: IconPencil },
];

const adminPages: NavPage[] = [
  { title: "Gerenciar Ações", url: "/gerenciar-acoes", icon: IconTicket },
  { title: "Gerenciar Usuários", url: "/gerenciar-usuarios", icon: IconUsers },
  {
    title: "Gerenciar Avisos",
    url: "/gerenciar-avisos",
    icon: IconAlertCircle,
  },
  {
    title: "Gerenciar Serviços",
    url: "/gerenciar-servicos",
    icon: IconPackage,
  },
  {
    title: "Gerenciar Criativos",
    url: "/gerenciar-criativos",
    icon: IconImageInPicture,
  },
  { title: "Gerenciar Clientes", url: "/gerenciar-clientes", icon: IconUsers },
  { title: "Gerenciar Cupons", url: "/gerenciar-cupons", icon: IconTicket },
];

const settingsPages: NavPage[] = [
  { title: "Configurações", url: "/configuracoes", icon: IconSettings },
];

interface SidebarSearchProps {
  isAdmin: boolean;
}

export function SidebarSearch({ isAdmin }: SidebarSearchProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navigate = useCallback(
    (url: string) => {
      setOpen(false);
      router.push(url);
    },
    [router],
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2 rounded-md border border-sidebar-border bg-sidebar-accent/20 px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
      >
        <IconSearch className="size-3.5 shrink-0" />
        <span className="flex-1 text-left text-xs">Buscar...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
          ⌘ K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <DialogTitle className="sr-only">Buscar navegação</DialogTitle>
        <CommandInput placeholder="Buscar página..." />
        <CommandList>
          <CommandEmpty>Nenhuma página encontrada.</CommandEmpty>

          <CommandGroup heading="Geral">
            {generalPages.map((page) => (
              <CommandItem
                key={page.url}
                value={page.title}
                onSelect={() => navigate(page.url)}
              >
                <page.icon />
                <span>{page.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          {isAdmin && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Admin">
                {adminPages.map((page) => (
                  <CommandItem
                    key={page.url}
                    value={page.title}
                    onSelect={() => navigate(page.url)}
                  >
                    <page.icon />
                    <span>{page.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          <CommandSeparator />
          <CommandGroup heading="Configurações">
            {settingsPages.map((page) => (
              <CommandItem
                key={page.url}
                value={page.title}
                onSelect={() => navigate(page.url)}
              >
                <page.icon />
                <span>{page.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
