"use client";

import { Download, LayoutGrid, List, Search, UsersIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useIsMobile } from "@/shared";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { exportUsers } from "../actions";
import { useUserFilters } from "../hooks/use-user-filters";
import type { ViewMode } from "../schemas";

export function UsersTableFilters() {
  const isMobile = useIsMobile();
  const { filters, viewMode, updateFilters } = useUserFilters();
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [isExporting, setIsExporting] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setSearchInput(filters.search || "");
  }, [filters.search]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      updateFilters({ search: value || undefined });
    }, 500);
  };

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

      const byteCharacters = atob(result.data.base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

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

  // const hasActiveFilters =
  //   filters.search || (filters.role && filters.role !== "all");

  return (
    <div className="flex flex-col gap-4 md:flex-row md:justify-between items-center">
      <div className="flex space-x-4 items-center">
        <div className="p-3 rounded-full bg-foreground/10 border border-foreground/10">
          <UsersIcon className="w-4 h-4" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
      </div>

      <div>
        <Tabs
          className="w-full"
          value={viewMode}
          onValueChange={(value) =>
            updateFilters({ viewMode: value as ViewMode })
          }
        >
          <TabsList className="rounded-full">
            <TabsTrigger
              value="list"
              aria-label="Visualização em lista"
              className="rounded-full px-4 py-3"
            >
              <List className="h-4 w-4" />
              {!isMobile && "Visualização em Lista"}
            </TabsTrigger>
            <TabsTrigger
              value="grid"
              aria-label="Visualização em grade"
              className="rounded-full px-4 py-3"
            >
              <LayoutGrid className="h-4 w-4" />
              {!isMobile && "Visualização em Grid"}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center gap-2 w-full max-w-92">
        <div className="relative flex-1 md:max-w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email, telefone..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-8 max-w-92 w-full rounded-full"
          />
        </div>

        {/* <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
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
        </div> */}

        <Button
          onClick={handleExport}
          disabled={isExporting}
          className="h-10 rounded-full"
          variant="outline"
        >
          <Download className="h-4 w-4" />
          {isExporting ? "Exportando..." : "Exportar Excel"}
        </Button>
      </div>
    </div>
  );
}
