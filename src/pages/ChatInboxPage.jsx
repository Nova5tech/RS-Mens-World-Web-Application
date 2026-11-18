import React from 'react';
import { useNavigate } from 'react-router-dom';
import StaffChatInbox from '../components/chat/StaffChatInbox.jsx';

export default function ChatInboxPage() {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full">
      <StaffChatInbox onNavigateToLeads={() => navigate('/leads')} />
    </div>
  );
}
