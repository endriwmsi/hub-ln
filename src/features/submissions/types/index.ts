import type { ServiceRequestStatus } from "@/features/service-requests/schemas";

export type GlobalStatus =
  | "aguardando"
  | "baixas_completas"
  | "baixas_parciais"
  | "baixas_negadas";

export type Submission = {
  id: string;
  quantity: number;
  totalPrice: string;
  status: ServiceRequestStatus;
  paid: boolean;
  paidAt: Date | null;
  createdAt: Date;
  globalStatus: GlobalStatus | null;
  service: {
    id: string;
    title: string;
    slug: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
  acao?: {
    id: string;
    nome: string;
  } | null;
};

export type SubmissionFilters = {
  search?: string;
  status?: ServiceRequestStatus | "all";
  serviceId?: string;
  paid?: "all" | "paid" | "unpaid";
  page: number;
  pageSize: number;
};

export type SubmissionsResponse = {
  submissions: Submission[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};
