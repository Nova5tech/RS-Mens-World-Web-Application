import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Phone,
  Store,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { ChatMessage } from '@/types/models';
import { chatService } from '@/services/chat';
import { normalizePhone } from '@/lib/phone';

export const WebsiteChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Pre-chat form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [branch, setBranch] = useState('branch_1');
  const [consent, setConsent] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  // Chat message state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick reply chips
  const quickChips = [
    'Store timings',
    'Nearest branch',
    'Current offers',
    'Talk to staff',
  ];

  // Refresh messages from service
  const refreshMessages = async (cId: string) => {
    const list = await chatService.getMessages(cId);
    setMessages(list);
  };

  useEffect(() => {
    if (conversationId) {
      refreshMessages(conversationId);
      const handleSync = () => refreshMessages(conversationId);
      window.addEventListener('rs_chat_updated', handleSync);
      return () => window.removeEventListener('rs_chat_updated', handleSync);
    }
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Please enter your name');
      return;
    }

    const norm = normalizePhone(phone);
    if (!norm.isValid) {
      setFormError('Please enter a valid 10-digit mobile number');
      return;
    }

    const res = await chatService.startPublicChat({
      name: name.trim(),
      phone: norm.e164,
      branch_id: branch,
      consent,
    });

    setConversationId(res.conversationId);
    setMessages([res.welcomeMessage]);
    setHasStarted(true);
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!conversationId || !textToSend.trim()) return;
    const text = textToSend.trim();
    setInputText('');

    // Immediate optimistic append
    const tempMsg: ChatMessage = {
      id: `temp_${Date.now()}`,
      conversation_id: conversationId,
      sender: 'customer',
      text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);
    setIsTyping(true);

    try {
      // Simulate ~800ms AI typing delay
      await new Promise((r) => setTimeout(r, 800));
      await chatService.sendPublicMessage(conversationId, text);
      await refreshMessages(conversationId);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Widget Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#0F4C3A] hover:bg-[#0B3B2E] text-white shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 group"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#46D68C] animate-ping" />
          <MessageSquare className="w-4 h-4 fill-white" />
          <span className="text-xs font-bold tracking-wide">Website Chat</span>
        </button>
      )}

      {/* Floating 380x600 Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full sm:w-[380px] h-[600px] max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-gray-200/80 flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="px-5 py-4 bg-[#0F4C3A] text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20">
                <img src="/images/logo-hanger.svg" alt="RS" className="w-5 h-5 invert brightness-0" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm tracking-tight">RS Mens World</h3>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-[#46D68C] text-[#0B3B2E]">
                    AI
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#46D68C]" />
                  Online • Store Assistant
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body: Pre-chat Form vs Chat Thread */}
          {!hasStarted ? (
            <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto bg-gray-50/50">
              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-bold text-gray-900">
                    Welcome to RS Mens World!
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Please share your details so our AI assistant and branch stylists can assist you.
                  </p>
                </div>

                {formError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                    {formError}
                  </div>
                )}

                <form onSubmit={handleStartChat} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Your Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Ramesh Varma"
                        className="w-full h-9 pl-9 pr-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F4C3A]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      WhatsApp Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full h-9 pl-9 pr-3 bg-white border border-gray-200 rounded-xl font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F4C3A]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Preferred Store Branch
                    </label>
                    <div className="relative">
                      <Store className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <select
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full h-9 pl-9 pr-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F4C3A]"
                      >
                        <option value="branch_1">Branch 1 (Rajahmundry Main)</option>
                        <option value="branch_2">Branch 2 (Kakinada)</option>
                        <option value="branch_3">Branch 3 (Vijayawada)</option>
                        <option value="branch_4">Branch 4 (Guntur)</option>
                      </select>
                    </div>
                  </div>

                  <label className="flex items-start gap-2 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5 rounded border-gray-300 text-[#0F4C3A] focus:ring-[#0F4C3A] h-4 w-4"
                    />
                    <span className="text-[11px] text-gray-600 leading-snug">
                      I agree to receive store updates, offers, and sizing trial confirmation on WhatsApp.
                    </span>
                  </label>

                  <button
                    type="submit"
                    className="w-full h-10 mt-3 rounded-xl bg-[#0F4C3A] hover:bg-[#0B3B2E] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Start Chat</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </form>
              </div>

              <div className="pt-4 border-t border-gray-200/60 flex items-center justify-center gap-1.5 text-[10px] text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Official Store Assistant</span>
              </div>
            </div>
          ) : (
            /* Active Chat Thread */
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/40">
              {/* Message Bubbles */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                {messages.map((m) => {
                  if (m.sender === 'system') {
                    return (
                      <div key={m.id} className="flex justify-center my-1.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-gray-200 text-[10px] text-gray-600 font-medium">
                          {m.text}
                        </span>
                      </div>
                    );
                  }

                  const isAIOrStaff = m.sender === 'ai' || m.sender === 'staff';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isAIOrStaff ? 'items-start' : 'items-end'}`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                          isAIOrStaff
                            ? 'bg-white text-gray-900 border border-gray-200/80 shadow-2xs rounded-tl-xs'
                            : 'bg-[#0F4C3A] text-white shadow-2xs rounded-tr-xs'
                        }`}
                      >
                        {m.sender === 'ai' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0F4C3A] mb-1">
                            <Bot className="w-3 h-3" />
                            AI Assistant
                          </span>
                        )}
                        {m.sender === 'staff' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 mb-1">
                            <User className="w-3 h-3" />
                            Store Stylist ({m.sender_name || 'Staff'})
                          </span>
                        )}
                        <p className="whitespace-pre-wrap">{m.text}</p>
                      </div>
                    </div>
                  );
                })}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-white border border-gray-200/80 max-w-[120px] shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-[#0F4C3A] animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-[#0F4C3A] animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-[#0F4C3A] animate-bounce [animation-delay:0.4s]" />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Reply Chips */}
              <div className="px-3 py-2 bg-white border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                {quickChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(chip)}
                    className="whitespace-nowrap px-2.5 py-1 rounded-full bg-gray-100 hover:bg-emerald-50 hover:text-[#0F4C3A] text-gray-700 font-medium text-[11px] border border-gray-200 transition-colors shrink-0"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Message Composer */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputText);
                }}
                className="p-3 bg-white border-t border-gray-100 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 h-9 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0F4C3A] focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="w-9 h-9 rounded-xl bg-[#0F4C3A] hover:bg-[#0B3B2E] text-white flex items-center justify-center disabled:opacity-40 transition-all shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
};
