import React, { useState } from 'react';
import {
  PlusCircle,
  RefreshCw,
  Calendar,
  CheckCircle2,
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

  // 4 Kanban Columns matching approved reference screenshot
  const columns = [
    {
      id: 'New',
      title: 'New',
      badgeCount: 12,
      icon: PlusCircle,
      pillStyle: 'bg-[#e0f2fe] text-[#0369a1]',
    },
    {
      id: 'In Progress',
      title: 'In Progress',
      badgeCount: 8,
      icon: RefreshCw,
      pillStyle: 'bg-[#fef9c3] text-[#854d0e]',
    },
    {
      id: 'Follow-up',
      title: 'Follow-up',
      badgeCount: 5,
      icon: Calendar,
      pillStyle: 'bg-[#ffedd5] text-[#c2410c]',
    },
    {
      id: 'Converted',
      title: 'Converted',
      badgeCount: 4,
      icon: CheckCircle2,
      pillStyle: 'bg-[#dcfce7] text-[#15803d]',
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
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 items-start select-none">
      {columns.map(col => {
        const Icon = col.icon;
        const stageLeads = leads.filter(l => {
          if (l.stage === col.id) return true;
          // Graceful fallback: map legacy 'Contacted' and 'Qualified' to 'In Progress'
          if ((l.stage === 'Contacted' || l.stage === 'Qualified') && col.id === 'In Progress') return true;
          return false;
        });
        const isDropTarget = activeDropStage === col.id;

        return (
          <div
            key={col.id}
            onDragOver={e => handleDragOver(e, col.id)}
            onDragLeave={() => handleDragLeave(col.id)}
            onDrop={e => handleDrop(e, col.id)}
            className={`flex flex-col rounded-2xl p-1.5 transition-all min-h-[300px] ${isDropTarget
              ? 'bg-[#e6f7f2] ring-2 ring-[#0f766e]'
              : 'bg-transparent'
              }`}
          >
            {/* Column Header Pill matching Screenshot */}
            <div
              className={`px-3 py-2 rounded-xl flex items-center justify-between font-bold text-xs mb-2.5 shadow-2xs ${col.pillStyle}`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{col.title} ({col.badgeCount || stageLeads.length})</span>
              </div>
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
