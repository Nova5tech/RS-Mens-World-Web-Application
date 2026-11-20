import { USE_MOCKS, apiClient } from './apiClient.js';
import { mockStorage, delay } from '../mocks/mockStorage.js';
import { CANONICAL_BRANCHES, getBranchById, getBranchDisplayName, getBranchShortName } from '../config/branchConfig.js';

export { CANONICAL_BRANCHES, getBranchById, getBranchDisplayName, getBranchShortName };

export const branchService = {
  async getBranches() {
    if (USE_MOCKS) {
      await delay(120);
      return mockStorage.getBranches();
    }
    return apiClient('/branches');
  },

  async updateBranch(id, updates) {
    if (USE_MOCKS) {
      await delay(150);
      const branches = mockStorage.getBranches();
      const updated = branches.map(b => (b.id === id ? { ...b, ...updates } : b));
      mockStorage.saveBranches(updated);
      return updated.find(b => b.id === id);
    }
    return apiClient(`/branches/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async toggleBranch(id, enabled) {
    return this.updateBranch(id, { enabled });
  },
};
