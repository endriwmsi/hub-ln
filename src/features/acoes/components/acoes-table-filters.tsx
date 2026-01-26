"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useAcaoFilters } from "../hooks/use-acao-filters";

export function AcoesTableFilters() {
  const { filters, updateFilters, clearFilters } = useAcaoFilters();
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sincronizar input de busca com filtros da URL
  useEffect(() => {
    setSearchInput(filters.search || "");
  }, [filters.search]);

  // Debounce da busca usando ref para evitar re-renders
  const handleSearchChange = (value: string) => {
    setSearchInput(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      updateFilters({ search: value || undefined });
    }, 500);
  };

  // Limpar timeout ao desmontar
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const hasActiveFilters =
    filters.search ||
    (filters.visivel && filters.visivel !== "all") ||
    (filters.permiteEnvios && filters.permiteEnvios !== "all");

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
        {/* Busca */}
        <div className="relative flex-1 md:max-w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Filtro de Visibilidade */}
        <Select
          value={filters.visivel || "all"}
          onValueChange={(value) =>
            updateFilters({ visivel: value as "all" | "true" | "false" })
          }
        >
          <SelectTrigger className="w-full md:w-45">
            <SelectValue placeholder="Visibilidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="true">Visíveis</SelectItem>
            <SelectItem value="false">Ocultas</SelectItem>
          </SelectContent>
        </Select>

        {/* Filtro de Permissão de Envios */}
        <Select
          value={filters.permiteEnvios || "all"}
          onValueChange={(value) =>
            updateFilters({ permiteEnvios: value as "all" | "true" | "false" })
          }
        >
          <SelectTrigger className="w-full md:w-45">
            <SelectValue placeholder="Envios" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="true">Permite envios</SelectItem>
            <SelectItem value="false">Não permite</SelectItem>
          </SelectContent>
        </Select>

        {/* Botão Limpar */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="h-10 px-2 lg:px-3"
          >
            Limpar
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
