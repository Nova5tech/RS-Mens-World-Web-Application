import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Store,
} from 'lucide-react';
import { chatService } from '../../services/chatService.js';
import { leadService } from '../../services/leadService.js';
import { useBranch } from '../../context/BranchContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { isValidIndianMobile } from '../../utils/formatters.js';

export default function CustomerChatWidget({ isOpen, onClose }) {
  const { branches } = useBranch();
  const { showToast } = useToast();

  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showHandoverForm, setShowHandoverForm] = useState(false);
  const [handoverSuccess, setHandoverSuccess] = useState(false);

  // Handover form state
  const [visitorName, setVisitorName] = useState('');
  const [visitorMobile, setVisitorMobile] = useState('');
  const [preferredBranch, setPreferredBranch] = useState('B1');
  const [consentGranted, setConsentGranted] = useState(true);
  const [formError, setFormError] = useState('');

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && !currentChatId) {
      startNewChat();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const startNewChat = async () => {
    try {
      const chat = await chatService.createChat({
        branchId: preferredBranch,
      });
      setCurrentChatId(chat.id);
      const cleanGreeting = {
        id: 'msg-init',
        role: 'assistant',
        text: 'Welcome to RS Mens World! I can assist you with store branch locations, operating hours, tailored wedding suits, royal sherwanis, or alteration bookings.',
        timestamp: new Date().toISOString(),
        isAi: true,
        isApprovedFaq: true,
      };
      setMessages([cleanGreeting]);
      setShowHandoverForm(false);
      setHandoverSuccess(false);
    } catch (err) {
      console.error('Error starting chat:', err);
    }
  };

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || !currentChatId) return;

    setInputText('');
    const userMsg = {
      id: `msg-${Date.now()}-usr`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const { chat, aiReply } = await chatService.sendMessage(currentChatId, textToSend);
      setMessages(chat.messages);

      if (aiReply.isUnknown) {
        setShowHandoverForm(true);
      }
    } catch (err) {
      console.error('Send message error:', err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmitHandover = async e => {
    e.preventDefault();
    setFormError('');

    if (!visitorName.trim()) {
      setFormError('Please enter your name');
      return;
    }

    if (!isValidIndianMobile(visitorMobile)) {
      setFormError('Please provide a valid 10-digit mobile number');
      return;
    }

    try {
      const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.text || 'Store consultation inquiry';
      await leadService.createLead({
        name: visitorName,
        mobile: visitorMobile,
        enquiry: lastUserMsg,
        source: 'AI Chat',
        preferredBranchId: preferredBranch,
        consentToContact: consentGranted,
      });

      setHandoverSuccess(true);
      setShowHandoverForm(false);
      showToast('Enquiry transferred to store staff', 'success');

      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}-staff-ack`,
          role: 'system',
          text: `Your request has been routed to our ${
            branches.find(b => b.id === preferredBranch)?.name || 'store'
          } staff. A consultant will reach you shortly at +91 ${visitorMobile}.`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setFormError('Unable to submit enquiry. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[580px] max-h-[calc(100vh-2rem)] bg-white rounded-3xl shadow-float border border-[#D9E9E8] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Header: Forest Teal & Mint */}
      <div className="bg-[#062b24] text-white p-4 flex items-center justify-between border-b border-[#0d3d34]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#083b32] flex items-center justify-center text-[#48d597] border border-[#0d453b]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-white">RS Mens World</h2>
            <p className="text-[11px] text-[#48d597] font-sans flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#48d597] animate-pulse"></span>
              Store AI Concierge • Online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={startNewChat}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Reset conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* AI Participation Disclosure Banner */}
      <div className="bg-[#f0f9f7] border-b border-[#D9E9E8] px-3.5 py-2 text-[11px] text-slate-600 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#008C83]" />
          <span>Responses from verified store policies</span>
        </span>
        <button
          onClick={() => setShowHandoverForm(true)}
          className="text-[#0f766e] font-bold hover:underline shrink-0 ml-2 cursor-pointer"
        >
          Talk to Staff
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#f8fbfb]">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#0f766e] text-white rounded-tr-xs shadow-2xs font-medium'
                  : msg.role === 'system'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-xl text-xs font-medium'
                  : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs shadow-2xs'
              }`}
            >
              {msg.text}
              {msg.isApprovedFaq && (
                <div className="mt-1.5 text-[10px] text-emerald-700 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified store policy</span>
                </div>
              )}
              {msg.isUnknown && (
                <div className="mt-1.5 text-[10px] text-amber-700 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3" />
                  <span>Store consultation available</span>
                </div>
              )}
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5 px-1">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}

        {isTyping && (
          <div className="px-3.5 py-2 bg-white rounded-2xl border border-slate-200/90 w-28 text-[11px] text-slate-500 font-sans flex items-center gap-1.5 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#008C83] animate-bounce"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#008C83] animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#008C83] animate-bounce [animation-delay:0.4s]"></span>
            <span className="text-slate-400 ml-1">Typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length <= 2 && !showHandoverForm && (
        <div className="p-3 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto text-xs whitespace-nowrap">
          <button
            onClick={() => handleSendMessage('What are your store hours and branch locations?')}
            className="px-3 py-1.5 bg-[#e6f7f2] hover:bg-[#d0f0e8] text-[#008C83] font-semibold rounded-xl text-[11px] transition-colors cursor-pointer"
          >
            Store hours & locations
          </button>
          <button
            onClick={() => handleSendMessage('Do you offer tailored wedding suits and royal sherwanis?')}
            className="px-3 py-1.5 bg-[#e6f7f2] hover:bg-[#d0f0e8] text-[#008C83] font-semibold rounded-xl text-[11px] transition-colors cursor-pointer"
          >
            Wedding suits & sherwanis
          </button>
          <button
            onClick={() => handleSendMessage('Do you provide alteration services?')}
            className="px-3 py-1.5 bg-[#e6f7f2] hover:bg-[#d0f0e8] text-[#008C83] font-semibold rounded-xl text-[11px] transition-colors cursor-pointer"
          >
            Alterations
          </button>
        </div>
      )}

      {/* Staff Handover Form */}
      {showHandoverForm && !handoverSuccess && (
        <div className="p-4 bg-white border-t border-slate-200">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-900">
              Request Staff Callback
            </span>
            <button
              onClick={() => setShowHandoverForm(false)}
              className="text-slate-400 hover:text-slate-700 text-xs cursor-pointer"
            >
              Cancel
            </button>
          </div>

          {formError && (
            <p className="text-[11px] text-red-600 mb-2 font-medium">{formError}</p>
          )}

          <form onSubmit={handleSubmitHandover} className="space-y-2.5 text-xs">
            <input
              type="text"
              placeholder="Your full name"
              value={visitorName}
              onChange={e => setVisitorName(e.target.value)}
              className="w-full px-3 py-2 bg-[#f8fbfb] border border-slate-200 rounded-xl text-xs outline-none focus:border-[#0f766e]"
              required
            />
            <div className="flex gap-2">
              <input
                type="tel"
                placeholder="10-digit mobile number"
                value={visitorMobile}
                onChange={e => setVisitorMobile(e.target.value)}
                className="w-1/2 px-3 py-2 bg-[#f8fbfb] border border-slate-200 rounded-xl text-xs font-mono outline-none focus:border-[#0f766e]"
                required
              />
              <select
                value={preferredBranch}
                onChange={e => setPreferredBranch(e.target.value)}
                className="w-1/2 px-2.5 py-2 bg-[#f8fbfb] border border-slate-200 rounded-xl text-xs outline-none text-slate-700 font-medium"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-start gap-2 text-[11px] text-slate-600 cursor-pointer pt-0.5">
              <input
                type="checkbox"
                checked={consentGranted}
                onChange={e => setConsentGranted(e.target.checked)}
                className="rounded border-slate-300 text-[#0f766e] focus:ring-[#0f766e]/20 mt-0.5"
              />
              <span>I agree to receive WhatsApp updates for this enquiry.</span>
            </label>
            <button
              type="submit"
              className="w-full py-2 bg-[#0f766e] hover:bg-[#0d655f] text-white font-semibold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
            >
              Submit Consultation Request
            </button>
          </form>
        </div>
      )}

      {/* Input Field */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder="Ask about suits, timings, alteration..."
          className="flex-1 px-3.5 py-2 bg-[#f8fbfb] text-slate-900 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0f766e] placeholder-slate-400"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2 bg-[#0f766e] text-white rounded-xl hover:bg-[#0d655f] disabled:opacity-40 transition-colors shadow-2xs cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
