import { USE_MOCKS, apiClient } from './apiClient.js';
import { mockStorage, delay } from '../mocks/mockStorage.js';

export const transferService = {
  async getTransfers(filters = {}) {
    if (USE_MOCKS) {
      await delay(120);
      let transfers = mockStorage.getTransfers();

      if (filters.branchId && filters.branchId !== 'ALL') {
        transfers = transfers.filter(
          t => t.from === filters.branchId || t.to === filters.branchId
        );
      }
      if (filters.status && filters.status !== 'ALL') {
        transfers = transfers.filter(t => t.status === filters.status);
      }
      return transfers;
    }
    const params = new URLSearchParams(filters);
    return apiClient(`/transfers?${params.toString()}`);
  },

  async createTransfer(transferData) {
    if (USE_MOCKS) {
      await delay(200);
      return mockStorage.createTransfer(transferData);
    }
    return apiClient('/transfers', {
      method: 'POST',
      body: JSON.stringify(transferData),
    });
  },

  async updateTransferStatus(id, newStatus, extra = {}) {
    if (USE_MOCKS) {
      await delay(200);
      return mockStorage.updateTransferStatus(id, newStatus, extra);
    }
    return apiClient(`/transfers/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus, ...extra }),
    });
  },
};
