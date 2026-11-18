import React, { useState } from 'react';
import {
  PlusCircle,
  MessageSquare,
  Sparkles,
  Calendar,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import LeadCard from './LeadCard.jsx';

export default function LeadKanbanBoard({
  leads,
  selectedLeadId,
  onSelectLead,
  onStageChange,
}) {
  const [draggedLeadId, setDraggedLeadId] = useState(null);
  const [activeDropStage, setActiveDropStage] = useState(null);

  // Six PRD-mandated Kanban Stages
  const columns = [
    {
      id: 'New',
      title: 'New',
      icon: PlusCircle,
      pillStyle: 'bg-[#e0f2fe] text-[#0369a1]',
    },
    {
      id: 'Contacted',
      title: 'Contacted',
      icon: MessageSquare,
      pillStyle: 'bg-[#ccfbf1] text-[#0f766e]',
    },
    {
      id: 'Qualified',
      title: 'Qualified',
      icon: Sparkles,
      pillStyle: 'bg-[#ede9fe] text-[#6d28d9]',
    },
    {
      id: 'Follow-up',
      title: 'Follow-up',
      icon: Calendar,
      pillStyle: 'bg-[#ffedd5] text-[#c2410c]',
    },
    {
      id: 'Converted',
      title: 'Converted',
      icon: CheckCircle2,
      pillStyle: 'bg-[#dcfce7] text-[#15803d]',
    },
    {
      id: 'Lost',
      title: 'Lost',
      icon: XCircle,
      pillStyle: 'bg-slate-100 text-slate-600',
    },
  ];

  const handleDragStart = (e, leadId) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.setData('text/plain', leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, stageId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeDropStage !== stageId) {
      setActiveDropStage(stageId);
    }
  };

  const handleDragLeave = stageId => {
    if (activeDropStage === stageId) {
      setActiveDropStage(null);
    }
  };

  const handleDrop = (e, targetStage) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
    setActiveDropStage(null);
    setDraggedLeadId(null);

    if (leadId && targetStage) {
      onStageChange(leadId, targetStage);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-3.5 items-start select-none">
      {columns.map(col => {
        const Icon = col.icon;
        const stageLeads = leads.filter(l => {
          if (l.stage === col.id) return true;
          // Graceful fallback: map legacy 'In Progress' to 'Contacted'
          if (l.stage === 'In Progress' && col.id === 'Contacted') return true;
          return false;
        });
        const isDropTarget = activeDropStage === col.id;

        return (
          <div
            key={col.id}
            onDragOver={e => handleDragOver(e, col.id)}
            onDragLeave={() => handleDragLeave(col.id)}
            onDrop={e => handleDrop(e, col.id)}
            className={`flex flex-col rounded-2xl p-1.5 transition-all min-h-[300px] ${
              isDropTarget
                ? 'bg-[#e6f7f2] ring-2 ring-[#0f766e]'
                : 'bg-transparent'
            }`}
          >
            {/* Column Header Pill matching Design System */}
            <div
              className={`px-3 py-2 rounded-xl flex items-center justify-between font-bold text-xs mb-2.5 shadow-2xs ${col.pillStyle}`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{col.title}</span>
              </div>
              <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-full bg-white/70">
                {stageLeads.length}
              </span>
            </div>

            {/* Cards List */}
            <div className="space-y-2.5">
              {stageLeads.length === 0 ? (
                <div className="p-5 text-center text-[11px] text-slate-400 border border-dashed border-slate-200/90 rounded-xl bg-white/40">
                  No {col.title.toLowerCase()} leads
                </div>
              ) : (
                stageLeads.map(lead => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    isSelected={selectedLeadId === lead.id}
                    onClick={() => onSelectLead(lead)}
                    onDragStart={e => handleDragStart(e, lead.id)}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
