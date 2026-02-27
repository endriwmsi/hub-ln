"use client";

import { Check, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { cn } from "@/shared/lib/utils";

type User = {
  id: string;
  name: string;
  email: string;
};

type UserSearchInputProps = {
  users: User[];
  value?: string;
  onValueChange: (userId: string | undefined) => void;
  placeholder?: string;
};

export function UserSearchInput({
  users,
  value,
  onValueChange,
  placeholder = "Buscar parceiro...",
}: UserSearchInputProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Usuário selecionado
  const selectedUser = useMemo(
    () => users.find((u) => u.id === value),
    [users, value],
  );

  // Filtrar usuários baseado na busca
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;

    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query),
    );
  }, [users, searchQuery]);

  const handleSelect = (userId: string) => {
    onValueChange(userId === value ? undefined : userId);
    setOpen(false);
    setSearchQuery("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onValueChange(undefined);
    setSearchQuery("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative flex w-full items-center">
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            {selectedUser ? (
              <span className="truncate">{selectedUser.name}</span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        {selectedUser && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 h-7 w-7 p-0"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Limpar seleção</span>
          </Button>
        )}
      </div>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
        <div className="flex flex-col">
          {/* Campo de busca */}
          <div className="border-b p-2">
            <Input
              placeholder="Digite para buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9"
            />
          </div>

          {/* Lista de usuários */}
          <ScrollArea className="h-75">
            <div className="p-1">
              {filteredUsers.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Nenhum parceiro encontrado
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleSelect(user.id)}
                    className={cn(
                      "relative flex w-full cursor-pointer items-center rounded-sm px-2 py-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
                      value === user.id && "bg-accent",
                    )}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === user.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
