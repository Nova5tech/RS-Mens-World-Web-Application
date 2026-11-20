import React from 'react';
import {
  X,
  User,
  Phone,
  Store,
  MessageSquare,
  Clock,
  ShieldCheck,
  Tag,
  Activity,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

export default function ConversationInfoDrawer({ isOpen, onClose, conversation }) {
  if (!isOpen || !conversation) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between p-6 overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Conversation Details</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Thread ID: {conversation.id}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
              aria-label="Close details"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Customer Avatar & Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {conversation.isImageAvatar && conversation.avatarUrl ? (
                <img
                  src={conversation.avatarUrl}
                  alt={conversation.customerName}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-2xs"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#e6f7f2] text-[#008C83] flex items-center justify-center font-bold text-sm">
                  {conversation.avatar || <User className="w-6 h-6 text-[#008C83]" />}
                </div>
              )}
              <div>
                <h4 className="font-bold text-sm text-slate-900">{conversation.customerName}</h4>
                <p className="text-xs text-slate-500 font-mono">{conversation.phone || '+91 98765 43210'}</p>
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                conversation.status === 'OPEN'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : conversation.status === 'PENDING'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {conversation.status || 'OPEN'}
            </span>
          </div>

          {/* Overview Grid */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-2">
                <Store className="w-4 h-4 text-slate-400" />
                Store Branch
              </span>
              <span className="font-bold text-slate-800">{conversation.fullBranchName || conversation.branch}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                Channel / Source
              </span>
              <span className="font-semibold text-slate-800">{conversation.channel || 'WhatsApp'}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                Last Activity
              </span>
              <span className="font-mono text-slate-700">{conversation.time || '2m ago'}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-400" />
                Lead Status
              </span>
              <span className="font-bold text-[#004F4C] bg-[#e6f7f2] px-2 py-0.5 rounded-full text-[11px]">
                {conversation.leadStatus || 'New'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                Scheduled Follow-up
              </span>
              <span className="font-bold text-slate-800">{conversation.followUpDate || 'Nov 20, 2025'}</span>
            </div>
          </div>

          {/* Interests Tags */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Tag className="w-4 h-4 text-[#008C83]" />
              <span>Customer Interests & Tags</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(conversation.interests || ['Formal Shirts', 'Size L']).map(tag => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-[#e6f7f2] text-[#004F4C] border border-[#A8F0D0]/50"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* DPDP Compliance Shield */}
          <div className="p-3.5 bg-[#eefaf6] rounded-xl border border-[#A8F0D0] flex items-start gap-2.5 text-xs text-[#004F4C]">
            <ShieldCheck className="w-4 h-4 text-[#008C83] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">DPDP 2023 Consent Verified: </span>
              Customer explicitly opted into WhatsApp communications via Petpooja POS invoice billing.
            </div>
          </div>

          {/* Context Summary Bullets */}
          {conversation.contextBullets && (
            <div className="space-y-2">
              <h5 className="font-bold text-xs text-slate-800">Captured AI Context</h5>
              <ul className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                {conversation.contextBullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-slate-400 mt-0.5">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#004F4C] hover:bg-[#003d3a] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
