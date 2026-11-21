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

export type CustomerType = 'Regular' | 'VIP' | 'Repeat';
export type CustomerStatus = 'active' | 'inactive' | 'new';

export interface Customer {
  id: string;
  code: string;
  name: string;
  phone: string;
  email?: string;
  birthday?: string;
  anniversary?: string;
  branch_id: string;
  branch_name?: string;
  customer_type: CustomerType;
  status: CustomerStatus;
  consent: boolean;
  consent_source?: 'manual' | 'petpooja_import' | 'website_chat' | 'walkin' | string;
  consent_at?: string;
  opted_out_at?: string | null;
  total_purchases: number;
  order_count: number;
  avg_order_value?: number;
  last_interaction_at?: string;
  created_at: string;
  source?: string;
}

export interface ImportBatch {
  id: string;
  file_name: string;
  uploaded_by: string;
  uploaded_at: string;
  total: number;
  valid: number;
  created: number;
  updated: number;
  duplicates: number;
  invalid: number;
  status: 'completed' | 'failed' | 'processing';
  branch_id?: string | null;
  branch_name?: string | null;
  report_json?: Array<{
    name: string;
    phone: string;
    status: 'will_create' | 'will_update' | 'duplicate_skipped' | 'invalid_skipped';
    reason?: string;
  }>;
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
