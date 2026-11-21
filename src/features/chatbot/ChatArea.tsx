import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Paperclip,
  CheckCheck,
  Bot,
  User,
  MoreVertical,
  Play,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { ChatConversation, ChatMessage, ConversationStatus } from '@/types/models';
import { chatService } from '@/services/chat';

interface ChatAreaProps {
  conversation: ChatConversation | null;
  onUpdateStatus: (id: string, status: ConversationStatus) => void;
  onResumeAI: (id: string) => void;
  onAssignBranch: (id: string, branchId: string) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  conversation,
  onUpdateStatus,
  onResumeAI,
  onAssignBranch,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const branchLabels: Record<string, string> = {
    branch_1: 'Branch 1 (Rajahmundry)',
    branch_2: 'Branch 2 (Kakinada)',
    branch_3: 'Branch 3 (Vijayawada)',
    branch_4: 'Branch 4 (Guntur)',
  };

  const loadMessages = async () => {
    if (!conversation) return;
    const list = await chatService.getMessages(conversation.id);
    setMessages(list);
  };

  useEffect(() => {
    loadMessages();
    const handleSync = () => loadMessages();
    window.addEventListener('rs_chat_updated', handleSync);
    return () => window.removeEventListener('rs_chat_updated', handleSync);
  }, [conversation?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-200/80 p-8 text-center text-gray-400">
        <Bot className="w-12 h-12 text-gray-300 mb-3" />
        <h3 className="text-sm font-semibold text-gray-700">No conversation selected</h3>
        <p className="text-xs text-gray-500 mt-1">Select a customer thread from the left to start chatting</p>
      </div>
    );
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText('');
    await chatService.sendStaffMessage(conversation.id, text);
    await loadMessages();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-3">
          {conversation.customer_avatar ? (
            <img
              src={conversation.customer_avatar}
              alt={conversation.customer_name}
              className="w-10 h-10 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs border border-emerald-100">
              <User className="w-5 h-5 text-emerald-700" />
            </div>
          )}
          <div>
            <h3 className="font-bold text-gray-900 text-sm">{conversation.customer_name}</h3>
            <p className="text-xs text-gray-500 capitalize">
              {conversation.channel} • {branchLabels[conversation.branch_id] || conversation.branch_id}
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          {/* Action Menu */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div
                className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-30 text-xs"
                onClick={() => setIsMenuOpen(false)}
              >
                {conversation.status !== 'closed' ? (
                  <button
                    onClick={() => onUpdateStatus(conversation.id, 'closed')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-gray-400" />
                    Close Conversation
                  </button>
                ) : (
                  <button
                    onClick={() => onUpdateStatus(conversation.id, 'open')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5 text-gray-400" />
                    Reopen Conversation
                  </button>
                )}

                {conversation.status !== 'pending' && (
                  <button
                    onClick={() => onUpdateStatus(conversation.id, 'pending')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-amber-700 flex items-center gap-2"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    Mark Pending Staff
                  </button>
                )}

                <div className="border-t border-gray-100 my-1" />
                <div className="px-4 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Assign Branch
                </div>
                {['branch_1', 'branch_2', 'branch_3', 'branch_4'].map((bId) => (
                  <button
                    key={bId}
                    onClick={() => onAssignBranch(conversation.id, bId)}
                    className={`w-full text-left px-4 py-1.5 hover:bg-gray-50 text-[11px] ${
                      conversation.branch_id === bId ? 'font-bold text-[#0F4C3A]' : 'text-gray-600'
                    }`}
                  >
                    {branchLabels[bId]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Human Takeover Notice banner if AI is paused */}
      {conversation.ai_paused && (
        <div className="px-4 py-2 bg-amber-50 border-b border-amber-200/80 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Human Mode active — AI responses are paused for this conversation</span>
          </div>
          <button
            onClick={() => onResumeAI(conversation.id)}
            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-2xs inline-flex items-center gap-1"
          >
            <Play className="w-3 h-3 fill-current" />
            Resume AI
          </button>
        </div>
      )}

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/40 scrollbar-thin">
        {messages.map((msg) => {
          if (msg.sender === 'system') {
            return (
              <div key={msg.id} className="flex justify-center my-2">
                <span className="px-3 py-1 rounded-full bg-gray-200/80 text-[11px] font-medium text-gray-600 shadow-2xs">
                  {msg.text}
                </span>
              </div>
            );
          }

          const isStaffOrAI = msg.sender === 'ai' || msg.sender === 'staff';
          const time = new Date(msg.created_at).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isStaffOrAI ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed relative ${
                  isStaffOrAI
                    ? 'bg-[#E6F7EF] text-gray-900 border border-[#46D68C]/30 shadow-2xs rounded-tr-xs'
                    : 'bg-white text-gray-900 border border-gray-200/80 shadow-2xs rounded-tl-xs'
                }`}
              >
                {/* AI Label Pill */}
                {msg.sender === 'ai' && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#0F4C3A] text-white mb-1.5">
                    <Bot className="w-2.5 h-2.5" />
                    AI
                  </span>
                )}

                {/* Staff label if sent by staff member */}
                {msg.sender === 'staff' && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-600 text-white mb-1.5">
                    Staff ({msg.sender_name || 'Store'})
                  </span>
                )}

                {/* Text */}
                <p className="whitespace-pre-wrap">{msg.text}</p>

                {/* Image gallery if attached (matches 07-chatbot-branch-images.png) */}
                {msg.image_urls && msg.image_urls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-emerald-200/40">
                    {msg.image_urls.map((img, i) => (
                      <div
                        key={i}
                        className="rounded-xl overflow-hidden aspect-square border border-emerald-200/60 shadow-2xs bg-white"
                      >
                        <img
                          src={img}
                          alt="Product"
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Timestamp + read status */}
              <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1 px-1">
                <span>{time}</span>
                {isStaffOrAI && <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-white border-t border-gray-100 flex items-center gap-2"
      >
        <button
          type="button"
          title="Attach product media or voucher"
          className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message as store staff..."
          className="flex-1 h-10 px-4 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F4C3A] focus:bg-white"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="w-10 h-10 rounded-xl bg-[#0F4C3A] hover:bg-[#0B3B2E] text-white flex items-center justify-center disabled:opacity-40 transition-all shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
