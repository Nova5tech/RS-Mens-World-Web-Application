export type UserRole = 'super_admin' | 'branch_user';

export interface Branch {
  id: string;
  code: string;
  name: string;
  city: string;
  address: string;
  timings?: string;
  wa_phone_id?: string;
  is_active: boolean;
}

export interface User {
  id: string;
  full_name: string;
  role: UserRole;
  branch_id?: string | null;
  branch_name?: string | null;
  email?: string;
  avatar?: string;
  is_active: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Array<{ field: string; message: string }>;
}
