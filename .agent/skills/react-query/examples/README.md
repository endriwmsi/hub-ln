# Exemplos de React Query

Esta pasta contém exemplos práticos de implementação do React Query seguindo os padrões deste projeto.

## Arquivos

| Arquivo                                              | Descrição                                                       |
| ---------------------------------------------------- | --------------------------------------------------------------- |
| [use-query-example.ts](./use-query-example.ts)       | Exemplo de hook para buscar dados                               |
| [use-mutation-example.ts](./use-mutation-example.ts) | Exemplo de hook para criar/atualizar dados                      |
| [component-example.tsx](./component-example.tsx)     | Exemplo de uso em componentes                                   |
| [advanced-patterns.ts](./advanced-patterns.ts)       | Padrões avançados: paginação, infiniteQuery, optimistic updates |

## Estrutura Recomendada

Para cada feature, crie hooks separados seguindo o padrão:

```
src/features/products/
├── actions.ts                    # Server Actions
├── schemas.ts                    # Tipos e validações
├── hooks/
│   ├── use-products.ts           # Lista produtos
│   ├── use-product.ts            # Busca produto por ID
│   ├── use-create-product.ts     # Cria produto
│   ├── use-update-product.ts     # Atualiza produto
│   └── use-delete-product.ts     # Deleta produto
└── components/
    ├── products-table.tsx
    └── product-form.tsx
```
