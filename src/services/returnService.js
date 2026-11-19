import { USE_MOCKS, apiClient } from './apiClient.js';
import { mockStorage, delay } from '../mocks/mockStorage.js';

export const returnService = {
  async getReturns(filters = {}) {
    if (USE_MOCKS) {
      await delay(120);
      let returns = mockStorage.getReturns();
      if (filters.branchId && filters.branchId !== 'ALL') {
        returns = returns.filter(r => r.branch === filters.branchId);
      }
      return returns;
    }
    const params = new URLSearchParams(filters);
    return apiClient(`/returns?${params.toString()}`);
  },

  async processReturn(returnData) {
    if (USE_MOCKS) {
      await delay(250);
      return mockStorage.processReturn(returnData);
    }
    return apiClient('/returns', {
      method: 'POST',
      body: JSON.stringify(returnData),
    });
  },
};
