import { AuditLog } from '@/types/models';
import { getCurrentUser } from './auth';

const AUDIT_STORAGE_KEY = 'rs_audit_logs';

export const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'AUD-901',
    user_id: 'user_1',
    user_name: 'Bala (Super Admin)',
    user_role: 'super_admin',
    action: 'login',
    entity: 'auth',
    branch_id: 'all',
    branch_name: 'Head Office',
    details: 'Logged into Super Admin console from Chrome Windows',
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'AUD-902',
    user_id: 'user_1',
    user_name: 'Bala (Super Admin)',
    user_role: 'super_admin',
    action: 'campaign_send',
    entity: 'campaigns',
    entity_id: 'CMP-101',
    branch_id: 'branch_1',
    branch_name: 'Rajahmundry Main',
    details: 'Executed broadcast "Winter Collection Launch" targeting 2 branches (540 audience)',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'AUD-903',
    user_id: 'user_2',
    user_name: 'Ramesh Babu',
    user_role: 'branch_user',
    action: 'lead_stage_change',
    entity: 'leads',
    entity_id: 'L-3804',
    branch_id: 'branch_1',
    branch_name: 'Rajahmundry Main',
    details: 'Moved lead "K. Venkatesh" from In Progress to Follow-up',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'AUD-904',
    user_id: 'user_1',
    user_name: 'Bala (Super Admin)',
    user_role: 'super_admin',
    action: 'import',
    entity: 'customers',
    entity_id: 'batch_nov_pos',
    branch_id: 'all',
    branch_name: 'All Branches',
    details: 'Imported Petpooja POS export "petpooja_nov2026.xlsx": 48 created, 2 updated, 0 invalid',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'AUD-905',
    user_id: 'user_1',
    user_name: 'Bala (Super Admin)',
    user_role: 'super_admin',
    action: 'kb_edit',
    entity: 'kb',
    entity_id: 'kb_2',
    branch_id: 'all',
    branch_name: 'All Branches',
    details: 'Updated store timings & festival extended hours in Knowledge Base',
    created_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'AUD-906',
    user_id: 'user_3',
    user_name: 'Suresh Kumar',
    user_role: 'branch_user',
    action: 'lead_convert',
    entity: 'leads',
    entity_id: 'L-3808',
    branch_id: 'branch_2',
    branch_name: 'Kakinada Branch',
    details: 'Converted lead "Vikram Aditya" to registered customer profile (C-10042)',
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'AUD-907',
    user_id: 'user_1',
    user_name: 'Bala (Super Admin)',
    user_role: 'super_admin',
    action: 'user_create',
    entity: 'users',
    entity_id: 'user_5',
    branch_id: 'branch_4',
    branch_name: 'Guntur Branch',
    details: 'Created branch user account for Guntur Outlet Manager (PIN: 4444)',
    created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
  },
];

export interface AuditLogFilter {
  branchId?: string;
  action?: string;
  entity?: string;
  search?: string;
}

export const auditService = {
  getLogs: async (filter: AuditLogFilter = {}): Promise<AuditLog[]> => {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    let logs: AuditLog[] = raw ? JSON.parse(raw) : SEED_AUDIT_LOGS;
    if (!raw) {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(SEED_AUDIT_LOGS));
    }

    const currentUser = await getCurrentUser();
    if (currentUser?.role === 'branch_user' && currentUser.branch_id) {
      logs = logs.filter(
        (l) => l.branch_id === currentUser.branch_id || l.branch_id === 'all'
      );
    } else if (filter.branchId && filter.branchId !== 'all') {
      logs = logs.filter(
        (l) => l.branch_id === filter.branchId || l.branch_id === 'all'
      );
    }

    if (filter.action && filter.action !== 'all') {
      logs = logs.filter((l) => l.action === filter.action);
    }

    if (filter.entity && filter.entity !== 'all') {
      logs = logs.filter((l) => l.entity === filter.entity);
    }

    if (filter.search && filter.search.trim()) {
      const q = filter.search.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.user_name.toLowerCase().includes(q) ||
          l.details.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          (l.entity_id && l.entity_id.toLowerCase().includes(q))
      );
    }

    return logs.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  logAction: async (
    action: AuditLog['action'],
    entity: AuditLog['entity'],
    details: string,
    entityId?: string,
    branchId?: string,
    branchName?: string
  ): Promise<AuditLog> => {
    const currentUser = await getCurrentUser();
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    const logs: AuditLog[] = raw ? JSON.parse(raw) : SEED_AUDIT_LOGS;

    const newLog: AuditLog = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      user_id: currentUser?.id || 'sys',
      user_name: currentUser?.full_name || 'System Admin',
      user_role: currentUser?.role || 'super_admin',
      action,
      entity,
      entity_id: entityId,
      branch_id: branchId || currentUser?.branch_id || 'all',
      branch_name: branchName || currentUser?.branch_name || 'Head Office',
      details,
      created_at: new Date().toISOString(),
    };

    logs.unshift(newLog);
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs.slice(0, 100)));
    return newLog;
  },
};
