import { USE_MOCKS, apiClient } from './apiClient.js';
import { mockStorage, delay } from '../mocks/mockStorage.js';

export const auditService = {
  async getAuditLogs(filters = {}) {
    if (USE_MOCKS) {
      await delay(120);
      let logs = mockStorage.getAuditLogs();

      if (filters.branchId && filters.branchId !== 'ALL') {
        logs = logs.filter(l => l.branch === filters.branchId || l.branch === 'ALL');
      }

      if (filters.search) {
        const q = filters.search.toLowerCase();
        logs = logs.filter(
          l =>
            l.action.toLowerCase().includes(q) ||
            l.detail.toLowerCase().includes(q) ||
            l.user.toLowerCase().includes(q)
        );
      }

      return logs;
    }

    const params = new URLSearchParams(filters);
    return apiClient(`/audit?${params.toString()}`);
  },

  async logAction(entry) {
    if (USE_MOCKS) {
      return mockStorage.addAuditLog(entry);
    }

    return apiClient('/audit', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  },
};
