import React from 'react';
import { Megaphone } from 'lucide-react';
import { PlaceholderPage } from '@/pages/PlaceholderPage';

export const CampaignsPage: React.FC = () => {
  return (
    <PlaceholderPage
      title="WhatsApp Campaigns"
      subtitle="Create and run targeted WhatsApp broadcasts"
      icon={Megaphone}
      emptyTitle="No active campaigns"
      emptyDescription="Create targeted WhatsApp broadcasts with template messages, media attachments, and per-branch delivery toggles."
      actionLabel="Create Campaign"
      onAction={() => alert('Campaign wizard will be enabled in Phase 3.')}
    />
  );
};
