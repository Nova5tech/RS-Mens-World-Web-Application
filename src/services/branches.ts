import { apiClient } from '@/lib/apiClient';
import { MockStorage } from '@/mocks/mockAdapter';
import { INITIAL_BRANCHES } from '@/mocks/data/branches';
import { Branch } from '@/types/models';

const branchesStorage = new MockStorage<Branch>('branches', INITIAL_BRANCHES);

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
