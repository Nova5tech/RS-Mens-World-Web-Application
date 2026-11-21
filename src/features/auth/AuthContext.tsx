import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole, Branch } from '@/types/models';
import {
  login as authLoginService,
  logout as authLogoutService,
  getCurrentUser,
  LoginCredentials,
} from '@/services/auth';
import { getBranches } from '@/services/branches';

export interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  branch: Branch | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth state from localStorage / service on mount
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const [currentUser, allBranches] = await Promise.all([
          getCurrentUser(),
          getBranches().catch(() => [] as Branch[]),
        ]);

        if (mounted) {
          setUser(currentUser);
          setBranches(allBranches);
        }
      } catch (err) {
        console.error('Error initializing auth state', err);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await authLoginService(credentials);
      setUser(response.user);
      // Also refresh branches if needed
      try {
        const branchList = await getBranches();
        setBranches(branchList);
      } catch {
        // branch fetch failure shouldn't block login
      }
      return response.user;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authLogoutService();
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const role = user?.role || null;
  const branch =
    user?.branch_id && branches.length > 0
      ? branches.find((b) => b.id === user.branch_id) || null
      : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        branch,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
