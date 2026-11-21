export type UserRole = 'super_admin' | 'branch_user';

export interface Branch {
  id: string;
  code: string;
  name: string;
  city: string;
  address: string;
  phone?: string;
  timings?: string;
  wa_phone_id?: string;
  is_active: boolean;
  users_count?: number;
}

export interface User {
  id: string;
  full_name: string;
  role: UserRole;
  branch_id?: string | null;
  branch_name?: string | null;
  email?: string;
  pin?: string;
  password?: string;
  avatar?: string;
  is_active: boolean;
  last_login_at?: string | null;
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
