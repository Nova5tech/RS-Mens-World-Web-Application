import { apiClient } from '@/lib/apiClient';
import { MockStorage } from '@/mocks/mockAdapter';
import { INITIAL_BRANCHES } from '@/mocks/data/branches';
import { Branch } from '@/types/models';

export const branchesStorage = new MockStorage<Branch>('branches', INITIAL_BRANCHES);
export const isUsingMocks = import.meta.env.VITE_USE_MOCKS !== 'false';

export async function getBranches(): Promise<Branch[]> {
  if (isUsingMocks) {
    return branchesStorage.getAll();
  }

  const response = await apiClient.get<Branch[]>('/branches');
  return response.data;
}

export async function getBranchById(id: string): Promise<Branch | null> {
  if (isUsingMocks) {
    return branchesStorage.getById(id);
  }

  const response = await apiClient.get<Branch>(`/branches/${id}`);
  return response.data;
}

export async function createBranch(data: Omit<Branch, 'id'>): Promise<Branch> {
  const newBranch: Branch = {
    ...data,
    id: `branch_${Date.now()}`,
  };

  if (isUsingMocks) {
    return branchesStorage.insert(newBranch);
  }

  const response = await apiClient.post<Branch>('/branches', data);
  return response.data;
}

export async function updateBranch(id: string, updates: Partial<Branch>): Promise<Branch | null> {
  if (isUsingMocks) {
    return branchesStorage.update(id, updates);
  }

  const response = await apiClient.patch<Branch>(`/branches/${id}`, updates);
  return response.data;
}

export async function toggleBranchStatus(id: string, is_active: boolean): Promise<Branch | null> {
  return updateBranch(id, { is_active });
}
