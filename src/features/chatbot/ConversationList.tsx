import React from 'react';
import { Search, Globe, MessageSquare, Instagram, User } from 'lucide-react';
import { ChatConversation, ConversationStatus } from '@/types/models';

interface ConversationListProps {
  conversations: ChatConversation[];
  selectedId: string | null;
  onSelect: (conv: ChatConversation) => void;
  statusTab: 'all' | ConversationStatus;
  onChangeStatusTab: (status: 'all' | ConversationStatus) => void;
  search: string;
  onSearchChange: (val: string) => void;
  counts: { all: number; open: number; pending: number; closed: number };
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedId,
  onSelect,
  statusTab,
  onChangeStatusTab,
  search,
  onSearchChange,
  counts,
}) => {
  const getRelativeTime = (isoStr: string) => {
    const diffMs = Date.now() - new Date(isoStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h`;
    return `${Math.floor(diffHrs / 24)}d`;
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp':
        return <MessageSquare className="w-3 h-3 text-emerald-600" />;
      case 'instagram':
        return <Instagram className="w-3 h-3 text-pink-600" />;
      case 'website':
      default:
        return <Globe className="w-3 h-3 text-blue-600" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
      {/* Top Tabs */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2 border-b border-gray-100 bg-gray-50/50">
        {[
          { id: 'all', label: 'All', count: counts.all },
          { id: 'open', label: 'Open', count: counts.open },
          { id: 'pending', label: 'Pending', count: counts.pending },
          { id: 'closed', label: 'Closed', count: counts.closed },
        ].map((tab) => {
          const isActive = statusTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeStatusTab(tab.id as any)}
              className={`flex-1 py-1.5 px-2 text-center text-xs font-semibold rounded-lg transition-all ${
                isActive
                  ? 'bg-white text-[#0F4C3A] shadow-xs border border-gray-200/60'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
              }`}
            >
              <div>{tab.label}</div>
              <div className="text-[11px] font-normal text-gray-400">({tab.count})</div>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-gray-100">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search conversations..."
            className="w-full h-8 pl-8 pr-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0F4C3A] focus:bg-white"
          />
        </div>
      </div>

      {/* Conversation Items List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-50 scrollbar-thin">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400">
            No conversations found
          </div>
        ) : (
          conversations.map((conv) => {
            const isSelected = conv.id === selectedId;
            const timeStr = getRelativeTime(conv.last_message_at);

            return (
              <div
                key={conv.id}
                onClick={() => onSelect(conv)}
                className={`p-3.5 flex items-start gap-3 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#E6F7EF] border-l-4 border-l-[#0F4C3A]'
                    : 'hover:bg-gray-50/80'
                }`}
              >
                {/* Avatar with Channel Icon Badge */}
                <div className="relative shrink-0">
                  {conv.customer_avatar ? (
                    <img
                      src={conv.customer_avatar}
                      alt={conv.customer_name}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-semibold text-xs border border-emerald-100">
                      <User className="w-5 h-5 text-emerald-700" />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 p-0.5 bg-white rounded-full shadow-2xs border border-gray-200">
                    {getChannelIcon(conv.channel)}
                  </div>
                </div>

                {/* Info & Snippet */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h4 className="text-xs font-bold text-gray-900 truncate">
                      {conv.customer_name}
                    </h4>
                    <span className="text-[11px] text-gray-400 whitespace-nowrap">
                      {timeStr}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 truncate leading-relaxed">
                    {conv.last_message || 'Started conversation'}
                  </p>

                  {/* Badges row */}
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {conv.status === 'pending' && (
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        Staff Required
                      </span>
                    )}
                    {conv.unread_count > 0 && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
