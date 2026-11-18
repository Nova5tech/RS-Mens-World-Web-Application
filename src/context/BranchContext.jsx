import React, { createContext, useContext, useState, useEffect } from 'react';
import { branchService } from '../services/branchService.js';
import { useAuth, ROLES } from './AuthContext.jsx';

const BranchContext = createContext(null);

export function BranchProvider({ children }) {
  const { currentUser, isBranchUser } = useAuth();
  const [branches, setBranches] = useState([]);
  const [activeBranchId, setActiveBranchIdState] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const data = await branchService.getBranches();
      setBranches(data);
    } catch (err) {
      console.error('Failed to load branches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  // Synchronize branch scope with authenticated user's role and assignment
  useEffect(() => {
    if (currentUser?.role === ROLES.BRANCH_USER && currentUser.assignedBranchId) {
      setActiveBranchIdState(currentUser.assignedBranchId);
    } else if (currentUser?.role === ROLES.SUPER_ADMIN) {
      // Super admin defaults to ALL if not already set
      setActiveBranchIdState(prev => (prev === 'ALL' || branches.some(b => b.id === prev) ? prev : 'ALL'));
    } else {
      setActiveBranchIdState('ALL');
    }
  }, [currentUser, branches]);

  const setActiveBranchId = (branchId) => {
    // Enforce branch boundary: Branch users cannot switch out of their assigned store
    if (isBranchUser) {
      console.warn('Branch Users are restricted to their assigned branch.');
      return;
    }
    setActiveBranchIdState(branchId);
  };

  const activeBranch = branches.find(b => b.id === activeBranchId) || null;

  return (
    <BranchContext.Provider
      value={{
        branches,
        activeBranchId,
        setActiveBranchId,
        activeBranch,
        loading,
        reloadBranches: fetchBranches,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const context = useContext(BranchContext);
  if (!context) throw new Error('useBranch must be used within BranchProvider');
  return context;
}
