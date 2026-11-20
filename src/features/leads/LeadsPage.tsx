import React from 'react';
import { Target } from 'lucide-react';
import { PlaceholderPage } from '@/pages/PlaceholderPage';

export const LeadsPage: React.FC = () => {
  return (
    <PlaceholderPage
      title="Lead Generation"
      subtitle="Track and manage potential customers"
      icon={Target}
      emptyTitle="No leads in pipeline"
      emptyDescription="Track and manage potential customers across Kanban and Table views. Leads will be captured from Website Chat and WhatsApp enquiries."
      actionLabel="Create First Lead"
      onAction={() => alert('Lead creation will be enabled in Phase 3.')}
    />
  );
};
