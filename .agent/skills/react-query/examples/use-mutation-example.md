/**
 * Exemplo: Hooks de Mutation para modificar dados
 *
 * Este padrão é usado para:
 * - Criar recursos
 * - Atualizar recursos
 * - Deletar recursos
 * - Qualquer operação que modifique o servidor
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ============================================
// TIPOS (normalmente em schemas.ts)
// ============================================

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
}

interface CreateProductInput {
  name: string;
  price: number;
  description: string;
}

interface UpdateProductInput extends CreateProductInput {
  id: string;
}

interface ActionResult {
  success: boolean;
  data?: Product;
  error?: string;
}

// ============================================
// SIMULAÇÃO DE SERVER ACTIONS
// ============================================

async function createProduct(data: CreateProductInput): Promise<ActionResult> {
  const response = await fetch("/api/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response.json();
}

async function updateProduct(data: UpdateProductInput): Promise<ActionResult> {
  const response = await fetch(`/api/products/${data.id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return response.json();
}

async function deleteProduct(id: string): Promise<ActionResult> {
  const response = await fetch(`/api/products/${id}`, {
    method: "DELETE",
  });
  return response.json();
}

// ============================================
// 1. HOOK PARA CRIAR
// ============================================

/**
 * Hook para criar novo produto
 *
 * @example
 * const { mutate, isPending } = useCreateProduct();
 *
 * const handleSubmit = (data: CreateProductInput) => {
 *   mutate(data, {
 *     onSuccess: () => closeModal(),
 *   });
 * };
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductInput) => createProduct(data),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Produto criado com sucesso!");
        // Invalida cache para recarregar lista
        queryClient.invalidateQueries({ queryKey: ["products"] });
      } else {
        toast.error(result.error || "Erro ao criar produto");
      }
    },
    onError: (error) => {
      toast.error("Erro ao criar produto");
      console.error(error);
    },
  });
}

// ============================================
// 2. HOOK PARA ATUALIZAR
// ============================================

/**
 * Hook para atualizar produto existente
 *
 * @example
 * const { mutate, isPending } = useUpdateProduct();
 *
 * mutate({ id: "123", name: "Novo Nome", price: 99.90 });
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProductInput) => updateProduct(data),
    onSuccess: (result, variables) => {
      if (result.success) {
        toast.success("Produto atualizado com sucesso!");
        // Invalida lista E detalhe específico
        queryClient.invalidateQueries({ queryKey: ["products"] });
        queryClient.invalidateQueries({ queryKey: ["products", variables.id] });
      } else {
        toast.error(result.error || "Erro ao atualizar produto");
      }
    },
    onError: () => {
      toast.error("Erro ao atualizar produto");
    },
  });
}

// ============================================
// 3. HOOK PARA DELETAR
// ============================================

/**
 * Hook para deletar produto
 *
 * @example
 * const { mutate, isPending } = useDeleteProduct();
 *
 * const handleDelete = (id: string) => {
 *   if (confirm("Tem certeza?")) {
 *     mutate(id);
 *   }
 * };
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Produto excluído com sucesso!");
        queryClient.invalidateQueries({ queryKey: ["products"] });
      } else {
        toast.error(result.error || "Erro ao excluir produto");
      }
    },
    onError: () => {
      toast.error("Erro ao excluir produto");
    },
  });
}

// ============================================
// 4. HOOK COM CALLBACK PERSONALIZADO
// ============================================

interface UseCreateProductOptions {
  onSuccess?: (product: Product) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook com callbacks customizáveis
 *
 * @example
 * const { mutate } = useCreateProductWithCallbacks({
 *   onSuccess: (product) => {
 *     router.push(`/products/${product.id}`);
 *   },
 * });
 */
export function useCreateProductWithCallbacks(
  options?: UseCreateProductOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductInput) => createProduct(data),
    onSuccess: (result) => {
      if (result.success && result.data) {
        toast.success("Produto criado com sucesso!");
        queryClient.invalidateQueries({ queryKey: ["products"] });
        options?.onSuccess?.(result.data);
      } else {
        toast.error(result.error || "Erro ao criar produto");
      }
    },
    onError: (error) => {
      toast.error("Erro ao criar produto");
      options?.onError?.(error);
    },
  });
}
