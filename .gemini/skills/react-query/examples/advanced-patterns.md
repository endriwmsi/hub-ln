/**
 * Padrões Avançados de React Query
 *
 * Exemplos de uso mais complexos:
 * - Paginação
 * - Infinite Query (scroll infinito)
 * - Optimistic Updates
 * - Prefetching
 * - Dependent Queries
 */

"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

// ============================================
// TIPOS
// ============================================

interface Product {
  id: string;
  name: string;
  price: number;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

interface InfiniteResponse<T> {
  data: T[];
  nextCursor: string | null;
}

// ============================================
// 1. PAGINAÇÃO TRADICIONAL
// ============================================

async function getProductsPaginated(
  page: number,
  pageSize: number,
): Promise<PaginatedResponse<Product>> {
  const response = await fetch(
    `/api/products?page=${page}&pageSize=${pageSize}`,
  );
  return response.json();
}

/**
 * Hook para buscar produtos com paginação
 *
 * @example
 * const [page, setPage] = useState(1);
 * const { data, isPlaceholderData } = usePaginatedProducts(page, 10);
 *
 * // Navegação
 * <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
 *   Anterior
 * </button>
 * <button
 *   disabled={isPlaceholderData || page >= data.meta.totalPages}
 *   onClick={() => setPage(p => p + 1)}
 * >
 *   Próximo
 * </button>
 */
export function usePaginatedProducts(page: number, pageSize = 10) {
  return useQuery({
    queryKey: ["products", "paginated", { page, pageSize }],
    queryFn: () => getProductsPaginated(page, pageSize),
    // Mantém dados anteriores enquanto carrega novos
    placeholderData: (previousData) => previousData,
    // Cache de 30 segundos
    staleTime: 30 * 1000,
  });
}

// ============================================
// 2. INFINITE QUERY (SCROLL INFINITO)
// ============================================

async function getProductsInfinite(
  cursor?: string,
): Promise<InfiniteResponse<Product>> {
  const url = cursor
    ? `/api/products/infinite?cursor=${cursor}`
    : "/api/products/infinite";
  const response = await fetch(url);
  return response.json();
}

/**
 * Hook para scroll infinito de produtos
 *
 * @example
 * const {
 *   data,
 *   fetchNextPage,
 *   hasNextPage,
 *   isFetchingNextPage,
 * } = useInfiniteProducts();
 *
 * // Renderizar todos os itens
 * {data?.pages.map(page =>
 *   page.data.map(product => <ProductCard key={product.id} {...product} />)
 * )}
 *
 * // Botão "carregar mais"
 * <button
 *   onClick={() => fetchNextPage()}
 *   disabled={!hasNextPage || isFetchingNextPage}
 * >
 *   {isFetchingNextPage ? "Carregando..." : "Carregar mais"}
 * </button>
 */
export function useInfiniteProducts() {
  return useInfiniteQuery({
    queryKey: ["products", "infinite"],
    queryFn: ({ pageParam }) => getProductsInfinite(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

// ============================================
// 3. OPTIMISTIC UPDATES
// ============================================

interface UpdateProductInput {
  id: string;
  name: string;
  price: number;
}

async function updateProduct(data: UpdateProductInput): Promise<Product> {
  const response = await fetch(`/api/products/${data.id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * Hook com Optimistic Update
 *
 * Atualiza a UI imediatamente, antes da resposta do servidor.
 * Se der erro, reverte para o estado anterior.
 *
 * @example
 * const { mutate } = useOptimisticUpdateProduct();
 * mutate({ id: "123", name: "Novo Nome", price: 99.90 });
 * // UI atualiza instantaneamente!
 */
export function useOptimisticUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProduct,
    // Antes da mutation, atualiza o cache otimisticamente
    onMutate: async (newProduct) => {
      // Cancela queries em andamento para evitar sobrescrita
      await queryClient.cancelQueries({ queryKey: ["products"] });

      // Salva estado anterior para rollback
      const previousProducts = queryClient.getQueryData<Product[]>([
        "products",
      ]);

      // Atualiza cache otimisticamente
      queryClient.setQueryData<Product[]>(["products"], (old) =>
        old?.map((p) => (p.id === newProduct.id ? { ...p, ...newProduct } : p)),
      );

      // Retorna contexto para rollback
      return { previousProducts };
    },
    // Em caso de erro, reverte para estado anterior
    onError: (_err, _newProduct, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(["products"], context.previousProducts);
      }
    },
    // Sempre sincroniza com servidor ao final
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// ============================================
// 4. PREFETCHING
// ============================================

async function getProductById(id: string): Promise<Product> {
  const response = await fetch(`/api/products/${id}`);
  return response.json();
}

/**
 * Hook com prefetching para detalhes do produto
 *
 * Ideal para prefetch no hover antes do clique
 *
 * @example
 * const { prefetchProduct } = useProductWithPrefetch();
 *
 * <div
 *   onMouseEnter={() => prefetchProduct(product.id)}
 *   onClick={() => router.push(`/products/${product.id}`)}
 * >
 *   {product.name}
 * </div>
 */
export function useProductWithPrefetch() {
  const queryClient = useQueryClient();

  const prefetchProduct = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: ["products", id],
      queryFn: () => getProductById(id),
      // Mantém no cache por 5 minutos
      staleTime: 5 * 60 * 1000,
    });
  };

  return { prefetchProduct };
}

// ============================================
// 5. DEPENDENT QUERIES
// ============================================

interface User {
  id: string;
  name: string;
}

interface Order {
  id: string;
  userId: string;
  total: number;
}

async function getCurrentUser(): Promise<User> {
  const response = await fetch("/api/user");
  return response.json();
}

async function getUserOrders(userId: string): Promise<Order[]> {
  const response = await fetch(`/api/users/${userId}/orders`);
  return response.json();
}

/**
 * Queries dependentes - uma executa após a outra
 *
 * @example
 * const { user, orders, isLoading } = useUserOrders();
 * // orders só carrega depois que user retornar
 */
export function useUserOrders() {
  // Primeira query: busca usuário
  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
  });

  // Segunda query: depende do userId da primeira
  const ordersQuery = useQuery({
    queryKey: ["orders", userQuery.data?.id],
    queryFn: () => getUserOrders(userQuery.data!.id),
    // Só executa quando user estiver disponível
    enabled: !!userQuery.data?.id,
  });

  return {
    user: userQuery.data,
    orders: ordersQuery.data,
    isLoading: userQuery.isLoading || ordersQuery.isLoading,
    error: userQuery.error || ordersQuery.error,
  };
}

// ============================================
// 6. RETRY E REFETCH CONFIGURÁVEIS
// ============================================

/**
 * Query com configuração customizada de retry e refetch
 */
export function useProductsWithRetry() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Failed to fetch");
      return response.json();
    },
    // Tentar novamente 3 vezes em caso de erro
    retry: 3,
    // Intervalo entre tentativas: 1s, 2s, 4s (exponencial)
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Refetch a cada 5 minutos
    refetchInterval: 5 * 60 * 1000,
    // Não refetch quando a janela ganha foco
    refetchOnWindowFocus: false,
    // Considerar stale após 1 minuto
    staleTime: 60 * 1000,
  });
}
