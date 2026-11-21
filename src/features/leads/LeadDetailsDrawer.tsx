import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  MessageSquare,
  Store,
  Tag,
  Calendar,
  Sparkles,
  Check,
  Send,
  History,
  AlertCircle,
  UserCheck,
} from 'lucide-react';
import { Lead, LeadStage, LeadPriority } from '@/types/models';
import { Button } from '@/components/ui/Button';
import { formatPhone } from '@/lib/phone';

interface LeadDetailsDrawerProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  onStageChange: (id: string, stage: LeadStage) => void;
  onAddNote: (id: string, note: string) => Promise<void>;
  onOpenConvertDialog: (lead: Lead) => void;
  onOpenLostDialog: (lead: Lead) => void;
}

export const LeadDetailsDrawer: React.FC<LeadDetailsDrawerProps> = ({
  lead,
  isOpen,
  onClose,
  onUpdateLead,
  onStageChange,
  onAddNote,
  onOpenConvertDialog,
  onOpenLostDialog,
}) => {
  const [noteText, setNoteText] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  if (!isOpen || !lead) return null;

  const branchLabels: Record<string, string> = {
    branch_1: 'Branch 1 (Rajahmundry)',
    branch_2: 'Branch 2 (Kakinada)',
    branch_3: 'Branch 3 (Vijayawada)',
    branch_4: 'Branch 4 (Guntur)',
  };

  const stageBadgeClasses: Record<string, string> = {
    new: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    in_progress: 'bg-amber-50 text-amber-700 border-amber-200/60',
    follow_up: 'bg-orange-50 text-orange-700 border-orange-200/60',
    converted: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    lost: 'bg-rose-50 text-rose-700 border-rose-200/60',
  };

  const stageLabels: Record<string, string> = {
    new: 'New',
    in_progress: 'In Progress',
    follow_up: 'Follow-up',
    converted: 'Converted',
    lost: 'Lost',
  };

  const cleanPhone = lead.phone.replace(/\D/g, '');

  const handleStageSelect = (newStage: LeadStage) => {
    if (newStage === 'converted') {
      onOpenConvertDialog(lead);
    } else if (newStage === 'lost') {
      onOpenLostDialog(lead);
    } else {
      onStageChange(lead.id, newStage);
    }
  };

  const handlePrioritySelect = async (newPriority: LeadPriority) => {
    await onUpdateLead(lead.id, { priority: newPriority });
  };

  const handleFollowUpDateChange = async (dateStr: string) => {
    await onUpdateLead(lead.id, { follow_up_date: dateStr });
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    try {
      setIsSubmittingNote(true);
      await onAddNote(lead.id, noteText);
      setNoteText('');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleAcceptAIPriority = async () => {
    if (lead.ai_summary?.suggested_priority) {
      await onUpdateLead(lead.id, { priority: lead.ai_summary.suggested_priority });
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-gray-200 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 text-base">Lead Details</h3>
        <button
          onClick={onClose}
          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
        {/* Customer Profile Hero */}
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900 truncate">
                {lead.customer_name}
              </h2>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${
                  stageBadgeClasses[lead.stage]
                }`}
              >
                {stageLabels[lead.stage]}
              </span>
            </div>
            <div className="font-mono text-xs text-gray-500 mt-0.5">
              Lead ID: {lead.id}
            </div>
          </div>
        </div>

        {/* Contact info list */}
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/70 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{formatPhone(lead.phone)}</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors inline-flex items-center gap-1 font-semibold text-[11px]"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
              <a
                href={`tel:${cleanPhone}`}
                className="p-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors inline-flex items-center gap-1 font-semibold text-[11px]"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call</span>
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <Store className="w-4 h-4 text-gray-400 shrink-0" />
            <span>{branchLabels[lead.branch_id] || lead.branch_id}</span>
          </div>

          {lead.interest_tags.length > 0 && (
            <div className="flex items-start gap-2 pt-1 border-t border-gray-200/50">
              <Tag className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <div className="flex flex-wrap gap-1">
                {lead.interest_tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-700 font-medium text-[11px]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Enquiry text */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Enquiry Description
          </label>
          <div className="p-3 bg-white rounded-xl border border-gray-200 text-xs text-gray-700 leading-relaxed">
            {lead.enquiry}
          </div>
        </div>

        {/* Follow-up Date Card */}
        <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gray-400" />
              Follow-up Date
            </span>
            <input
              type="date"
              value={lead.follow_up_date || ''}
              onChange={(e) => handleFollowUpDateChange(e.target.value)}
              className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0F4C3A]"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleFollowUpDateChange(new Date().toISOString().slice(0, 10))}
              className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() =>
                handleFollowUpDateChange(
                  new Date(Date.now() + 86400000).toISOString().slice(0, 10)
                )
              }
              className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() =>
                handleFollowUpDateChange(
                  new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10)
                )
              }
              className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            >
              +3 Days
            </button>
          </div>
        </div>

        {/* Controls: Stage & Priority */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Lead Stage
            </label>
            <select
              value={lead.stage}
              onChange={(e) => handleStageSelect(e.target.value as LeadStage)}
              className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0F4C3A]"
            >
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="follow_up">Follow-up</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Priority
            </label>
            <select
              value={lead.priority}
              onChange={(e) => handlePrioritySelect(e.target.value as LeadPriority)}
              className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0F4C3A]"
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>

        {/* AI Summary Card */}
        {lead.ai_summary && (
          <div className="p-4 rounded-xl bg-[#E6F7EF]/50 border border-[#46D68C]/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F4C3A]">
                <Sparkles className="w-4 h-4 text-[#0F4C3A]" />
                <span>AI Insights & Summary</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-white text-[#0F4C3A] border border-[#46D68C]/30">
                {lead.ai_summary.category.replace('_', ' ')}
              </span>
            </div>

            {lead.priority !== lead.ai_summary.suggested_priority && (
              <div className="flex items-center justify-between text-xs bg-white/80 p-2 rounded-lg border border-[#46D68C]/30">
                <span className="text-gray-700">
                  Suggested Priority: <strong className="capitalize">{lead.ai_summary.suggested_priority}</strong>
                </span>
                <button
                  onClick={handleAcceptAIPriority}
                  className="px-2 py-0.5 text-[11px] font-semibold text-[#0F4C3A] hover:bg-[#E6F7EF] rounded transition-colors inline-flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  Accept
                </button>
              </div>
            )}

            <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
              {lead.ai_summary.bullets.map((b, idx) => (
                <li key={idx} className="leading-relaxed">
                  {b}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Lost Details if lost */}
        {lead.stage === 'lost' && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-1.5 text-xs text-rose-900">
            <div className="font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Lost Reason: {lead.lost_reason?.replace('_', ' ')}</span>
            </div>
            {lead.lost_notes && <p className="text-rose-800">{lead.lost_notes}</p>}
          </div>
        )}

        {/* Notes Timeline */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Notes ({lead.notes.length})
            </h4>
          </div>

          {/* Add note composer */}
          <form onSubmit={handleAddNote} className="space-y-2">
            <textarea
              rows={2}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add consultation notes, trial feedback, or requirements..."
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0F4C3A] focus:bg-white resize-none"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!noteText.trim() || isSubmittingNote}
                className="bg-[#0F4C3A] hover:bg-[#0B3B2E] text-white text-xs h-8"
              >
                <Send className="w-3 h-3 mr-1" />
                Add Note
              </Button>
            </div>
          </form>

          {/* Notes list */}
          <div className="space-y-2.5">
            {lead.notes.map((n) => (
              <div key={n.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200/70 text-xs space-y-1">
                <div className="flex items-center justify-between text-gray-500 text-[11px]">
                  <span className="font-semibold text-gray-800">{n.author_name}</span>
                  <span>{new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-gray-700 leading-relaxed">{n.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Log */}
        {lead.activities.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              Activity History
            </h4>
            <div className="space-y-2 text-xs">
              {lead.activities.slice(0, 5).map((act) => (
                <div key={act.id} className="flex items-start justify-between text-[11px] text-gray-500">
                  <span className="text-gray-700">{act.description}</span>
                  <span className="shrink-0 ml-2 text-gray-400">
                    {new Date(act.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Drawer Footer Actions */}
      <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-2">
        {lead.stage !== 'lost' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenLostDialog(lead)}
            className="text-rose-700 hover:bg-rose-50 hover:text-rose-800 text-xs"
          >
            Mark Lost
          </Button>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {lead.stage !== 'converted' ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onOpenConvertDialog(lead)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-9"
            >
              <UserCheck className="w-4 h-4 mr-1.5" />
              Convert to Customer
            </Button>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <Check className="w-3.5 h-3.5" />
              Customer Profile Linked
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
