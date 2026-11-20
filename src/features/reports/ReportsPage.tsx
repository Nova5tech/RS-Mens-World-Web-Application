import React from 'react';
import { BarChart3 } from 'lucide-react';
import { PlaceholderPage } from '@/pages/PlaceholderPage';

export const ReportsPage: React.FC = () => {
  return (
    <PlaceholderPage
      title="Reports & Analytics"
      subtitle="Insights on customers, campaigns, leads and chat"
      icon={BarChart3}
      emptyTitle="Reports being compiled"
      emptyDescription="Comprehensive analytics on campaign ROI, customer retention, lead conversion rates, and chatbot performance."
    />
  );
};
