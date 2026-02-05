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
import { useTransactionFilters } from "../hooks";
import {
  transactionStatuses,
  transactionStatusLabels,
  transactionTypeLabels,
  transactionTypes,
} from "../types";

export function TransactionsFilters() {
  const { filters, updateFilters, clearFilters } = useTransactionFilters();
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sincronizar input de busca com filtros da URL
  useEffect(() => {
    setSearchInput(filters.search || "");
  }, [filters.search]);

  // Debounce da busca
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
    (filters.type && filters.type !== "all") ||
    (filters.status && filters.status !== "all");

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
        {/* Busca */}
        <div className="relative flex-1 md:max-w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar transação..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Filtro de Tipo */}
        <Select
          value={filters.type || "all"}
          onValueChange={(value) =>
            updateFilters({
              type: value as typeof filters.type,
            })
          }
        >
          <SelectTrigger className="w-full md:w-45">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {transactionTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {transactionTypeLabels[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtro de Status */}
        <Select
          value={filters.status || "all"}
          onValueChange={(value) =>
            updateFilters({
              status: value as typeof filters.status,
            })
          }
        >
          <SelectTrigger className="w-full md:w-45">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {transactionStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {transactionStatusLabels[status]}
              </SelectItem>
            ))}
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
