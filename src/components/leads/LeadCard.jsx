import React from 'react';
import { Store, Clock } from 'lucide-react';

export default function LeadCard({ lead, isSelected, onClick, onDragStart }) {
  const stageBadges = {
    New: 'bg-[#dcfce7] text-[#15803d]',
    'In Progress': 'bg-[#fef3c7] text-[#b45309]',
    'Follow-up': 'bg-[#ffedd5] text-[#c2410c]',
    Converted: 'bg-[#dcfce7] text-[#15803d]',
    Lost: 'bg-slate-100 text-slate-600',
  };

  const badgeStyle = stageBadges[lead.stage] || 'bg-[#dcfce7] text-[#15803d]';

  return (
    <div
      draggable
      onDragStart={e => onDragStart && onDragStart(e, lead.id)}
      onClick={() => onClick && onClick(lead)}
      className={`bg-white p-3.5 rounded-2xl border transition-all cursor-pointer select-none space-y-2 shadow-2xs hover:shadow-xs ${
        isSelected
          ? 'ring-2 ring-[#004F4C]/40 border-[#004F4C]'
          : 'border-slate-100 hover:border-slate-200'
      }`}
    >
      {/* Top Header: Customer Name and Stage Badge */}
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
          {lead.name}
        </h4>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${badgeStyle}`}>
          {lead.stage}
        </span>
      </div>

      {/* Enquiry description */}
      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
        {lead.enquiry || lead.aiSummary}
      </p>

      {/* Footer: Branch & Time */}
      <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 font-medium">
        <span className="flex items-center gap-1.5 text-slate-500">
          <Store className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{lead.branchLabel || lead.preferredBranchId || 'Branch 1'}</span>
        </span>

        <span className="flex items-center gap-1 text-slate-400 shrink-0">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>{lead.followUpDateFormatted || lead.timeAgo || 'Today'}</span>
        </span>
      </div>
    </div>
  );
}
