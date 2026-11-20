import React from 'react';
import { Bot } from 'lucide-react';
import { PlaceholderPage } from '@/pages/PlaceholderPage';

export const ChatbotPage: React.FC = () => {
  return (
    <PlaceholderPage
      title="AI Chatbot"
      subtitle="Website widget & WhatsApp inbound conversations"
      icon={Bot}
      emptyTitle="No active chat sessions"
      emptyDescription="AI Chatbot handles automated customer queries, product recommendations, and WhatsApp customer support. Inbound sessions will appear here."
      actionLabel="Configure Chatbot"
      onAction={() => alert('Chatbot configuration will be enabled in Phase 4.')}
    />
  );
};
