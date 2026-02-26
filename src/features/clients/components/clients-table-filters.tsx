"use client";

import { Filter, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useClientFilters } from "../hooks";
import type { ClientStatus } from "../types";
import { TagInput } from "./tag-input";
import { UserSearchInput } from "./user-search-input";

type ClientsTableFiltersProps = {
  services?: Array<{ id: string; title: string }>;
  users?: Array<{ id: string; name: string; email: string }>;
};

export function ClientsTableFilters({
  services = [],
  users = [],
}: ClientsTableFiltersProps) {
  const { filters, updateFilters, resetFilters } = useClientFilters();

  const hasActiveFilters =
    (filters.search?.length ?? 0) > 0 ||
    filters.status !== "all" ||
    filters.serviceId ||
    filters.userId ||
    filters.paid !== "all";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        {/* Tag Input para busca múltipla */}
        <div className="flex-1">
          <TagInput
            value={filters.search || []}
            onChange={(search) => updateFilters({ search, page: 1 })}
            placeholder="Buscar por nome ou documento (pressione Enter)..."
            className="max-w-2xl"
          />
        </div>

        {/* Botão Limpar Filtros */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Limpar
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        {/* Filtro de Status */}
        <Select
          value={filters.status}
          onValueChange={(status: ClientStatus | "all") =>
            updateFilters({ status, page: 1 })
          }
        >
          <SelectTrigger className="w-full md:w-45">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="aguardando">Aguardando</SelectItem>
            <SelectItem value="baixas_completas">Baixas Completas</SelectItem>
            <SelectItem value="baixas_negadas">Baixas Negadas</SelectItem>
          </SelectContent>
        </Select>

        {/* Filtro de Serviço */}
        {services.length > 0 && (
          <Select
            value={filters.serviceId ?? "all"}
            onValueChange={(serviceId: string) =>
              updateFilters({
                serviceId: serviceId === "all" ? undefined : serviceId,
                page: 1,
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

        {/* Filtro de Parceiro */}
        {users.length > 0 && (
          <div className="w-full md:w-45">
            <UserSearchInput
              users={users}
              value={filters.userId}
              onValueChange={(userId) =>
                updateFilters({
                  userId,
                  page: 1,
                })
              }
              placeholder="Buscar parceiro..."
            />
          </div>
        )}

        {/* Filtro de Pagamento */}
        <Select
          value={String(filters.paid)}
          onValueChange={(paid: string) =>
            updateFilters({
              paid: paid === "all" ? "all" : paid === "true",
              page: 1,
            })
          }
        >
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Pagamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="true">Pagos</SelectItem>
            <SelectItem value="false">Não pagos</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
