import React from 'react';
import { Users } from 'lucide-react';
import { PlaceholderPage } from '@/pages/PlaceholderPage';

export const CustomersPage: React.FC = () => {
  return (
    <PlaceholderPage
      title="Customer Database"
      subtitle="Manage customers and import from Petpooja"
      icon={Users}
      emptyTitle="No customers yet"
      emptyDescription="Customer records synced from Petpooja POS and store interactions will appear here, along with purchase history and consent tracking."
      actionLabel="Import from Petpooja"
      onAction={() => alert('Petpooja Import wizard will be enabled in Phase 2.')}
    />
  );
};
