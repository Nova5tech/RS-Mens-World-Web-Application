import { apiClient } from '@/lib/apiClient';
import { mockDelay } from '@/mocks/mockAdapter';
import { User } from '@/types/models';
import { INITIAL_BRANCHES } from '@/mocks/data/branches';

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

// Mock users dictionary
interface MockBranchUserConfig {
  branchId: string;
  code: string;
  name: string;
  pin: string;
  userId: string;
  fullName: string;
}

const MOCK_BRANCH_USERS: MockBranchUserConfig[] = [
  {
    branchId: 'branch_1',
    code: 'B1',
    name: 'Rajahmundry Main Branch',
    pin: '1111',
    userId: 'user_b1',
    fullName: 'Rajahmundry Store Manager',
  },
  {
    branchId: 'branch_2',
    code: 'B2',
    name: 'Kakinada Branch',
    pin: '2222',
    userId: 'user_b2',
    fullName: 'Kakinada Store Manager',
  },
  {
    branchId: 'branch_3',
    code: 'B3',
    name: 'Vijayawada Branch',
    pin: '3333',
    userId: 'user_b3',
    fullName: 'Vijayawada Store Manager',
  },
  {
    branchId: 'branch_4',
    code: 'B4',
    name: 'Guntur Branch',
    pin: '4444',
    userId: 'user_b4',
    fullName: 'Guntur Store Manager',
  },
];

const MOCK_SUPER_ADMIN: User = {
  id: 'user_super_admin',
  full_name: 'Super Admin',
  role: 'super_admin',
  branch_id: null,
  branch_name: null,
  email: 'admin@rsmensworld.com',
  is_active: true,
};

/**
 * Perform login for Admin or Branch users
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  if (isUsingMocks) {
    await mockDelay(400);

    if (credentials.type === 'admin') {
      const normalizedEmail = credentials.email.trim().toLowerCase();
      if (
        normalizedEmail === 'admin@rsmensworld.com' &&
        credentials.password === 'Admin@123'
      ) {
        const token = `mock_admin_token_${Date.now()}`;
        const user = { ...MOCK_SUPER_ADMIN };
        localStorage.setItem('auth_token', token);
        localStorage.setItem('rs_current_user', JSON.stringify(user));
        return { token, user };
      }
      throw new Error('Invalid email or password');
    }

    if (credentials.type === 'branch') {
      const branchConfig = MOCK_BRANCH_USERS.find(
        (b) => b.branchId === credentials.branchId
      );

      if (!branchConfig) {
        throw new Error('Please select a valid branch');
      }

      if (branchConfig.pin !== credentials.pin.trim()) {
        throw new Error('Invalid PIN for the selected branch');
      }

      const branch = INITIAL_BRANCHES.find((b) => b.id === credentials.branchId);

      const user: User = {
        id: branchConfig.userId,
        full_name: branchConfig.fullName,
        role: 'branch_user',
        branch_id: branchConfig.branchId,
        branch_name: branch ? branch.name : branchConfig.name,
        is_active: true,
      };

      const token = `mock_branch_token_${branchConfig.code}_${Date.now()}`;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('rs_current_user', JSON.stringify(user));
      return { token, user };
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
    await mockDelay(200);
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
