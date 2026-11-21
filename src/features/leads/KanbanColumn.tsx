import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { PlusCircle, RefreshCw, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { Lead, LeadStage } from '@/types/models';
import { LeadCard } from './LeadCard';

interface KanbanColumnProps {
  stage: LeadStage;
  leads: Lead[];
  selectedLeadId?: string;
  onSelectLead: (lead: Lead) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  stage,
  leads,
  selectedLeadId,
  onSelectLead,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
  });

  const columnConfig: Record<
    LeadStage,
    { label: string; icon: React.ElementType; bgHeader: string; border: string; text: string }
  > = {
    new: {
      label: 'New',
      icon: PlusCircle,
      bgHeader: 'bg-sky-50',
      border: 'border-sky-200/60',
      text: 'text-sky-900',
    },
    in_progress: {
      label: 'In Progress',
      icon: RefreshCw,
      bgHeader: 'bg-amber-50',
      border: 'border-amber-200/60',
      text: 'text-amber-900',
    },
    follow_up: {
      label: 'Follow-up',
      icon: Calendar,
      bgHeader: 'bg-orange-50',
      border: 'border-orange-200/60',
      text: 'text-orange-900',
    },
    converted: {
      label: 'Converted',
      icon: CheckCircle2,
      bgHeader: 'bg-emerald-50',
      border: 'border-emerald-200/60',
      text: 'text-emerald-900',
    },
    lost: {
      label: 'Lost',
      icon: XCircle,
      bgHeader: 'bg-rose-50',
      border: 'border-rose-200/60',
      text: 'text-rose-900',
    },
  };

  const config = columnConfig[stage];
  const Icon = config.icon;

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-w-[280px] w-full max-w-[320px] rounded-2xl bg-gray-50/70 border transition-all ${
        isOver
          ? 'border-[#0F4C3A] bg-[#E6F7EF]/30 ring-2 ring-[#0F4C3A]/20'
          : 'border-gray-200/70'
      }`}
    >
      {/* Column Header */}
      <div className="p-3">
        <div
          className={`flex items-center justify-between px-3 py-2 rounded-xl font-semibold text-xs border ${config.bgHeader} ${config.border} ${config.text}`}
        >
          <div className="flex items-center gap-1.5">
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span>{config.label}</span>
          </div>
          <span className="px-1.5 py-0.5 rounded-full bg-white/80 shadow-2xs font-bold text-[11px]">
            {leads.length}
          </span>
        </div>
      </div>

      {/* Cards list */}
      <div className="flex-1 p-3 pt-0 space-y-3 overflow-y-auto max-h-[calc(100vh-270px)] scrollbar-thin">
        {leads.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl text-center p-3 text-xs text-gray-400">
            No leads in {config.label.toLowerCase()}
          </div>
        ) : (
          leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              isSelected={lead.id === selectedLeadId}
              onClick={() => onSelectLead(lead)}
            />
          ))
        )}
      </div>
    </div>
  );
};
