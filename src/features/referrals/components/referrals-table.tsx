"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, Settings2, X } from "lucide-react";
import { useState } from "react";
import { getUserServicePrices } from "@/features/services/actions/get-user-service-prices";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { usePaginatedReferrals, useReferralFilters } from "../hooks";
import type { ReferralNode } from "../types";
import { DataTable } from "./data-table";
import { ReferralsBulkPriceModal } from "./referrals-bulk-price-modal";
import { getColumns, type ReferralRow } from "./referrals-columns";

export function ReferralsTable() {
  const { filters, updateFilters, clearFilters } = useReferralFilters();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedRows, setSelectedRows] = useState<ReferralRow[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search || "");

  const { data: referralsData, isLoading } = usePaginatedReferrals(filters);

  // Buscar os serviços e preços atuais do usuário indicador (quem está renderizando) p/ modal
  const { data: servicesData } = useQuery({
    queryKey: ["userServicePrices"],
    queryFn: async () => {
      const result = await getUserServicePrices();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput });
  };

  const clearSearch = () => {
    setSearchInput("");
    clearFilters();
  };

  // Convert `selectedRows` to `ReferralNode` array to satisfy the modal prop.
  // The `ReferralNode` requires `children` which we don't fetch directly, but we can pass an empty array since the modal only uses `id`.
  const mappedSelectedReferrals = selectedRows.map((r) => ({
    ...r,
    children: [], // Fake children to satisfy the prop typing in ReferralNode if needed
  }));

  const data = referralsData?.data || [];
  const pageCount = referralsData?.totalPages || 1;
  const dynamicColumns = getColumns(servicesData || []);

  return (
    <Card>
      <CardHeader className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <CardTitle>Indicações Registradas</CardTitle>
          <CardDescription>
            Gerencie o preço cobrado nos serviços para as pessoas cadastradas.
          </CardDescription>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center space-x-2"
          >
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar indicados..."
                className="pl-8 pr-8"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {filters.search && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-2.5 top-2.5"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
            <Button type="submit" variant="secondary">
              Buscar
            </Button>
          </form>

          <Button
            onClick={() => setIsModalOpen(true)}
            disabled={selectedIds.size === 0 || !servicesData}
            className="w-full md:w-auto"
          >
            <Settings2 className="mr-2 h-4 w-4" />
            Alterar Preços ({selectedIds.size})
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <DataTable
            columns={dynamicColumns}
            data={data}
            pageCount={pageCount}
            pageIndex={filters.page}
            pageSize={filters.pageSize}
            onPageChange={(page) => updateFilters({ page })}
            onPageSizeChange={(pageSize) => updateFilters({ pageSize })}
            onSelectionChange={(ids, rows) => {
              setSelectedIds(ids);
              setSelectedRows(rows);
            }}
          />
        )}
      </CardContent>

      {servicesData && (
        <ReferralsBulkPriceModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          selectedReferrals={
            mappedSelectedReferrals as unknown as ReferralNode[]
          }
          services={servicesData}
          onSuccess={() => {
            setSelectedIds(new Set());
            setSelectedRows([]);
          }}
        />
      )}
    </Card>
  );
}
