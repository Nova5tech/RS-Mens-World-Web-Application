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

export type MediaKind = 'Offer' | 'New Arrival' | 'Festival' | 'Greeting';

export interface MediaAsset {
  id: string;
  title: string;
  kind: MediaKind;
  storage_path: string;
  uploaded_by: string;
  created_at: string;
}

export type TemplateCategory =
  | 'Promotional'
  | 'Greeting'
  | 'Festival'
  | 'Birthday'
  | 'Anniversary'
  | 'Announcement'
  | 'Loyalty';

export type MetaTemplateStatus = 'Approved' | 'Pending' | 'Rejected';

export interface MessageTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  body: string;
  variables: string[];
  header_image_url?: string;
  cta_text?: string;
  cta_url?: string;
  meta_template_name: string;
  meta_status: MetaTemplateStatus;
  created_at: string;
}

export interface SegmentRules {
  branch_id?: string | null;
  birthday_month?: number | null;
  anniversary_month?: number | null;
  customer_type?: CustomerType | 'all';
  customer_status?: CustomerStatus | 'all';
  opted_in_only: boolean;
}

export interface Segment {
  id: string;
  name: string;
  rules_json: SegmentRules;
  customer_count?: number;
  branch_counts?: Record<string, number>;
  created_at: string;
}

export type CampaignType = 'Promotional' | 'Announcement' | 'Loyalty' | 'Greeting';
export type CampaignStatus = 'Draft' | 'Scheduled' | 'Sending' | 'Sent' | 'Failed';

export interface CampaignStats {
  total: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
}

export interface Campaign {
  id: string;
  code: string;
  name: string;
  type: CampaignType;
  template_id: string;
  template_name?: string;
  media_id?: string;
  media_url?: string;
  segment_id?: string;
  segment_name?: string;
  branches: string[];
  branch_codes: string[];
  audience_count: number;
  status: CampaignStatus;
  scheduled_at?: string | null;
  sent_at?: string | null;
  created_at: string;
  created_by: string;
  variables?: Record<string, string>;
  stats?: CampaignStats;
}

export type MessageDeliveryStatus = 'queued' | 'sent' | 'delivered' | 'read' | 'failed';

export interface CampaignMessage {
  id: string;
  campaign_id: string;
  customer_id: string;
  customer_name: string;
  phone: string;
  branch_id: string;
  branch_code: string;
  status: MessageDeliveryStatus;
  error?: string;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
}

export interface CampaignSettings {
  allow_branch_campaigns: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
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
