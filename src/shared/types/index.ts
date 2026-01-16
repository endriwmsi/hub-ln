// Shared types
export type UUID = string;

export type Timestamp = {
  createdAt: Date;
  updatedAt: Date;
};

export type PaginationParams = {
  page?: number;
  perPage?: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
