// Common API response types
export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Base entity type
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}
