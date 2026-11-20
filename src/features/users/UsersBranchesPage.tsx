import React from 'react';
import { Building2 } from 'lucide-react';
import { PlaceholderPage } from '@/pages/PlaceholderPage';

export const UsersBranchesPage: React.FC = () => {
  return (
    <PlaceholderPage
      title="Users & Branches"
      subtitle="Manage store branches and staff user accounts"
      icon={Building2}
      emptyTitle="Branch & User Management"
      emptyDescription="Configure store branches (Rajahmundry, Kakinada, Vijayawada, Guntur) and assign staff user roles and branch access permissions."
    />
  );
};
