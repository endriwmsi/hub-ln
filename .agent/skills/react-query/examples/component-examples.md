/**
 * Exemplo: Uso de React Query em Componentes
 *
 * Demonstra como integrar os hooks em componentes React
 */

```typescript
"use client";

import { useState } from "react";
```

// Importar hooks personalizados
// import { useProducts } from "../hooks/use-products";
// import { useCreateProduct } from "../hooks/use-create-product";
// import { useDeleteProduct } from "../hooks/use-delete-product";

// ============================================
// TIPOS
// ============================================
```typescript
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
```
// ============================================
// 1. EXEMPLO: TABELA COM DADOS
// ============================================

/**
 * Componente que lista produtos com estados de loading/error
 */
```typescript
export function ProductsTable() {
  // Hook de query para buscar dados
  const { data: products, isLoading, error, refetch } = useProducts();

  // Hook de mutation para deletar
  const deleteMutation = useDeleteProduct();

  // Estado de loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="animate-spin">⏳</span>
        <span className="ml-2">Carregando produtos...</span>
      </div>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-red-700">
        <p>Erro ao carregar produtos: {error.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-2 text-sm underline hover:text-red-900"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  // Estado vazio
  if (!products || products.length === 0) {
    return (
      <div className="rounded-md bg-gray-50 p-8 text-center text-gray-500">
        Nenhum produto encontrado
      </div>
    );
  }

  // Renderizar tabela
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b bg-gray-100">
          <th className="p-3 text-left">Nome</th>
          <th className="p-3 text-left">Preço</th>
          <th className="p-3 text-left">Ações</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product: Product) => (
          <tr key={product.id} className="border-b hover:bg-gray-50">
            <td className="p-3">{product.name}</td>
            <td className="p-3">R$ {product.price.toFixed(2)}</td>
            <td className="p-3">
              <button
                onClick={() => {
                  if (confirm("Deseja excluir este produto?")) {
                    deleteMutation.mutate(product.id);
                  }
                }}
                disabled={deleteMutation.isPending}
                className="text-red-600 hover:text-red-800 disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}```

// ============================================
// 2. EXEMPLO: FORMULÁRIO COM MUTATION
// ============================================
```typescript
interface ProductFormProps {
  onSuccess?: () => void;
}```
/**
 * Formulário para criar produto usando mutation
 */
```typescript
export function ProductForm({ onSuccess }: ProductFormProps) {
  const [formData, setFormData] = useState<CreateProductInput>({
    name: "",
    price: 0,
    description: "",
  });

  // Hook de mutation para criar
  const createMutation = useCreateProduct();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createMutation.mutate(formData, {
      onSuccess: () => {
        // Limpar formulário após sucesso
        setFormData({ name: "", price: 0, description: "" });
        onSuccess?.();
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Nome
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 w-full rounded-md border p-2"
          required
        />
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium">
          Preço
        </label>
        <input
          id="price"
          type="number"
          step="0.01"
          value={formData.price}
          onChange={(e) =>
            setFormData({ ...formData, price: Number(e.target.value) })
          }
          className="mt-1 w-full rounded-md border p-2"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Descrição
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="mt-1 w-full rounded-md border p-2"
          rows={3}
        />
      </div>

      <button
        type="submit"
        disabled={createMutation.isPending}
        className="w-full rounded-md bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {createMutation.isPending ? "Criando..." : "Criar Produto"}
      </button>

      {/* Mostrar erro se houver */}
      {createMutation.isError && (
        <p className="text-sm text-red-600">
          Erro ao criar produto. Tente novamente.
        </p>
      )}
    </form>
  );
}```

// ============================================
// 3. EXEMPLO: PÁGINA COMPLETA
// ============================================

/**
 * Página que combina listagem e formulário
 */
```typescript
export function ProductsPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          {showForm ? "Cancelar" : "Novo Produto"}
        </button>
      </div>

      {/* Formulário condicional */}
      {showForm && (
        <div className="mb-6 rounded-lg border bg-white p-4 shadow">
          <h2 className="mb-4 text-lg font-semibold">Novo Produto</h2>
          <ProductForm onSuccess={() => setShowForm(false)} />
        </div>
      )}

      {/* Tabela de produtos */}
      <div className="rounded-lg border bg-white shadow">
        <ProductsTable />
      </div>
    </div>
  );
}```

// ============================================
// STUBS - Remover em uso real
// ============================================
```typescript
function useProducts() {
  return {
    data: [] as Product[],
    isLoading: false,
    error: null as Error | null,
    refetch: () => {},
  };
}

function useCreateProduct() {
  return {
    mutate: (
      _data: CreateProductInput,
      _options?: { onSuccess?: () => void },
    ) => {},
    isPending: false,
    isError: false,
  };
}

function useDeleteProduct() {
  return {
    mutate: (_id: string) => {},
    isPending: false,
  };
}
```;
