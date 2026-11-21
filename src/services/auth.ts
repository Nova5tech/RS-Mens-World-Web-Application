import { apiClient } from '@/lib/apiClient';
import { mockDelay } from '@/mocks/mockAdapter';
import { User } from '@/types/models';
import { usersStorage } from '@/services/users';
import { branchesStorage } from '@/services/branches';

export const isUsingMocks = import.meta.env.VITE_USE_MOCKS !== 'false';

export interface AdminLoginCredentials {
  type: 'admin';
  email: string;
  password: string;
}

export interface BranchLoginCredentials {
  type: 'branch';
  branchId: string;
  pin: string;
}

export type LoginCredentials = AdminLoginCredentials | BranchLoginCredentials;

export interface AuthResponse {
  token: string;
  user: User;
}

/**
 * Perform login for Admin or Branch users
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  if (isUsingMocks) {
    await mockDelay(300);

    const users = await usersStorage.getAll();
    const branches = await branchesStorage.getAll();

    if (credentials.type === 'admin') {
      const normalizedEmail = credentials.email.trim().toLowerCase();
      const adminUser = users.find(
        (u) => u.role === 'super_admin' && u.email?.trim().toLowerCase() === normalizedEmail
      );

      if (!adminUser || adminUser.password !== credentials.password) {
        throw new Error('Invalid email or password');
      }

      if (!adminUser.is_active) {
        throw new Error('This account is currently deactivated. Please contact Head Office.');
      }

      // Update last login
      await usersStorage.update(adminUser.id, { last_login_at: new Date().toISOString() });

      const token = `mock_admin_token_${Date.now()}`;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('rs_current_user', JSON.stringify(adminUser));
      return { token, user: adminUser };
    }

    if (credentials.type === 'branch') {
      const branch = branches.find((b) => b.id === credentials.branchId);
      if (!branch) {
        throw new Error('Please select a valid branch');
      }

      if (!branch.is_active) {
        throw new Error('This branch is currently deactivated.');
      }

      const branchUser = users.find(
        (u) => u.branch_id === credentials.branchId && u.pin === credentials.pin.trim()
      );

      if (!branchUser) {
        throw new Error('Invalid PIN for the selected branch');
      }

      if (!branchUser.is_active) {
        throw new Error('This account is currently deactivated. Please contact Head Office.');
      }

      // Ensure branch_name is populated
      const fullBranchUser: User = {
        ...branchUser,
        branch_name: branch.name,
      };

      // Update last login
      await usersStorage.update(branchUser.id, { last_login_at: new Date().toISOString() });

      const token = `mock_branch_token_${branch.code}_${Date.now()}`;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('rs_current_user', JSON.stringify(fullBranchUser));
      return { token, user: fullBranchUser };
    }

    throw new Error('Unsupported login type');
  }

  // Real API implementation
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
  const { token, user } = response.data;
  localStorage.setItem('auth_token', token);
  localStorage.setItem('rs_current_user', JSON.stringify(user));
  return response.data;
}

/**
 * Log out current session
 */
export async function logout(): Promise<void> {
  const token = localStorage.getItem('auth_token');

  if (isUsingMocks) {
    await mockDelay(150);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('rs_current_user');
    return;
  }

  try {
    if (token) {
      await apiClient.post('/auth/logout');
    }
  } catch (err) {
    console.error('Logout error on server', err);
  } finally {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('rs_current_user');
  }
}

/**
 * Retrieve current logged in user
 */
export async function getCurrentUser(): Promise<User | null> {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    localStorage.removeItem('rs_current_user');
    return null;
  }

  if (isUsingMocks) {
    const raw = localStorage.getItem('rs_current_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  try {
    const response = await apiClient.get<User>('/auth/me');
    localStorage.setItem('rs_current_user', JSON.stringify(response.data));
    return response.data;
  } catch (err) {
    console.error('Failed to get current user from API', err);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('rs_current_user');
    return null;
  }
}
