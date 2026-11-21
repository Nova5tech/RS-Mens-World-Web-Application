import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, ChevronDown } from 'lucide-react';
import { ChatConversation, ConversationStatus } from '@/types/models';
import { chatService } from '@/services/chat';
import { useAuth } from '@/features/auth/useAuth';
import { ConversationList } from './ConversationList';
import { ChatArea } from './ChatArea';
import { LeadContextPanel } from './LeadContextPanel';
import { KnowledgeBaseModal } from './KnowledgeBaseModal';

export const ChatbotPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'super_admin';
  const isBranchUser = user?.role === 'branch_user';

  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<ChatConversation | null>(null);
  const [statusTab, setStatusTab] = useState<'all' | ConversationStatus>('all');
  const [search, setSearch] = useState('');
  const [counts, setCounts] = useState({ all: 0, open: 0, pending: 0, closed: 0 });
  const [onlineStatus, setOnlineStatus] = useState<'online' | 'offline'>('online');
  const [isKBModalOpen, setIsKBModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const branchId = isBranchUser ? user?.branch_id || undefined : undefined;
      const list = await chatService.getConversations(statusTab, search, branchId);
      const cnts = await chatService.getConversationCounts(branchId);
      setConversations(list);
      setCounts(cnts);

      // Auto select first conversation or keep selection fresh
      if (selectedConv) {
        const fresh = list.find((c) => c.id === selectedConv.id);
        if (fresh) setSelectedConv(fresh);
      } else if (list.length > 0) {
        setSelectedConv(list[0]);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  }, [statusTab, search, isBranchUser, user?.branch_id, selectedConv]);

  useEffect(() => {
    loadData();
    const handleSync = () => loadData();
    window.addEventListener('rs_chat_updated', handleSync);
    return () => window.removeEventListener('rs_chat_updated', handleSync);
  }, [loadData]);

  const handleUpdateStatus = async (id: string, status: ConversationStatus) => {
    await chatService.updateConversationStatus(id, status);
    await loadData();
  };

  const handleResumeAI = async (id: string) => {
    await chatService.resumeAI(id);
    await loadData();
  };

  const handleAssignBranch = async (id: string, branchId: string) => {
    await chatService.assignBranch(id, branchId);
    await loadData();
  };

  const handleCreateLead = async (convId: string) => {
    await chatService.createLeadFromConversation(convId);
    await loadData();
  };

  const branchSubtitle = isBranchUser
    ? `Customer conversations • ${user?.branch_name || 'My Branch'}`
    : 'Customer conversations • All branches';

  return (
    <div className="space-y-4 h-[calc(100vh-100px)] flex flex-col">
      {/* Top Bar matching 07-chatbot-admin.png */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            AI Chatbot
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{branchSubtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Online/Offline Status Dropdown */}
          <div className="relative">
            <button
              onClick={() =>
                setOnlineStatus((prev) => (prev === 'online' ? 'offline' : 'online'))
              }
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 transition-colors"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  onlineStatus === 'online' ? 'bg-[#46D68C]' : 'bg-gray-400'
                }`}
              />
              <span className="capitalize">{onlineStatus}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>

          {/* Admin Knowledge Base & Settings Button */}
          {isAdmin && (
            <button
              onClick={() => setIsKBModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-2xs transition-colors"
            >
              <BookOpen className="w-4 h-4 text-[#0F4C3A]" />
              <span>Knowledge Base</span>
            </button>
          )}
        </div>
      </div>

      {/* 3-Column Inbox Grid */}
      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
        {/* Left Column: Conversation List */}
        <div className="w-72 lg:w-80 shrink-0 h-full">
          <ConversationList
            conversations={conversations}
            selectedId={selectedConv?.id || null}
            onSelect={(c) => setSelectedConv(c)}
            statusTab={statusTab}
            onChangeStatusTab={(st) => setStatusTab(st)}
            search={search}
            onSearchChange={(val) => setSearch(val)}
            counts={counts}
          />
        </div>

        {/* Middle Column: Chat Thread */}
        <ChatArea
          conversation={selectedConv}
          onUpdateStatus={handleUpdateStatus}
          onResumeAI={handleResumeAI}
          onAssignBranch={handleAssignBranch}
        />

        {/* Right Column: Lead Context */}
        <LeadContextPanel
          conversation={selectedConv}
          onCreateLead={handleCreateLead}
        />
      </div>

      {/* Knowledge Base Modal */}
      <KnowledgeBaseModal
        isOpen={isKBModalOpen}
        onClose={() => setIsKBModalOpen(false)}
      />
    </div>
  );
};
