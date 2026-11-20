import React from 'react';
import { Settings } from 'lucide-react';
import { PlaceholderPage } from '@/pages/PlaceholderPage';

export const SettingsPage: React.FC = () => {
  return (
    <PlaceholderPage
      title="Settings"
      subtitle="Platform configurations, integrations and preferences"
      icon={Settings}
      emptyTitle="Platform Settings"
      emptyDescription="Configure WhatsApp Business API credentials, AI prompt instructions, Petpooja POS webhook connections, and system preferences."
    />
  );
};
