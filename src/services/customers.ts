import { apiClient } from '@/lib/apiClient';
import { MockStorage, mockDelay } from '@/mocks/mockAdapter';
import { INITIAL_CUSTOMERS } from '@/mocks/data/customers';
import { INITIAL_IMPORT_BATCHES } from '@/mocks/data/imports';
import { Customer, ImportBatch, CustomerType, PaginatedResponse } from '@/types/models';
import { getCurrentUser } from '@/services/auth';
import { branchesStorage } from '@/services/branches';

export const customersStorage = new MockStorage<Customer>('customers', INITIAL_CUSTOMERS);
export const importsStorage = new MockStorage<ImportBatch>('import_batches', INITIAL_IMPORT_BATCHES);
export const isUsingMocks = import.meta.env.VITE_USE_MOCKS !== 'false';

export interface CustomerQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  branchId?: string;
  consent?: 'all' | 'yes' | 'no';
  type?: 'all' | 'Regular' | 'VIP' | 'Repeat';
  status?: 'all' | 'active' | 'inactive' | 'new';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  birthdayMonth?: number;
  anniversaryMonth?: number;
  source?: string;
}

export interface CustomerCounts {
  all: number;
  new: number;
  active: number;
  inactive: number;
}

/**
 * Get paginated customers with server/mock filtering
 */
export async function getCustomers(
  params: CustomerQueryParams = {}
): Promise<PaginatedResponse<Customer>> {
  const currentUser = await getCurrentUser();

  if (isUsingMocks) {
    await mockDelay(250);
    let all = await customersStorage.getAll();

    // Enforce branch isolation rule: branch_user can ONLY see their own branch
    if (currentUser?.role === 'branch_user' && currentUser.branch_id) {
      all = all.filter((c) => c.branch_id === currentUser.branch_id);
    } else if (params.branchId && params.branchId !== 'all') {
      all = all.filter((c) => c.branch_id === params.branchId);
    }

    // Status filter
    if (params.status && params.status !== 'all') {
      all = all.filter((c) => c.status === params.status);
    }

    // Consent filter
    if (params.consent && params.consent !== 'all') {
      const boolConsent = params.consent === 'yes';
      all = all.filter((c) => c.consent === boolConsent);
    }

    // Customer type filter
    if (params.type && params.type !== 'all') {
      all = all.filter((c) => c.customer_type === params.type);
    }

    // Birthday month filter (1-12)
    if (params.birthdayMonth) {
      all = all.filter((c) => {
        if (!c.birthday) return false;
        const m = new Date(c.birthday).getMonth() + 1;
        return m === params.birthdayMonth;
      });
    }

    // Anniversary month filter (1-12)
    if (params.anniversaryMonth) {
      all = all.filter((c) => {
        if (!c.anniversary) return false;
        const m = new Date(c.anniversary).getMonth() + 1;
        return m === params.anniversaryMonth;
      });
    }

    // Source filter
    if (params.source && params.source !== 'all') {
      all = all.filter((c) => c.source?.toLowerCase().includes(params.source!.toLowerCase()));
    }

    // Search query
    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      all = all.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          (c.email && c.email.toLowerCase().includes(q))
      );
    }

    // Sorting
    const sortBy = params.sortBy || 'last_interaction_at';
    const sortOrder = params.sortOrder || 'desc';

    all.sort((a, b) => {
      let aVal = (a as unknown as Record<string, unknown>)[sortBy];
      let bVal = (b as unknown as Record<string, unknown>)[sortBy];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string)?.toLowerCase() || '';
      }

      if (aVal === bVal) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    const page = Math.max(1, params.page || 1);
    const pageSize = Math.max(1, params.pageSize || 20);
    const total = all.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const items = all.slice(start, start + pageSize);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  const response = await apiClient.get<PaginatedResponse<Customer>>('/customers', {
    params,
  });
  return response.data;
}

/**
 * Get Tab Counts for All, New, Active, Inactive
 */
export async function getCustomerCounts(branchId?: string): Promise<CustomerCounts> {
  const currentUser = await getCurrentUser();

  if (isUsingMocks) {
    let all = await customersStorage.getAll();

    if (currentUser?.role === 'branch_user' && currentUser.branch_id) {
      all = all.filter((c) => c.branch_id === currentUser.branch_id);
    } else if (branchId && branchId !== 'all') {
      all = all.filter((c) => c.branch_id === branchId);
    }

    const counts: CustomerCounts = {
      all: all.length,
      new: all.filter((c) => c.status === 'new').length,
      active: all.filter((c) => c.status === 'active').length,
      inactive: all.filter((c) => c.status === 'inactive').length,
    };

    return counts;
  }

  const response = await apiClient.get<CustomerCounts>('/customers/counts', {
    params: { branchId },
  });
  return response.data;
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  if (isUsingMocks) {
    return customersStorage.getById(id);
  }

  const response = await apiClient.get<Customer>(`/customers/${id}`);
  return response.data;
}

export async function createCustomer(
  data: Omit<Customer, 'id' | 'code' | 'created_at' | 'total_purchases' | 'order_count'>
): Promise<Customer> {
  const idNum = Math.floor(10000 + Math.random() * 90000);
  const branches = await branchesStorage.getAll();
  const branchObj = branches.find((b) => b.id === data.branch_id);

  const newCustomer: Customer = {
    ...data,
    id: `cust_${idNum}`,
    code: `C-${idNum}`,
    branch_name: branchObj?.name || 'Main Branch',
    total_purchases: 0,
    order_count: 0,
    avg_order_value: 0,
    created_at: new Date().toISOString(),
    last_interaction_at: new Date().toISOString(),
    status: 'new',
    consent_at: data.consent ? new Date().toISOString() : undefined,
    consent_source: data.consent ? (data.consent_source || 'manual') : undefined,
  };

  if (isUsingMocks) {
    // Unique phone validation in mock
    const existing = await customersStorage.getAll();
    const duplicate = existing.find((c) => c.phone === data.phone);
    if (duplicate) {
      throw new Error(`Customer with mobile number ${data.phone} already exists.`);
    }
    return customersStorage.insert(newCustomer);
  }

  const response = await apiClient.post<Customer>('/customers', data);
  return response.data;
}

export async function updateCustomer(
  id: string,
  updates: Partial<Customer>
): Promise<Customer | null> {
  if (isUsingMocks) {
    return customersStorage.update(id, updates);
  }

  const response = await apiClient.patch<Customer>(`/customers/${id}`, updates);
  return response.data;
}

export async function deleteCustomer(id: string): Promise<boolean> {
  if (isUsingMocks) {
    return customersStorage.delete(id);
  }

  await apiClient.delete(`/customers/${id}`);
  return true;
}

export async function markCustomerOptedOut(id: string): Promise<Customer | null> {
  const updates: Partial<Customer> = {
    consent: false,
    opted_out_at: new Date().toISOString(),
  };

  if (isUsingMocks) {
    return customersStorage.update(id, updates);
  }

  const response = await apiClient.patch<Customer>(`/customers/${id}`, updates);
  return response.data;
}

export async function bulkUpdateCustomerType(
  ids: string[],
  customer_type: CustomerType
): Promise<void> {
  if (isUsingMocks) {
    for (const id of ids) {
      await customersStorage.update(id, { customer_type });
    }
    return;
  }

  await apiClient.post('/customers/bulk-update-type', { ids, customer_type });
}

export async function bulkOptOutCustomers(ids: string[]): Promise<void> {
  if (isUsingMocks) {
    const now = new Date().toISOString();
    for (const id of ids) {
      await customersStorage.update(id, { consent: false, opted_out_at: now });
    }
    return;
  }

  await apiClient.post('/customers/bulk-opt-out', { ids });
}

export async function bulkUpsertCustomers(
  items: Array<{
    name: string;
    phone: string;
    email?: string;
    branch_id: string;
    birthday?: string;
    anniversary?: string;
    total_purchases?: number;
    order_count?: number;
    consent?: boolean;
  }>,
  batchMeta: {
    fileName: string;
    uploadedBy: string;
    report: Array<{
      name: string;
      phone: string;
      status: 'will_create' | 'will_update' | 'duplicate_skipped' | 'invalid_skipped';
      reason?: string;
    }>;
  }
): Promise<ImportBatch> {
  if (isUsingMocks) {
    await mockDelay(600);
    const existing = await customersStorage.getAll();
    const branches = await branchesStorage.getAll();

    let createdCount = 0;
    let updatedCount = 0;

    for (const item of items) {
      const matchIndex = existing.findIndex((c) => c.phone === item.phone);
      const branchObj = branches.find((b) => b.id === item.branch_id);

      if (matchIndex >= 0) {
        // Update existing customer
        const current = existing[matchIndex];
        const updatedPurchases = (current.total_purchases || 0) + (item.total_purchases || 0);
        const updatedOrders = (current.order_count || 0) + (item.order_count || 0);
        const avg = updatedOrders > 0 ? Math.round(updatedPurchases / updatedOrders) : 0;

        await customersStorage.update(current.id, {
          name: item.name || current.name,
          email: item.email || current.email,
          total_purchases: updatedPurchases,
          order_count: updatedOrders,
          avg_order_value: avg,
          last_interaction_at: new Date().toISOString(),
        });
        updatedCount++;
      } else {
        // Create new customer
        const idNum = Math.floor(10000 + Math.random() * 90000);
        const newCust: Customer = {
          id: `cust_${idNum}`,
          code: `C-${idNum}`,
          name: item.name,
          phone: item.phone,
          email: item.email,
          birthday: item.birthday,
          anniversary: item.anniversary,
          branch_id: item.branch_id,
          branch_name: branchObj?.name || 'Main Branch',
          customer_type: 'Regular',
          status: 'new',
          consent: item.consent ?? true,
          consent_source: 'petpooja_import',
          consent_at: new Date().toISOString(),
          total_purchases: item.total_purchases || 0,
          order_count: item.order_count || 0,
          avg_order_value:
            item.order_count && item.total_purchases
              ? Math.round(item.total_purchases / item.order_count)
              : 0,
          created_at: new Date().toISOString(),
          last_interaction_at: new Date().toISOString(),
          source: 'Petpooja Import',
        };
        await customersStorage.insert(newCust);
        createdCount++;
      }
    }

    const newBatch: ImportBatch = {
      id: `batch_${Date.now()}`,
      file_name: batchMeta.fileName,
      uploaded_by: batchMeta.uploadedBy,
      uploaded_at: new Date().toISOString(),
      total: batchMeta.report.length,
      valid: createdCount + updatedCount,
      created: createdCount,
      updated: updatedCount,
      duplicates: batchMeta.report.filter((r) => r.status === 'duplicate_skipped').length,
      invalid: batchMeta.report.filter((r) => r.status === 'invalid_skipped').length,
      status: 'completed',
      report_json: batchMeta.report,
    };

    await importsStorage.insert(newBatch);
    return newBatch;
  }

  const response = await apiClient.post<ImportBatch>('/customers/bulk-upsert', {
    items,
    batchMeta,
  });
  return response.data;
}

export async function getImportBatches(): Promise<ImportBatch[]> {
  if (isUsingMocks) {
    return importsStorage.getAll();
  }

  const response = await apiClient.get<ImportBatch[]>('/imports');
  return response.data;
}

export async function getImportBatchById(id: string): Promise<ImportBatch | null> {
  if (isUsingMocks) {
    return importsStorage.getById(id);
  }

  const response = await apiClient.get<ImportBatch>(`/imports/${id}`);
  return response.data;
}
