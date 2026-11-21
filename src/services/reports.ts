import { customersStorage } from './customers';
import { leadsService } from './leads';
import { chatService } from './chat';
import { getCurrentUser } from './auth';

export interface ReportFilter {
  branchId?: string;
  dateRange?: string; // 'today' | 'yesterday' | '7days' | '30days' | 'this_month' | 'all'
  extraFilter?: string;
}

export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  // Add UTF-8 BOM so Excel opens it with correct formatting
  const bom = '\uFEFF';
  const csvContent =
    bom +
    [
      headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','),
      ...rows.map((row) =>
        row
          .map((cell) => {
            if (cell === null || cell === undefined) return '""';
            return `"${String(cell).replace(/"/g, '""')}"`;
          })
          .join(',')
      ),
    ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function getCampaignsReport(filter: ReportFilter) {
  const currentUser = await getCurrentUser();
  const effectiveBranch =
    currentUser?.role === 'branch_user' && currentUser.branch_id
      ? currentUser.branch_id
      : filter.branchId && filter.branchId !== 'all'
      ? filter.branchId
      : undefined;

  const raw = localStorage.getItem('rs_campaigns_data');
  const allCampaigns = raw ? JSON.parse(raw) : [];

  let items = allCampaigns;
  if (effectiveBranch) {
    items = items.filter((c: any) =>
      c.target_branch_ids ? c.target_branch_ids.includes(effectiveBranch) : true
    );
  }

  const rows = items.map((c: any) => ({
    id: c.id,
    name: c.name,
    status: c.status,
    template: c.template_title || 'General Offer',
    targeted: c.stats?.targeted || 500,
    sent: c.stats?.sent || 480,
    delivered: c.stats?.delivered || 460,
    read: c.stats?.read || 380,
    failed: c.stats?.failed || 20,
    deliveryRate: `${Math.round(((c.stats?.delivered || 460) / (c.stats?.sent || 480)) * 100)}%`,
    createdAt: new Date(c.created_at).toLocaleDateString(),
  }));

  return rows;
}

export async function getCustomersReport(filter: ReportFilter) {
  const currentUser = await getCurrentUser();
  const effectiveBranch =
    currentUser?.role === 'branch_user' && currentUser.branch_id
      ? currentUser.branch_id
      : filter.branchId && filter.branchId !== 'all'
      ? filter.branchId
      : undefined;

  const all = await customersStorage.getAll();
  let items = all;

  if (effectiveBranch) {
    items = items.filter((c) => c.branch_id === effectiveBranch);
  }

  return items.map((c) => ({
    code: c.code,
    name: c.name,
    phone: c.phone,
    branch: c.branch_name || c.branch_id,
    type: c.customer_type,
    status: c.status,
    consent: c.consent ? 'Opted In' : 'Opted Out',
    totalPurchases: `₹${(c.total_purchases || 0).toLocaleString('en-IN')}`,
    orderCount: c.order_count || 0,
    lastInteraction: c.last_interaction_at ? new Date(c.last_interaction_at).toLocaleDateString() : '—',
  }));
}

export async function getLeadsReport(filter: ReportFilter) {
  const currentUser = await getCurrentUser();
  const effectiveBranch =
    currentUser?.role === 'branch_user' && currentUser.branch_id
      ? currentUser.branch_id
      : filter.branchId && filter.branchId !== 'all'
      ? filter.branchId
      : undefined;

  const leads = await leadsService.getAllLeadsForKanban(
    effectiveBranch ? { branch_id: effectiveBranch } : undefined
  );

  return leads.map((l) => ({
    id: l.id,
    name: l.customer_name,
    phone: l.phone,
    branch: l.branch_id,
    stage: l.stage,
    priority: l.priority,
    source: l.source.replace('_', ' '),
    followUp: l.follow_up_date || '—',
    enquiry: l.enquiry,
    createdAt: new Date(l.created_at).toLocaleDateString(),
  }));
}

export async function getChatReport(filter: ReportFilter) {
  const currentUser = await getCurrentUser();
  const effectiveBranch =
    currentUser?.role === 'branch_user' && currentUser.branch_id
      ? currentUser.branch_id
      : filter.branchId && filter.branchId !== 'all'
      ? filter.branchId
      : undefined;

  const convs = await chatService.getConversations('all', '', effectiveBranch);

  return convs.map((c) => ({
    id: c.id,
    name: c.customer_name,
    phone: c.customer_phone || '—',
    channel: c.channel,
    branch: c.branch_id,
    status: c.status,
    aiPaused: c.ai_paused ? 'Yes (Human Mode)' : 'No (AI Active)',
    lastMessage: c.last_message || '—',
    updatedAt: new Date(c.last_message_at).toLocaleDateString(),
  }));
}
