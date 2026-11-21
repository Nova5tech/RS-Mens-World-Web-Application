import { apiClient } from '@/lib/apiClient';
import { MockStorage } from '@/mocks/mockAdapter';
import { INITIAL_USERS } from '@/mocks/data/users';
import { User } from '@/types/models';

export const usersStorage = new MockStorage<User>('users', INITIAL_USERS);
export const isUsingMocks = import.meta.env.VITE_USE_MOCKS !== 'false';

export async function getUsers(): Promise<User[]> {
  if (isUsingMocks) {
    return usersStorage.getAll();
  }

  const response = await apiClient.get<User[]>('/users');
  return response.data;
}

export async function getUserById(id: string): Promise<User | null> {
  if (isUsingMocks) {
    return usersStorage.getById(id);
  }

  const response = await apiClient.get<User>(`/users/${id}`);
  return response.data;
}

export async function createUser(data: Omit<User, 'id'>): Promise<User> {
  const newUser: User = {
    ...data,
    id: `user_${Date.now()}`,
    last_login_at: null,
  };

  if (isUsingMocks) {
    return usersStorage.insert(newUser);
  }

  const response = await apiClient.post<User>('/users', data);
  return response.data;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  if (isUsingMocks) {
    return usersStorage.update(id, updates);
  }

  const response = await apiClient.patch<User>(`/users/${id}`, updates);
  return response.data;
}

export async function resetCredential(id: string): Promise<{ newCredential: string; type: 'password' | 'pin' }> {
  if (isUsingMocks) {
    const user = await usersStorage.getById(id);
    if (!user) throw new Error('User not found');

    if (user.role === 'super_admin') {
      const newPassword = `Admin@${Math.floor(100 + Math.random() * 900)}`;
      await usersStorage.update(id, { password: newPassword });
      return { newCredential: newPassword, type: 'password' };
    } else {
      const newPin = `${Math.floor(1000 + Math.random() * 9000)}`;
      await usersStorage.update(id, { pin: newPin });
      return { newCredential: newPin, type: 'pin' };
    }
  }

  const response = await apiClient.post<{ newCredential: string; type: 'password' | 'pin' }>(
    `/users/${id}/reset-credential`
  );
  return response.data;
}
