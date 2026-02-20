"use client";

import { Download, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { exportUsers } from "../actions";
import { useUserFilters } from "../hooks/use-user-filters";

export function UsersTableFilters() {
  const { filters, updateFilters, clearFilters } = useUserFilters();
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [isExporting, setIsExporting] = useState(false);
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

  const handleExport = async () => {
    try {
      setIsExporting(true);
      toast("Exportando usuários...");

      const result = await exportUsers(filters);

      if (!result.success || !result.data) {
        throw new Error(result.error || "Erro ao exportar usuários");
      }

      // Converter base64 para blob
      const byteCharacters = atob(result.data.base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Criar link de download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast("Exportação concluída!");
    } catch (error) {
      console.error("Erro ao exportar:", error);
      toast("Erro ao exportar usuários");
    } finally {
      setIsExporting(false);
    }
  };

  const hasActiveFilters =
    filters.search || (filters.role && filters.role !== "all");

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
        {/* Busca */}
        <div className="relative flex-1 md:max-w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email, telefone..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Filtro de Role */}
        <Select
          value={filters.role || "all"}
          onValueChange={(value) =>
            updateFilters({ role: value as "user" | "admin" | "all" })
          }
        >
          <SelectTrigger className="w-full md:w-45">
            <SelectValue placeholder="Tipo de conta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="user">Usuários</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>

        {/* Filtro de Ordenação */}
        {/* <Select
          value={filters.sortBy || "createdAt"}
          onValueChange={(value) =>
            updateFilters({ sortBy: value as "createdAt" | "name" | "email" })
          }
        >
          <SelectTrigger className="w-full md:w-45">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Data de cadastro</SelectItem>
            <SelectItem value="name">Nome</SelectItem>
            <SelectItem value="email">Email</SelectItem>
          </SelectContent>
        </Select> */}

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

      {/* Botão Exportar */}
      <Button
        onClick={handleExport}
        disabled={isExporting}
        className="h-10"
        variant="outline"
      >
        <Download className="mr-2 h-4 w-4" />
        {isExporting ? "Exportando..." : "Exportar Excel"}
      </Button>
    </div>
  );
}
