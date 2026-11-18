import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService.js';

const AuthContext = createContext(null);

export const ROLES = {
  SUPER_ADMIN: 'admin',
  BRANCH_USER: 'branch_user',
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Initialize session on mount
  useEffect(() => {
    let isMounted = true;
    async function initSession() {
      try {
        const user = await authService.getCurrentUser();
        if (isMounted) {
          if (user) {
            setCurrentUser(user);
          } else {
            setCurrentUser(null);
          }
        }
      } catch (err) {
        console.error('Session initialization error:', err);
        if (isMounted) setCurrentUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    initSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async ({ accountId, pin }) => {
    const result = await authService.login({ accountId, pin });
    setCurrentUser(result.user);
    setSessionExpired(false);
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setCurrentUser(null);
      setSessionExpired(false);
    }
  }, []);

  const handleSessionTimeout = useCallback(() => {
    setCurrentUser(null);
    setSessionExpired(true);
  }, []);

  const value = {
    currentUser,
    isAuthenticated: Boolean(currentUser),
    isAdmin: currentUser?.role === ROLES.SUPER_ADMIN,
    isBranchUser: currentUser?.role === ROLES.BRANCH_USER,
    loading,
    sessionExpired,
    login,
    logout,
    handleSessionTimeout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
