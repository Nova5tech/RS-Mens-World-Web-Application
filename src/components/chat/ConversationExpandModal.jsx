import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  User,
  Send,
  CheckCheck,
  Paperclip,
  Maximize2,
  Minimize2,
  MessageSquare,
  Store,
  Phone,
} from 'lucide-react';

export default function ConversationExpandModal({
  isOpen,
  onClose,
  conversation,
  onSendMessage,
}) {
  const [replyText, setReplyText] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, conversation?.messages]);

  if (!isOpen || !conversation) return null;

  const handleSend = e => {
    e.preventDefault();
    if (!replyText.trim()) return;
    if (onSendMessage) {
      onSendMessage(replyText.trim());
    }
    setReplyText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            {conversation.isImageAvatar && conversation.avatarUrl ? (
              <img
                src={conversation.avatarUrl}
                alt={conversation.customerName}
                className="w-11 h-11 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-[#ccfbf1] text-[#004F4C] flex items-center justify-center font-bold text-sm">
                {conversation.avatar || <User className="w-6 h-6 text-[#004F4C]" />}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900">{conversation.customerName}</h3>
                <span className="text-[11px] font-mono text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                  {conversation.phone}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                <span>{conversation.channel}</span>
                <span>•</span>
                <span>{conversation.fullBranchName || conversation.branch}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full hover:bg-slate-200/70 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              aria-label="Close expanded view"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Expanded Message Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
          {conversation.messages.map(msg => {
            const isBot = msg.sender === 'bot';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isBot ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed ${
                    isBot
                      ? 'bg-[#dcfce7] text-slate-900 rounded-tr-xs shadow-2xs'
                      : 'bg-[#f1f5f9] text-slate-900 rounded-tl-xs shadow-2xs'
                  }`}
                >
                  {/* Products Showcase */}
                  {msg.products && (
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      {msg.products.map(prod => (
                        <div
                          key={prod.id}
                          className="rounded-xl overflow-hidden bg-white border border-slate-200 shadow-2xs group"
                        >
                          <img
                            src={prod.image}
                            alt={prod.title}
                            className="w-full h-32 sm:h-36 object-cover group-hover:scale-105 transition-transform"
                          />
                          <p className="text-xs font-semibold p-2 text-center text-slate-800 truncate">
                            {prod.title}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <p>{msg.text}</p>
                </div>

                <div
                  className={`flex items-center gap-1.5 text-xs text-slate-400 mt-1 px-1 font-medium ${
                    isBot ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <span>{msg.time}</span>
                  {isBot && <CheckCheck className="w-4 h-4 text-[#10b981]" />}
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <form onSubmit={handleSend} className="flex items-center gap-3">
            <input
              type="text"
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Type your response to continue this conversation..."
              className="flex-1 py-3 px-4 text-sm bg-white border border-slate-200 rounded-2xl outline-none focus:border-[#004F4C] text-slate-800 placeholder-slate-400 shadow-2xs transition-all"
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-2xl bg-[#004F4C] hover:bg-[#003d3a] active:bg-[#002b29] text-white font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
