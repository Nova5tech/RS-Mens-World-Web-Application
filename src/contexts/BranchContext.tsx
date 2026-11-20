import React, { createContext, useContext, useState, useEffect } from 'react';
import { Branch } from '@/types/models';
import { getBranches } from '@/services/branches';

interface BranchContextType {
  branches: Branch[];
  isLoading: boolean;
  selectedBranchId: string;
  setSelectedBranchId: (id: string) => void;
  selectedBranch: Branch | null;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export const BranchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedBranchId, setSelectedBranchId] = useState<string>(() => {
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

  const handleSelectBranch = (id: string) => {
    setSelectedBranchId(id);
    localStorage.setItem('rs_selected_branch_id', id);
  };

  const selectedBranch =
    branches.find((b) => b.id === selectedBranchId) || null;

  return (
    <BranchContext.Provider
      value={{
        branches,
        isLoading,
        selectedBranchId,
        setSelectedBranchId: handleSelectBranch,
        selectedBranch,
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
