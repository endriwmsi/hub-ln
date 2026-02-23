# Feature: Clients Management

Sistema completo de gerenciamento de clientes com data-table do shadcn/ui, React Query e filtros persistentes na URL.

## 📁 Estrutura

```
src/features/clients/
├── actions/
│   ├── get-clients.ts       # Server Action para buscar clientes
│   └── index.ts
├── components/
│   ├── clients-table-container.tsx  # Container principal com React Query
│   ├── clients-table-filters.tsx    # Filtros da tabela
│   ├── columns.tsx                  # Definição das colunas
│   ├── data-table.tsx               # Tabela genérica com react-table
│   ├── data-table-pagination.tsx    # Paginação
│   ├── data-table-skeleton.tsx      # Loading skeleton
│   ├── tag-input.tsx                # Input com tags para busca múltipla
│   └── index.ts
├── hooks/
│   ├── use-client-filters.ts  # Hook para gerenciar filtros na URL
│   └── index.ts
├── types/
│   └── index.ts              # TypeScript types
└── index.ts                  # Public API
```

## 🎯 Funcionalidades

### Busca Múltipla com Tags

- Input que permite adicionar múltiplos nomes ou documentos como tags
- Pressione **Enter** para adicionar um termo de busca
- Clique no **X** para remover uma tag
- Pressione **Backspace** com input vazio para remover a última tag
- Evita duplicatas automaticamente

### Filtros Persistentes na URL

Todos os filtros são armazenados como query parameters:

- `?search=nome1,nome2,cpf` - Termos de busca (separados por vírgula)
- `?status=aguardando` - Status do cliente
- `?serviceId=xyz` - Filtrar por serviço
- `?userId=abc` - Filtrar por usuário (admin apenas)
- `?paid=true` - Filtrar por pagamento
- `?page=2&pageSize=20` - Paginação

### React Query

- Auto-refetch a cada **30 segundos**
- Cache automático
- Loading states
- Error handling

### Permissões

- **Admin**: Vê todos os clientes de todos os usuários
- **Usuário normal**: Vê apenas seus próprios clientes

## 📊 Fonte de Dados

Os clientes são extraídos do campo `itemsStatus` (JSONB) da tabela `service_request`. Cada item contém:

```typescript
{
  nome: string;
  documento: string;
  status: "aguardando" | "baixas_completas" | "baixas_negadas";
  observacao?: string;
  processedAt?: string;
  extracted?: boolean;
  extractedAt?: string;
}
```

## 🚀 Como Usar

### Na Página

```tsx
import { ClientsTableContainer } from "@/features/clients";
import { getServices } from "@/features/services/actions";
import { getUsers } from "@/features/users/actions";

export default async function Page() {
  const services = await getServices();
  const users = await getUsers({ page: 1, pageSize: 1000 });

  return (
    <ClientsTableContainer
      services={services}
      users={users.data?.users || []}
      isAdmin={true}
    />
  );
}
```

### Hook de Filtros

```tsx
import { useClientFilters } from "@/features/clients";

function MyComponent() {
  const { filters, updateFilters, resetFilters } = useClientFilters();

  // Adicionar termo de busca
  updateFilters({
    search: [...filters.search, "João Silva"],
    page: 1,
  });

  // Alterar status
  updateFilters({ status: "baixas_completas", page: 1 });

  // Limpar todos os filtros
  resetFilters();
}
```

## 🎨 Componentes

### TagInput

Input customizado que suporta múltiplas tags:

```tsx
<TagInput
  value={["Maria", "12345678900"]}
  onChange={(tags) => console.log(tags)}
  placeholder="Digite e pressione Enter..."
/>
```

### ClientsTableContainer

Container principal que integra todos os componentes:

```tsx
<ClientsTableContainer
  services={services} // Lista de serviços para filtro
  users={users} // Lista de usuários (admin apenas)
  isAdmin={isAdmin} // Se é admin
/>
```

## 🔍 Colunas da Tabela

1. **Nome** - Nome do cliente
2. **Documento** - CPF/CNPJ
3. **Status** - Badge colorido (Aguardando, Completo, Negado)
4. **Serviço** - Título do serviço
5. **Ação** - Nome da ação (se aplicável)
6. **Usuário** - Nome e email do usuário que enviou
7. **Pagamento** - Ícone indicando se foi pago
8. **Data de Envio** - Quando foi criado o service request
9. **Processado em** - Quando o item foi processado
10. **Observação** - Nota sobre o processamento
11. **Ações** - Link para ver o envio completo

## 🎨 Cores dos Status

```typescript
{
  aguardando: {
    label: "Aguardando",
    variant: "secondary",
    icon: Hourglass
  },
  baixas_completas: {
    label: "Completo",
    variant: "default",
    icon: Check
  },
  baixas_negadas: {
    label: "Negado",
    variant: "destructive",
    icon: XCircle
  }
}
```

## 📱 Responsividade

- Layout mobile-first
- Filtros empilham em telas pequenas
- Tabela com scroll horizontal se necessário
- Paginação adaptativa

## 🔄 Refetch

A tabela refaz a query automaticamente:

- A cada **30 segundos** (refetchInterval)
- Quando os filtros mudam (queryKey)
- Quando a janela volta ao foco (por padrão do React Query)

## 🧪 Exemplo de Uso da Action

```typescript
const result = await getClients({
  search: ["João", "12345678900"],
  status: "baixas_completas",
  serviceId: "service-id",
  paid: true,
  page: 1,
  pageSize: 20,
});

if (result.success) {
  const { clients, pagination } = result.data;
  console.log(`Total: ${pagination.total} clientes`);
}
```

## 📝 Notas de Implementação

1. **Paginação Manual**: Como os dados vêm de um campo JSONB, a paginação é feita após extrair todos os itens
2. **Performance**: Para grandes volumes, considere criar uma view materializada no banco
3. **Cache**: React Query mantém os dados em cache durante 30 segundos
4. **URL State**: Todos os filtros são sincronizados com a URL para compartilhamento e histórico

## 🚦 Rotas

- `/gerenciar-clientes` - Página principal (admin)
- `/envios/[id]` - Link para ver o envio completo de cada cliente
