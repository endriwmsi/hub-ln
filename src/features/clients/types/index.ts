export type ClientStatus = "aguardando" | "baixas_completas" | "baixas_negadas";

export type Client = {
  nome: string;
  documento: string;
  status: ClientStatus;
  observacao?: string;
  processedAt?: string;
  extracted?: boolean;
  extractedAt?: string;
  // Metadados do service request
  serviceRequestId: string;
  serviceTitle: string;
  serviceId: string;
  acaoNome?: string;
  acaoId?: string;
  userName: string;
  userId: string;
  userEmail: string;
  paid: boolean;
  paidAt: Date | null;
  createdAt: Date;
  totalPrice: string;
};

export type ClientFilters = {
  search?: string[];
  status?: ClientStatus | "all";
  serviceId?: string;
  userId?: string;
  paid?: boolean | "all";
  page: number;
  pageSize: number;
};

export type ClientsResponse = {
  clients: Client[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};
