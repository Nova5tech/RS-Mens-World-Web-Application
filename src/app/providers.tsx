import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BranchProvider } from '@/contexts/BranchContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <BranchProvider>{children}</BranchProvider>
    </QueryClientProvider>
  );
};
