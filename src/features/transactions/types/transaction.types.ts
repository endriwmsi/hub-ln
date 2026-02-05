// Tipos de transação
export const transactionTypes = [
  "service_payment",
  "subscription",
  "commission",
  "withdrawal",
] as const;

export type TransactionType = (typeof transactionTypes)[number];

// Labels para tipos de transação
export const transactionTypeLabels: Record<TransactionType, string> = {
  service_payment: "Pagamento de Envio",
  subscription: "Assinatura",
  commission: "Comissão",
  withdrawal: "Saque",
};

// Cores para badges de tipo
export const transactionTypeColors: Record<TransactionType, string> = {
  service_payment:
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  subscription:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  commission:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  withdrawal:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
};

// Status de transação
export const transactionStatuses = [
  "pending",
  "paid",
  "available",
  "cancelled",
] as const;

export type TransactionStatus = (typeof transactionStatuses)[number];

// Labels para status
export const transactionStatusLabels: Record<TransactionStatus, string> = {
  pending: "Pendente",
  paid: "Pago",
  available: "Disponível",
  cancelled: "Cancelado",
};

// Cores para badges de status
export const transactionStatusColors: Record<TransactionStatus, string> = {
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  available:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

// Tipo unificado de transação
export type Transaction = {
  id: string;
  type: TransactionType;
  amount: string;
  status: string;
  description: string;
  createdAt: Date;
  availableAt?: Date | null; // Para comissões - quando fica disponível para saque
  relatedId?: string; // ID do serviceRequest, subscription ou commission relacionado
};

// Filtros de transação
export type TransactionFilters = {
  search?: string;
  type?: TransactionType | "all";
  status?: TransactionStatus | "all";
  page: number;
  pageSize: number;
};

// Resultado de listagem de transações
export type GetTransactionsResult = {
  data: Transaction[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

// Resumo de saldo
export type BalanceSummary = {
  availableBalance: string; // Disponível para saque (comissões com 7+ dias)
  pendingBalance: string; // Aguardando liberação (comissões com menos de 7 dias)
  totalWithdrawn: string; // Total já sacado
  totalEarned: string; // Total ganho em comissões
};
