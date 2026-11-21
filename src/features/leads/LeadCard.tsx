import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Store, Clock, Phone, MessageSquare, AlertCircle } from 'lucide-react';
import { Lead } from '@/types/models';

interface LeadCardProps {
  lead: Lead;
  isSelected?: boolean;
  onClick?: () => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead, isSelected, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    data: { lead },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 999,
      }
    : undefined;

  const branchLabels: Record<string, string> = {
    branch_1: 'Branch 1',
    branch_2: 'Branch 2',
    branch_3: 'Branch 3',
    branch_4: 'Branch 4',
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

  // Follow-up status check
  const today = new Date().toISOString().slice(0, 10);
  const isOverdue = lead.follow_up_date && lead.follow_up_date < today && lead.stage !== 'converted' && lead.stage !== 'lost';
  const isToday = lead.follow_up_date && lead.follow_up_date === today;

  let followUpText = 'Recently';
  if (lead.follow_up_date) {
    if (isOverdue) followUpText = 'Overdue';
    else if (isToday) followUpText = 'Today';
    else {
      const d = new Date(lead.follow_up_date);
      followUpText = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }

  const cleanPhone = lead.phone.replace(/\D/g, '');

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`group relative bg-white rounded-2xl p-4 border transition-all cursor-pointer select-none ${
        isDragging
          ? 'opacity-60 shadow-2xl scale-105 rotate-1 border-[#0F4C3A]'
          : isSelected
          ? 'border-2 border-[#0F4C3A] shadow-md ring-2 ring-[#0F4C3A]/10'
          : 'border-gray-200/80 hover:border-gray-300 hover:shadow-md'
      }`}
    >
      {/* Top row: Name & Stage */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <h4 className="font-semibold text-gray-900 text-sm truncate flex-1">
          {lead.customer_name}
        </h4>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
            stageBadgeClasses[lead.stage] || 'bg-gray-100 text-gray-600'
          }`}
        >
          {stageLabels[lead.stage] || lead.stage}
        </span>
      </div>

      {/* Enquiry text */}
      <p className="text-xs text-gray-600 line-clamp-2 mb-3 leading-relaxed">
        {lead.enquiry}
      </p>

      {/* Tags / Priority if high */}
      {lead.priority === 'high' && (
        <div className="mb-2.5 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3" />
            High Priority
          </span>
        </div>
      )}

      {/* Bottom metadata */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
        <div className="flex items-center gap-1.5 truncate">
          <Store className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="truncate">{branchLabels[lead.branch_id] || lead.branch_id}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div
            className={`flex items-center gap-1 font-medium ${
              isOverdue
                ? 'text-rose-600 font-semibold'
                : isToday
                ? 'text-amber-600 font-semibold'
                : 'text-gray-500'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{followUpText}</span>
          </div>

          {/* Quick Action Icons */}
          <div 
            className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <a
              href={`https://wa.me/${cleanPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Open WhatsApp"
              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </a>
            <a
              href={`tel:${cleanPhone}`}
              title="Call Lead"
              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
