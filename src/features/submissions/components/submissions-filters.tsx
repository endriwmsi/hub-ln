"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  serviceRequestStatuses,
  serviceRequestStatusLabels,
} from "@/features/service-requests/schemas";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useSubmissionFilters } from "../hooks";

type Service = {
  id: string;
  title: string;
};

type SubmissionsFiltersProps = {
  services?: Service[];
};

export function SubmissionsFilters({ services = [] }: SubmissionsFiltersProps) {
  const { filters, updateFilters, clearFilters } = useSubmissionFilters();
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sincronizar input com filtros
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

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const hasActiveFilters =
    filters.search ||
    (filters.status && filters.status !== "all") ||
    (filters.paid && filters.paid !== "all") ||
    filters.serviceId;

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
        {/* Busca */}
        <div className="relative flex-1 md:max-w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>

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
            {serviceRequestStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {serviceRequestStatusLabels[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtro de Pagamento */}
        <Select
          value={filters.paid || "all"}
          onValueChange={(value) =>
            updateFilters({
              paid: value as typeof filters.paid,
            })
          }
        >
          <SelectTrigger className="w-full md:w-45">
            <SelectValue placeholder="Pagamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="paid">Pagos</SelectItem>
            <SelectItem value="unpaid">Não pagos</SelectItem>
          </SelectContent>
        </Select>

        {/* Filtro de Serviço */}
        {services.length > 0 && (
          <Select
            value={filters.serviceId || "all"}
            onValueChange={(value) =>
              updateFilters({
                serviceId: value === "all" ? undefined : value,
              })
            }
          >
            <SelectTrigger className="w-full md:w-45">
              <SelectValue placeholder="Serviço" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os serviços</SelectItem>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

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
