import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const WebsiteChatButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Website Chat trigger */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full text-xs font-semibold shadow-lg transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer select-none',
            isOpen
              ? 'bg-slate-800 text-white'
              : 'bg-primary-brand text-white border border-emerald-600/30 hover:bg-[#0B3B2E]'
          )}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-brand opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-brand"></span>
          </span>
          <span>Website Chat</span>
        </button>
      </div>

      {/* Simulated Chat Widget Popover */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-40 w-80 bg-white rounded-2xl shadow-dropdown border border-border-card overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="bg-sidebar-bg text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-accent-brand/20 flex items-center justify-center text-accent-brand font-bold text-xs">
                RS
              </div>
              <div>
                <h4 className="text-xs font-semibold">RS Mens World Assistant</h4>
                <p className="text-[11px] text-accent-brand">Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-300 hover:text-white p-1 rounded-md cursor-pointer"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>
          <div className="p-4 h-64 overflow-y-auto space-y-3 text-xs bg-slate-50">
            <div className="bg-white p-3 rounded-xl border border-border-card max-w-[85%] text-app-text shadow-card">
              Hello! 👋 Welcome to RS Mens World Customer Engagement Platform. How can we help you today?
            </div>
          </div>
          <div className="p-3 border-t border-border-card bg-white flex items-center gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 text-xs border border-border-card rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-brand/50"
            />
            <button className="bg-primary-brand text-white p-2 rounded-xl text-xs hover:bg-[#0B3B2E] cursor-pointer">
              <MessageSquare className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
