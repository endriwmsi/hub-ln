## 🔄 React Query Pattern

### Hook de Query com Auto-Refetch

```typescript
// features/commissions/hooks/use-commissions.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { getCommissions } from "../actions";

export function useCommissions() {
  return useQuery({
    queryKey: ["commissions"],
    queryFn: getCommissions,
    refetchInterval: 30000, // 30 segundos (requisito para página de transações)
    staleTime: 20000,
  });
}
```

### Hook de Mutation

```typescript
// features/commissions/hooks/use-request-withdrawal.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { requestWithdrawal } from "../actions";
import { toast } from "sonner";

export function useRequestWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requestWithdrawal,
    onSuccess: () => {
      toast.success("Solicitação de saque enviada!");
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
    },
    onError: (error) => {
      toast.error("Erro ao solicitar saque");
      console.error(error);
    },
  });
}
```

### Provider no Layout

```typescript
// core/providers/index.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
      staleTime: 60 * 1000, // 1 minuto
      retry: 1,
    },
  },
}));

return (
  <QueryClientProvider client={queryClient}>
    {children}
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
  );
}
```
