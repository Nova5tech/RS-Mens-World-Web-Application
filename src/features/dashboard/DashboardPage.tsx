import React from 'react';
import { LayoutDashboard } from 'lucide-react';
import { PlaceholderPage } from '@/pages/PlaceholderPage';

export const DashboardPage: React.FC = () => {
  return (
    <PlaceholderPage
      title="Dashboard"
      subtitle="Overview of operations and engagement"
      icon={LayoutDashboard}
      emptyTitle="Welcome to RS Mens World"
      emptyDescription="The executive analytics dashboard will aggregate real-time customer engagement metrics, store footfall, active campaigns, and lead conversions."
      actionLabel="Explore Customers"
      onAction={() => (window.location.href = '/customers')}
    />
  );
};
