import { USE_MOCKS, apiClient } from './apiClient.js';
import { delay } from '../mocks/mockStorage.js';

const AUTH_STORAGE_KEY = 'rs_auth_session';

/**
 * SYNTHETIC DEMO ACCOUNTS
 * Exact match with the reference login design:
 * - Super Admin (All branches · Full access)
 * - Branch 1 User (Anna Nagar Branch)
 * - Branch 2 User (Kukatpally Branch)
 * - Branch 3 User (Madhapur Branch)
 * - Branch 4 User (Gachibowli Branch)
 */
export const SYNTHETIC_ACCOUNTS = [
  {
    id: 'acc-admin',
    name: 'Super Admin',
    staffName: 'Rajesh Sharma',
    title: 'Super Admin',
    email: 'admin@rsmensworld.com',
    role: 'admin',
    assignedBranchId: null,
    branchName: 'All Branches',
    displaySubtitle: 'All branches · Full access',
    demoPin: '1000',
    legacyPin: '1234',
    avatar: 'SA',
  },
  {
    id: 'acc-b1',
    name: 'Branch 1 User',
    staffName: 'Srinivas Varma',
    title: 'Branch 1 Manager',
    email: 'branch1@rsmensworld.com',
    role: 'branch_user',
    assignedBranchId: 'B1',
    branchName: 'Anna Nagar Branch',
    displaySubtitle: 'Anna Nagar Branch',
    demoPin: '1111',
    legacyPin: '1001',
    avatar: 'B1',
  },
  {
    id: 'acc-b2',
    name: 'Branch 2 User',
    staffName: 'Manoj Kumar',
    title: 'Branch 2 Manager',
    email: 'branch2@rsmensworld.com',
    role: 'branch_user',
    assignedBranchId: 'B2',
    branchName: 'Kukatpally Branch',
    displaySubtitle: 'Kukatpally Branch',
    demoPin: '2222',
    legacyPin: '1002',
    avatar: 'B2',
  },
  {
    id: 'acc-b3',
    name: 'Branch 3 User',
    staffName: 'Kiran Reddy',
    title: 'Branch 3 Manager',
    email: 'branch3@rsmensworld.com',
    role: 'branch_user',
    assignedBranchId: 'B3',
    branchName: 'Madhapur Branch',
    displaySubtitle: 'Madhapur Branch',
    demoPin: '3333',
    legacyPin: '1003',
    avatar: 'B3',
  },
  {
    id: 'acc-b4',
    name: 'Branch 4 User',
    staffName: 'Venkat Rao',
    title: 'Branch 4 Manager',
    email: 'branch4@rsmensworld.com',
    role: 'branch_user',
    assignedBranchId: 'B4',
    branchName: 'Gachibowli Branch',
    displaySubtitle: 'Gachibowli Branch',
    demoPin: '4444',
    legacyPin: '1004',
    avatar: 'B4',
  },
];

/**
 * Mock Auth Service implementation for prototype demonstration.
 */
const mockAuthService = {
  getDemoAccounts() {
    return SYNTHETIC_ACCOUNTS.map(({ demoPin, legacyPin, ...safeAccount }) => ({
      ...safeAccount,
      demoPinHint: demoPin,
    }));
  },

  async login({ accountId, pin }) {
    await delay(200);

    const account = SYNTHETIC_ACCOUNTS.find(a => a.id === accountId);
    if (!account) {
      throw new Error('Account not found. Please select an authorized account from the cards above.');
    }

    // Flexible testing PINs: accepts account demo PIN, legacy PIN, or common test PINs
    const validPins = [account.demoPin, account.legacyPin, '1234', '1000', '1111', '2222', '3333', '4444', '9999'];
    if (!validPins.includes(pin)) {
      throw new Error(`Invalid PIN entered. For demo testing of ${account.name}, use PIN: ${account.demoPin}`);
    }

    const { demoPin, legacyPin, ...user } = account;
    const session = {
      token: `mock-jwt-${account.role}-${Date.now()}`,
      user,
      expiresAt: Date.now() + 8 * 60 * 60 * 1000, // 8 hour session
    };

    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    } catch (e) {
      console.warn('Unable to persist session to localStorage', e);
    }

    return { token: session.token, user };
  },

  async getCurrentUser() {
    await delay(60);
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) return null;

      const session = JSON.parse(stored);
      if (session.expiresAt && Date.now() > session.expiresAt) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return null;
      }
      return session.user;
    } catch {
      return null;
    }
  },

  async logout() {
    await delay(80);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.warn('Error clearing session', e);
    }
    return { success: true };
  },
};

/**
 * Real Auth Service adapter for live REST backend.
 */
const realAuthService = {
  getDemoAccounts() {
    return [];
  },

  async login({ accountId, pin }) {
    const data = await apiClient('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ accountId, pin }),
    });
    if (data.token) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
    }
    return data;
  },

  async getCurrentUser() {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;
    const session = JSON.parse(stored);
    return apiClient('/auth/me', {
      headers: { Authorization: `Bearer ${session.token}` },
    });
  },

  async logout() {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const session = JSON.parse(stored);
        await apiClient('/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.token}` },
        });
      }
    } finally {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    return { success: true };
  },
};

export const authService = USE_MOCKS ? mockAuthService : realAuthService;
