"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Hourglass,
  Loader2,
  Search,
  XCircle,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { useDebounce } from "@/shared/hooks/use-debounce";
import {
  useAcaoClients,
  useUpdateBulkItemsStatus,
  useUpdateSingleItemStatus,
} from "../hooks";

type StatusType = "aguardando" | "baixas_completas" | "baixas_negadas";

type AcaoClientsTableProps = {
  acaoId: string;
  initialSearch?: string;
  initialStatus?: string;
  initialPage?: number;
  initialPageSize?: number;
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const statusConfig = {
  aguardando: {
    label: "Aguardando",
    className:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    icon: Hourglass,
  },
  baixas_completas: {
    label: "Baixas Completas",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    icon: CheckCircle2,
  },
  baixas_negadas: {
    label: "Baixas Negadas",
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    icon: XCircle,
  },
};

function TableSkeletonRow({ variant = 1 }: { variant?: 1 | 2 | 3 | 4 | 5 }) {
  const widths = {
    1: { nome: "w-32", doc: "w-28", user: "w-24", userEmail: "w-32" },
    2: { nome: "w-36", doc: "w-24", user: "w-28", userEmail: "w-36" },
    3: { nome: "w-28", doc: "w-32", user: "w-20", userEmail: "w-28" },
    4: { nome: "w-40", doc: "w-28", user: "w-32", userEmail: "w-40" },
    5: { nome: "w-32", doc: "w-28", user: "w-24", userEmail: "w-32" },
  };
  const w = widths[variant];

  return (
    <TableRow>
      <TableCell>
        <Skeleton className="h-4 w-4" />
      </TableCell>
      <TableCell>
        <Skeleton className={`h-4 ${w.nome}`} />
      </TableCell>
      <TableCell>
        <Skeleton className={`h-4 ${w.doc}`} />
      </TableCell>
      <TableCell>
        <Skeleton className="h-6 w-24" />
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <Skeleton className={`h-4 ${w.user}`} />
          <Skeleton className={`h-3 ${w.userEmail}`} />
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-8 w-16" />
      </TableCell>
    </TableRow>
  );
}

export function AcaoClientsTable({
  acaoId,
  initialSearch = "",
  initialStatus = "all",
  initialPage = 1,
  initialPageSize = 50,
}: AcaoClientsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Estados locais
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [currentStatus, setCurrentStatus] = useState(initialStatus);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [selectedItems, setSelectedItems] = useState<
    Array<{ requestId: string; itemIndex: number }>
  >([]);

  // Debounce do valor de busca (400ms)
  const debouncedSearch = useDebounce(searchValue, 400);

  // React Query - busca de clientes
  const { data, isLoading, isFetching } = useAcaoClients({
    acaoId,
    filters: {
      search: debouncedSearch || undefined,
      status:
        currentStatus === "all" ? undefined : (currentStatus as StatusType),
      page: currentPage,
      pageSize,
    },
  });

  // React Query - mutations
  const bulkUpdateMutation = useUpdateBulkItemsStatus(acaoId);
  const singleUpdateMutation = useUpdateSingleItemStatus(acaoId);

  const items = data?.success ? data.data?.items || [] : [];
  const pagination = data?.success
    ? data.data?.pagination || {
        page: 1,
        pageSize: 50,
        total: 0,
        totalPages: 1,
      }
    : { page: 1, pageSize: 50, total: 0, totalPages: 1 };
  const statusCounts = data?.success
    ? data.data?.statusCounts || {
        aguardando: 0,
        baixas_completas: 0,
        baixas_negadas: 0,
      }
    : { aguardando: 0, baixas_completas: 0, baixas_negadas: 0 };
  const totalItems = data?.success ? data.data?.totalItems || 0 : 0;

  // Atualiza a URL quando os filtros mudam
  const updateUrl = useCallback(
    (params: {
      search?: string;
      status?: string;
      page?: number;
      pageSize?: number;
    }) => {
      const newParams = new URLSearchParams(searchParams.toString());

      if (params.search !== undefined) {
        if (params.search) {
          newParams.set("search", params.search);
        } else {
          newParams.delete("search");
        }
      }

      if (params.status !== undefined) {
        if (params.status && params.status !== "all") {
          newParams.set("status", params.status);
        } else {
          newParams.delete("status");
        }
      }

      if (params.page !== undefined) {
        if (params.page > 1) {
          newParams.set("page", params.page.toString());
        } else {
          newParams.delete("page");
        }
      }

      if (params.pageSize !== undefined) {
        if (params.pageSize !== 50) {
          newParams.set("pageSize", params.pageSize.toString());
        } else {
          newParams.delete("pageSize");
        }
      }

      const query = newParams.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  // Efeito para atualizar quando o debounce muda
  useEffect(() => {
    if (debouncedSearch !== initialSearch) {
      setCurrentPage(1);
      updateUrl({ search: debouncedSearch, page: 1 });
    }
  }, [debouncedSearch, initialSearch, updateUrl]);

  // Handlers
  const handleStatusFilter = (status: string) => {
    setCurrentStatus(status);
    setCurrentPage(1);
    setSelectedItems([]);
    updateUrl({ status, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setSelectedItems([]);
    updateUrl({ page: newPage });
  };

  const handlePageSizeChange = (newPageSize: string) => {
    const size = parseInt(newPageSize);
    setPageSize(size);
    setCurrentPage(1);
    setSelectedItems([]);
    updateUrl({ pageSize: size, page: 1 });
  };

  // Seleção
  const isAllSelected =
    items.length > 0 &&
    items.every((item) =>
      selectedItems.some(
        (s) => s.requestId === item.requestId && s.itemIndex === item.itemIndex,
      ),
    );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(
        items.map((item) => ({
          requestId: item.requestId,
          itemIndex: item.itemIndex,
        })),
      );
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (
    requestId: string,
    itemIndex: number,
    checked: boolean,
  ) => {
    if (checked) {
      setSelectedItems((prev) => [...prev, { requestId, itemIndex }]);
    } else {
      setSelectedItems((prev) =>
        prev.filter(
          (s) => !(s.requestId === requestId && s.itemIndex === itemIndex),
        ),
      );
    }
  };

  const isItemSelected = (requestId: string, itemIndex: number) => {
    return selectedItems.some(
      (s) => s.requestId === requestId && s.itemIndex === itemIndex,
    );
  };

  // Atualização de status
  const handleBulkStatusUpdate = (status: StatusType) => {
    if (selectedItems.length === 0) {
      toast.error("Selecione pelo menos um item");
      return;
    }

    bulkUpdateMutation.mutate(
      { items: selectedItems, status },
      {
        onSuccess: () => {
          setSelectedItems([]);
        },
      },
    );
  };

  const handleSingleStatusUpdate = (
    requestId: string,
    itemIndex: number,
    status: StatusType,
  ) => {
    singleUpdateMutation.mutate({ requestId, itemIndex, status });
  };

  const isPending =
    bulkUpdateMutation.isPending || singleUpdateMutation.isPending;
  const isSearching = isFetching && !isLoading;

  return (
    <div className="space-y-4">
      {/* Status summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          type="button"
          className={`p-4 rounded-lg border text-left transition-colors ${
            currentStatus === "all"
              ? "bg-primary/10 border-primary"
              : "hover:bg-muted"
          }`}
          onClick={() => handleStatusFilter("all")}
        >
          <p className="text-sm text-muted-foreground">Total</p>
          {isLoading ? (
            <Skeleton className="h-8 w-16 mt-1" />
          ) : (
            <p className="text-2xl font-bold">{totalItems}</p>
          )}
        </button>
        <button
          type="button"
          className={`p-4 rounded-lg border text-left transition-colors ${
            currentStatus === "aguardando"
              ? "bg-yellow-100 border-yellow-400 dark:bg-yellow-900/30"
              : "hover:bg-muted"
          }`}
          onClick={() => handleStatusFilter("aguardando")}
        >
          <p className="text-sm text-muted-foreground">Aguardando</p>
          {isLoading ? (
            <Skeleton className="h-8 w-16 mt-1" />
          ) : (
            <p className="text-2xl font-bold text-yellow-600">
              {statusCounts.aguardando}
            </p>
          )}
        </button>
        <button
          type="button"
          className={`p-4 rounded-lg border text-left transition-colors ${
            currentStatus === "baixas_completas"
              ? "bg-green-100 border-green-400 dark:bg-green-900/30"
              : "hover:bg-muted"
          }`}
          onClick={() => handleStatusFilter("baixas_completas")}
        >
          <p className="text-sm text-muted-foreground">Baixas Completas</p>
          {isLoading ? (
            <Skeleton className="h-8 w-16 mt-1" />
          ) : (
            <p className="text-2xl font-bold text-green-600">
              {statusCounts.baixas_completas}
            </p>
          )}
        </button>
        <button
          type="button"
          className={`p-4 rounded-lg border text-left transition-colors ${
            currentStatus === "baixas_negadas"
              ? "bg-red-100 border-red-400 dark:bg-red-900/30"
              : "hover:bg-muted"
          }`}
          onClick={() => handleStatusFilter("baixas_negadas")}
        >
          <p className="text-sm text-muted-foreground">Baixas Negadas</p>
          {isLoading ? (
            <Skeleton className="h-8 w-16 mt-1" />
          ) : (
            <p className="text-2xl font-bold text-red-600">
              {statusCounts.baixas_negadas}
            </p>
          )}
        </button>
      </div>

      {/* Filters and bulk actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-sm">
            {isSearching ? (
              <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
            ) : (
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            )}
            <Input
              placeholder="Buscar por nome ou documento..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => setSearchValue("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <XCircle className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {selectedItems.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedItems.length} selecionado(s)
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" size="sm" disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Alterar Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleBulkStatusUpdate("aguardando")}
                >
                  <Hourglass className="h-4 w-4 mr-2 text-yellow-600" />
                  Aguardando
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleBulkStatusUpdate("baixas_completas")}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                  Baixas Completas
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleBulkStatusUpdate("baixas_negadas")}
                >
                  <XCircle className="h-4 w-4 mr-2 text-red-600" />
                  Baixas Negadas
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedItems([])}
            >
              Limpar
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Selecionar todos"
                  disabled={isLoading}
                />
              </TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Data Envio</TableHead>
              <TableHead className="w-25">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Skeleton loading
              <>
                <TableSkeletonRow variant={1} />
                <TableSkeletonRow variant={2} />
                <TableSkeletonRow variant={3} />
                <TableSkeletonRow variant={4} />
                <TableSkeletonRow variant={5} />
              </>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  Nenhum cliente encontrado
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => {
                const status = statusConfig[item.status];
                const Icon = status.icon;
                const isSelected = isItemSelected(
                  item.requestId,
                  item.itemIndex,
                );

                return (
                  <TableRow
                    key={`${item.requestId}-${item.itemIndex}`}
                    className={isSelected ? "bg-primary/5" : ""}
                  >
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handleSelectItem(
                            item.requestId,
                            item.itemIndex,
                            !!checked,
                          )
                        }
                        aria-label={`Selecionar ${item.nome}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{item.nome}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {item.documento}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`gap-1 ${status.className}`}
                      >
                        <Icon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{item.userName}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.userEmail}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(item.requestCreatedAt), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isPending}
                          >
                            Editar
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              handleSingleStatusUpdate(
                                item.requestId,
                                item.itemIndex,
                                "aguardando",
                              )
                            }
                          >
                            <Hourglass className="h-4 w-4 mr-2 text-yellow-600" />
                            Aguardando
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleSingleStatusUpdate(
                                item.requestId,
                                item.itemIndex,
                                "baixas_completas",
                              )
                            }
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                            Baixas Completas
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleSingleStatusUpdate(
                                item.requestId,
                                item.itemIndex,
                                "baixas_negadas",
                              )
                            }
                          >
                            <XCircle className="h-4 w-4 mr-2 text-red-600" />
                            Baixas Negadas
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {isLoading ? (
              <Skeleton className="h-4 w-48 inline-block" />
            ) : pagination.total > 0 ? (
              <>
                Mostrando {(pagination.page - 1) * pagination.pageSize + 1} a{" "}
                {Math.min(
                  pagination.page * pagination.pageSize,
                  pagination.total,
                )}{" "}
                de {pagination.total} resultados
              </>
            ) : (
              "Nenhum resultado"
            )}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Linhas:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={handlePageSizeChange}
              disabled={isLoading}
            >
              <SelectTrigger className="h-8 w-18">
                <SelectValue placeholder={pageSize.toString()} />
              </SelectTrigger>
              <SelectContent side="top">
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm min-w-25 text-center">
            {isLoading ? (
              <Skeleton className="h-4 w-20 inline-block" />
            ) : (
              `Página ${pagination.page} de ${pagination.totalPages || 1}`
            )}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= pagination.totalPages || isLoading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
