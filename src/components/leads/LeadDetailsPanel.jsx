import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  Store,
  Tag,
  Calendar,
  Activity,
  FileText,
  MessageCircle,
  Edit3,
  Check,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';

export default function LeadDetailsPanel({
  lead,
  onClose,
  onUpdateLead,
  onEditLead,
}) {
  const { showToast } = useToast();
  const [selectedStage, setSelectedStage] = useState(lead?.stage || 'Follow-up');

  if (!lead) return null;

  const handleStageChange = async e => {
    const newStage = e.target.value;
    setSelectedStage(newStage);
    if (onUpdateLead) {
      await onUpdateLead(lead.id, { stage: newStage });
      showToast(`Lead stage updated to ${newStage}`, 'success');
    }
  };

  const handleSendWhatsApp = () => {
    showToast(`Opening WhatsApp chat with ${lead.name} (${lead.mobile || '+91 98450 12345'})`, 'success');
    window.open(`https://wa.me/${(lead.mobile || '919845012345').replace(/[^0-9]/g, '')}`, '_blank');
  };

  const handleMarkConverted = async () => {
    if (onUpdateLead) {
      await onUpdateLead(lead.id, { stage: 'Converted' });
      setSelectedStage('Converted');
      showToast(`${lead.name} marked as Converted!`, 'success');
    }
  };

  const stageBadgeStyle = {
    New: 'bg-[#dcfce7] text-[#15803d]',
    'In Progress': 'bg-[#fef3c7] text-[#b45309]',
    'Follow-up': 'bg-[#ffedd5] text-[#c2410c]',
    Converted: 'bg-[#dcfce7] text-[#15803d]',
  }[selectedStage] || 'bg-[#ffedd5] text-[#c2410c]';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between select-none">
      <div className="space-y-5">
        {/* Header: Title and Close button */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">
            Lead Details
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Close details"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Identity Box */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#ccfbf1] text-[#0f766e] flex items-center justify-center font-bold text-xs shrink-0">
              <User className="w-5 h-5 text-[#0f766e]" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                {lead.name}
              </h4>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Lead ID: {lead.id ? (lead.id.startsWith('L-') ? lead.id : `L-${lead.id.slice(-4)}`) : 'L-3816'}
              </p>
            </div>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${stageBadgeStyle}`}>
            {selectedStage}
          </span>
        </div>

        {/* Properties List */}
        <div className="space-y-3.5 text-xs">
          {/* Phone */}
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-bold text-slate-900">{lead.mobile || '+91 98450 12345'}</span>
          </div>

          {/* Branch */}
          <div className="flex items-center gap-3">
            <Store className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-medium text-slate-700">
              {lead.branchLabel || lead.preferredBranchId || 'Branch 1 (Anna Nagar)'}
            </span>
          </div>

          {/* Interest */}
          <div className="flex items-center gap-3">
            <Tag className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-medium text-slate-700">
              {lead.aiCategory ? `${lead.aiCategory}, Offer` : 'Formal Wear, Offer'}
            </span>
          </div>

          {/* Follow-up date */}
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-medium text-slate-700">
              Follow-up: {lead.followUpDateFormatted || 'Nov 20, 2025'}
            </span>
          </div>

          {/* Lead Stage Select */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3 text-slate-700 font-medium">
              <Activity className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Lead Stage:</span>
            </div>
            <select
              value={selectedStage}
              onChange={handleStageChange}
              className="py-1 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-[#0f766e] cursor-pointer shadow-2xs"
            >
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Converted">Converted</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
        </div>

        {/* Notes Section */}
        <div className="pt-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-2">
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Notes</span>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
            {lead.notes && lead.notes.length > 0
              ? lead.notes[0].text
              : 'Interested in festive collection. Share latest offers and available sizes.'}
          </div>
        </div>
      </div>

      {/* Action Buttons matching reference screenshot */}
      <div className="space-y-2 pt-6">
        {/* Send WhatsApp */}
        <button
          onClick={handleSendWhatsApp}
          className="w-full py-3 px-4 rounded-xl bg-[#064e43] hover:bg-[#085a4e] active:bg-[#053e35] text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Send WhatsApp</span>
        </button>

        {/* Edit Lead */}
        <button
          onClick={() => onEditLead && onEditLead(lead)}
          className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
        >
          <Edit3 className="w-4 h-4 text-slate-500" />
          <span>Edit Lead</span>
        </button>

        {/* Mark as Converted */}
        <button
          onClick={handleMarkConverted}
          className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 text-slate-700 hover:text-emerald-700 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
        >
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Mark as Converted</span>
        </button>
      </div>
    </div>
  );
}

