import React, { createContext, useContext, useState, useEffect } from 'react';
import { Branch } from '@/types/models';
import { getBranches } from '@/services/branches';
import { useAuth } from '@/features/auth/useAuth';

interface BranchContextType {
  branches: Branch[];
  isLoading: boolean;
  selectedBranchId: string;
  setSelectedBranchId: (id: string) => void;
  selectedBranch: Branch | null;
  isLocked: boolean;
  sidebarChipText: string;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export const BranchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, role } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // For super_admin, restore last selected branch or default to 'all'
  const [adminBranchId, setAdminBranchId] = useState<string>(() => {
    return localStorage.getItem('rs_selected_branch_id') || 'all';
  });

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    getBranches()
      .then((data) => {
        if (mounted) {
          setBranches(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load branches', err);
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const isBranchUser = role === 'branch_user';
  const branchUserBranchId = user?.branch_id || '';

  // Determine actual selected branch id
  const selectedBranchId = isBranchUser ? branchUserBranchId : adminBranchId;

  const handleSelectBranch = (id: string) => {
    if (isBranchUser) {
      // Locked for branch users - cannot change
      return;
    }
    setAdminBranchId(id);
    localStorage.setItem('rs_selected_branch_id', id);
  };

  const selectedBranch =
    branches.find((b) => b.id === selectedBranchId) || null;

  // Sidebar chip text:
  // super_admin -> always "Head Office"
  // branch_user -> their branch name (e.g. "Kakinada Branch")
  const sidebarChipText =
    isBranchUser
      ? (selectedBranch?.name || user?.branch_name || 'My Branch')
      : 'Head Office';

  return (
    <BranchContext.Provider
      value={{
        branches,
        isLoading,
        selectedBranchId,
        setSelectedBranchId: handleSelectBranch,
        selectedBranch,
        isLocked: isBranchUser,
        sidebarChipText,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
};

export function useBranchContext(): BranchContextType {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranchContext must be used within a BranchProvider');
  }
  return context;
}
