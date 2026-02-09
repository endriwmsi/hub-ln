/**
 * Exemplo: Hook para buscar dados com useQuery
 *
 * Este padrão é usado para:
 * - Listar recursos (ex: produtos, usuários, serviços)
 * - Buscar recurso por ID
 * - Buscar dados com filtros
 */

"use client";

import { useQuery } from "@tanstack/react-query";

// ============================================
// 1. BUSCAR LISTA DE RECURSOS
// ============================================

// Importar action do servidor (Next.js Server Action)
// import { getProducts } from "../actions";

// Simular função de busca para exemplo
async function getProducts(onlyActive?: boolean) {
  const response = await fetch(`/api/products?active=${onlyActive}`);
  return response.json();
}

/**
 * Hook para buscar lista de produtos
 *
 * @example
 * const { data, isLoading, error } = useProducts();
 * const { data: activeOnly } = useProducts(true);
 */
export function useProducts(onlyActive = false) {
  return useQuery({
    // Query key estruturada para invalidação granular
    queryKey: ["products", { onlyActive }],
    queryFn: () => getProducts(onlyActive),
  });
}

// ============================================
// 2. BUSCAR RECURSO POR ID
// ============================================

async function getProductById(id: string) {
  const response = await fetch(`/api/products/${id}`);
  return response.json();
}

/**
 * Hook para buscar produto específico por ID
 *
 * @example
 * const { data: product, isLoading } = useProduct("abc-123");
 */
export function useProduct(id: string) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => getProductById(id),
    // Só executa se tiver ID
    enabled: !!id,
  });
}

// ============================================
// 3. BUSCAR COM FILTROS COMPLEXOS
// ============================================

interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

async function getFilteredProducts(filters: ProductFilters) {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.minPrice) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice) params.set("maxPrice", String(filters.maxPrice));
  if (filters.search) params.set("search", filters.search);

  const response = await fetch(`/api/products?${params}`);
  return response.json();
}

/**
 * Hook para buscar produtos com filtros
 *
 * @example
 * const { data } = useFilteredProducts({
 *   category: "electronics",
 *   minPrice: 100,
 * });
 */
export function useFilteredProducts(filters: ProductFilters) {
  return useQuery({
    // Filtros como parte da query key para cache separado
    queryKey: ["products", "filtered", filters],
    queryFn: () => getFilteredProducts(filters),
    // Evita refetch desnecessário enquanto digita
    staleTime: 1000,
  });
}

// ============================================
// 4. BUSCAR COM SELECT (TRANSFORMAR DADOS)
// ============================================

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
}

/**
 * Hook que retorna apenas nomes dos produtos (menor payload)
 *
 * @example
 * const { data: names } = useProductNames();
 * // names = ["Produto A", "Produto B", ...]
 */
export function useProductNames() {
  return useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts(),
    // Transforma dados no cliente (melhora cache sharing)
    select: (data: Product[]) => data.map((p) => p.name),
  });
}
