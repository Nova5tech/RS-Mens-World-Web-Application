import React, { useState } from 'react';
import { PlusCircle, RefreshCw, Calendar, CheckCircle2 } from 'lucide-react';
import LeadCard from './LeadCard.jsx';

export default function LeadKanbanBoard({
  leads,
  selectedLeadId,
  onSelectLead,
  onStageChange,
}) {
  const [draggedLeadId, setDraggedLeadId] = useState(null);
  const [activeDropStage, setActiveDropStage] = useState(null);

  const columns = [
    {
      id: 'New',
      title: 'New',
      icon: PlusCircle,
      pillStyle: 'bg-[#e0f2fe] text-[#0369a1]',
    },
    {
      id: 'In Progress',
      title: 'In Progress',
      icon: RefreshCw,
      pillStyle: 'bg-[#fef9c3] text-[#a16207]',
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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start select-none">
      {columns.map(col => {
        const Icon = col.icon;
        const stageLeads = leads.filter(l => l.stage === col.id);
        const isDropTarget = activeDropStage === col.id;

        return (
          <div
            key={col.id}
            onDragOver={e => handleDragOver(e, col.id)}
            onDragLeave={() => handleDragLeave(col.id)}
            onDrop={e => handleDrop(e, col.id)}
            className={`flex flex-col rounded-2xl p-2 transition-all ${isDropTarget
              ? 'bg-slate-200/50 ring-2 ring-[#0f766e]'
              : 'bg-transparent'
              }`}
          >
            {/* Column Header Pill matching screenshot */}
            <div
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 font-bold text-xs mb-3 shadow-2xs ${col.pillStyle}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>
                {col.title} ({stageLeads.length})
              </span>
            </div>

            {/* Cards List */}
            <div className="space-y-3 min-h-[380px]">
              {stageLeads.map(lead => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  isSelected={selectedLeadId === lead.id}
                  onClick={onSelectLead}
                  onDragStart={handleDragStart}
                />
              ))}

              {stageLeads.length === 0 && (
                <div className="p-6 text-center border-2 border-dashed border-slate-200/80 rounded-2xl text-xs text-slate-400">
                  No leads in {col.title}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
