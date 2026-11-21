import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import { Lead, LeadStage } from '@/types/models';
import { KanbanColumn } from './KanbanColumn';
import { LeadCard } from './LeadCard';

interface KanbanBoardProps {
  leads: Lead[];
  showLost: boolean;
  onToggleShowLost: () => void;
  selectedLeadId?: string;
  onSelectLead: (lead: Lead) => void;
  onStageChange: (leadId: string, targetStage: LeadStage) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  leads,
  showLost,
  onToggleShowLost,
  selectedLeadId,
  onSelectLead,
  onStageChange,
}) => {
  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const stages: LeadStage[] = showLost
    ? ['new', 'in_progress', 'follow_up', 'converted', 'lost']
    : ['new', 'in_progress', 'follow_up', 'converted'];

  const handleDragStart = (event: DragStartEvent) => {
    const lead = event.active.data.current?.lead as Lead;
    if (lead) {
      setActiveLead(lead);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveLead(null);

    if (!over) return;

    const targetStage = over.id as LeadStage;
    const leadId = active.id as string;
    const currentLead = leads.find((l) => l.id === leadId);

    if (currentLead && currentLead.stage !== targetStage) {
      onStageChange(leadId, targetStage);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-3">
        {/* Kanban Top Sub-Bar with "Show Lost" toggle */}
        <div className="flex items-center justify-between px-1">
          <div className="text-xs text-gray-500 font-medium">
            Drag cards between columns to change stages
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showLost}
              onChange={onToggleShowLost}
              className="rounded border-gray-300 text-[#0F4C3A] focus:ring-[#0F4C3A] h-4 w-4"
            />
            <span className="text-xs font-medium text-gray-600 hover:text-gray-900">
              Show Lost ({leads.filter((l) => l.stage === 'lost').length})
            </span>
          </label>
        </div>

        {/* Columns Grid */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
          {stages.map((stage) => {
            const columnLeads = leads.filter((l) => l.stage === stage);
            return (
              <KanbanColumn
                key={stage}
                stage={stage}
                leads={columnLeads}
                selectedLeadId={selectedLeadId}
                onSelectLead={onSelectLead}
              />
            );
          })}
        </div>
      </div>

      <DragOverlay>
        {activeLead ? (
          <div className="w-72">
            <LeadCard lead={activeLead} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
