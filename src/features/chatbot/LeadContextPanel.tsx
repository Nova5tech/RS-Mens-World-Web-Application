import React, { useState } from 'react';
import {
  User,
  Phone,
  Store,
  Tag,
  TrendingUp,
  Calendar,
  Sparkles,
  UserPlus,
  ExternalLink,
} from 'lucide-react';
import { ChatConversation, LeadStage } from '@/types/models';
import { formatPhone } from '@/lib/phone';
import { useNavigate } from 'react-router-dom';

interface LeadContextPanelProps {
  conversation: ChatConversation | null;
  onCreateLead: (conversationId: string) => Promise<void>;
  onUpdateLeadStatus?: (leadId: string, status: LeadStage) => void;
}

export const LeadContextPanel: React.FC<LeadContextPanelProps> = ({
  conversation,
  onCreateLead,
  onUpdateLeadStatus,
}) => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [leadStatus, setLeadStatus] = useState<LeadStage>(
    conversation?.lead_status || 'new'
  );

  if (!conversation) {
    return (
      <div className="w-80 h-full bg-white rounded-2xl border border-gray-200/80 p-6 flex flex-col items-center justify-center text-center text-gray-400">
        <Sparkles className="w-8 h-8 text-gray-300 mb-2" />
        <p className="text-xs text-gray-500">Select a conversation to inspect lead context and AI summary</p>
      </div>
    );
  }

  const branchLabels: Record<string, string> = {
    branch_1: 'Branch 1 (Rajahmundry)',
    branch_2: 'Branch 2 (Kakinada)',
    branch_3: 'Branch 3 (Vijayawada)',
    branch_4: 'Branch 4 (Guntur)',
  };

  const handleCreateLeadClick = async () => {
    try {
      setIsCreating(true);
      await onCreateLead(conversation.id);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="w-80 h-full bg-white rounded-2xl border border-gray-200/80 shadow-xs flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-bold text-gray-900 text-sm">Lead Details</h3>
        {conversation.linked_lead_id ? (
          <button
            onClick={() => navigate('/leads')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F4C3A] hover:underline"
          >
            <span>View Lead</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        ) : (
          <button
            onClick={handleCreateLeadClick}
            disabled={isCreating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0F4C3A] hover:bg-[#0B3B2E] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Lead</span>
          </button>
        )}
      </div>

      {/* Body details */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {/* Contact list */}
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-gray-400" />
              Name
            </span>
            <span className="font-bold text-gray-900">{conversation.customer_name}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-500 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-gray-400" />
              Phone
            </span>
            <span className="font-mono font-medium text-gray-800">
              {formatPhone(conversation.customer_phone)}
            </span>
          </div>

          <div className="flex items-start justify-between">
            <span className="text-gray-500 flex items-center gap-1.5 shrink-0">
              <Store className="w-3.5 h-3.5 text-gray-400" />
              Branch
            </span>
            <span className="font-medium text-gray-800 text-right">
              {branchLabels[conversation.branch_id] || conversation.branch_id}
            </span>
          </div>

          <div className="flex items-start justify-between">
            <span className="text-gray-500 flex items-center gap-1.5 shrink-0 pt-0.5">
              <Tag className="w-3.5 h-3.5 text-gray-400" />
              Interest
            </span>
            <div className="flex flex-wrap justify-end gap-1">
              {conversation.interest_tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-[#E6F7EF] text-[#0F4C3A] border border-[#46D68C]/30 text-[10px] font-bold"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-gray-500 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
              Lead Status
            </span>
            <select
              value={leadStatus}
              onChange={(e) => {
                const s = e.target.value as LeadStage;
                setLeadStatus(s);
                if (conversation.linked_lead_id && onUpdateLeadStatus) {
                  onUpdateLeadStatus(conversation.linked_lead_id, s);
                }
              }}
              className="h-8 px-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0F4C3A]"
            >
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="follow_up">Follow-up</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              Follow-up
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-xs font-medium text-gray-700">
              {conversation.follow_up_date || 'Nov 21, 2025'}
            </span>
          </div>
        </div>

        {/* Conversation Context Card */}
        <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-200/70 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
            <Sparkles className="w-3.5 h-3.5 text-[#0F4C3A]" />
            <span>Conversation Context</span>
          </div>

          <ul className="text-xs text-gray-600 space-y-1.5 list-disc list-inside leading-relaxed">
            {conversation.context_bullets.map((b, idx) => (
              <li key={idx}>{b}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
