import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutGrid,
  Table as TableIcon,
  Search,
  Filter,
  Plus,
} from 'lucide-react';
import { Lead, LeadFilterOptions, LeadStage } from '@/types/models';
import { leadsService } from '@/services/leads';
import { useAuth } from '@/features/auth/useAuth';
import { Button } from '@/components/ui/Button';
import { KanbanBoard } from './KanbanBoard';
import { LeadTable } from './LeadTable';
import { LeadDetailsDrawer } from './LeadDetailsDrawer';
import { AddLeadDrawer } from './AddLeadDrawer';
import { FilterLeadsPopover } from './FilterLeadsPopover';
import { ConvertLeadDialog } from './ConvertLeadDialog';
import { LostReasonDialog } from './LostReasonDialog';

export const LeadsPage: React.FC = () => {
  const { user } = useAuth();
  const isBranchUser = user?.role === 'branch_user';

  // View state: 'kanban' | 'table'
  const [view, setView] = useState<'kanban' | 'table'>('kanban');

  // Filter state
  const [filters, setFilters] = useState<LeadFilterOptions>({
    branch_id: (isBranchUser ? user?.branch_id : 'all') || 'all',
    priority: 'all',
    source: 'all',
    follow_up: 'all',
    search: '',
    stage: 'all',
    show_lost: false,
  });

  // Table pagination state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Data state
  const [leads, setLeads] = useState<Lead[]>([]);

  // Selection state
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Dialog & Drawer state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [convertTargetLead, setConvertTargetLead] = useState<Lead | null>(null);
  const [lostTargetLead, setLostTargetLead] = useState<Lead | null>(null);

  // Load data
  const loadData = useCallback(async () => {
    try {
      if (view === 'kanban') {
        const all = await leadsService.getAllLeadsForKanban(filters);
        setLeads(all);
        setTotalLeads(all.length);
      } else {
        const res = await leadsService.getLeads(filters, page, pageSize);
        setLeads(res.items);
        setTotalLeads(res.total);
        setTotalPages(res.totalPages);
      }
    } catch (err) {
      console.error('Failed to load leads:', err);
    }
  }, [view, filters, page, pageSize]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Keep selected lead synchronized if updated
  useEffect(() => {
    if (selectedLead) {
      const fresh = leads.find((l) => l.id === selectedLead.id);
      if (fresh) setSelectedLead(fresh);
    }
  }, [leads, selectedLead]);

  // Search input handler
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
    setPage(1);
  };

  // Stage change handler
  const handleStageChange = async (leadId: string, targetStage: LeadStage) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    if (targetStage === 'converted') {
      setConvertTargetLead(lead);
    } else if (targetStage === 'lost') {
      setLostTargetLead(lead);
    } else {
      await leadsService.updateLeadStage(leadId, targetStage);
      await loadData();
    }
  };

  // Confirm conversion
  const handleConfirmConvert = async (addToCustomers: boolean) => {
    if (!convertTargetLead) return;
    try {
      await leadsService.convertLead(convertTargetLead.id, addToCustomers);
      setConvertTargetLead(null);
      await loadData();
    } catch (err) {
      console.error('Conversion failed:', err);
    }
  };

  // Confirm lost
  const handleConfirmLost = async (reason: Lead['lost_reason'], notes?: string) => {
    if (!lostTargetLead) return;
    try {
      await leadsService.updateLeadStage(lostTargetLead.id, 'lost', reason, notes);
      setLostTargetLead(null);
      await loadData();
    } catch (err) {
      console.error('Failed to mark lost:', err);
    }
  };

  // Add lead submit
  const handleCreateLead = async (data: any) => {
    await leadsService.createLead(data);
    await loadData();
  };

  // Update lead from drawer
  const handleUpdateLead = async (id: string, updates: Partial<Lead>) => {
    await leadsService.updateLead(id, updates);
    await loadData();
  };

  // Add note from drawer
  const handleAddNote = async (id: string, note: string) => {
    await leadsService.addLeadNote(id, note);
    await loadData();
  };

  // Table selection toggles
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === leads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(leads.map((l) => l.id));
    }
  };

  const hasActiveFilters = Boolean(
    (filters.branch_id && filters.branch_id !== 'all' && !isBranchUser) ||
    (filters.priority && filters.priority !== 'all') ||
    (filters.source && filters.source !== 'all') ||
    (filters.follow_up && filters.follow_up !== 'all')
  );

  return (
    <div className="space-y-6">
      {/* Top Header matching 06-leads-kanban-drawer.png */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Lead Generation
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track and manage potential customers
          </p>
        </div>

        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View Toggle Segmented Control */}
          <div className="flex items-center p-1 bg-gray-100 rounded-xl border border-gray-200/70">
            <button
              type="button"
              onClick={() => setView('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                view === 'kanban'
                  ? 'bg-[#0F4C3A] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              type="button"
              onClick={() => setView('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                view === 'table'
                  ? 'bg-[#0F4C3A] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={filters.search}
              onChange={handleSearchChange}
              placeholder="Search leads, name or phone..."
              className="w-full h-9 pl-9 pr-3 bg-white border border-gray-200 rounded-full text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F4C3A] shadow-2xs placeholder:text-gray-400"
            />
          </div>

          {/* Filters Button */}
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className={`relative inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
              hasActiveFilters
                ? 'border-[#0F4C3A] bg-[#E6F7EF] text-[#0F4C3A]'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[#0F4C3A]" />
            )}
          </button>

          {/* Add Lead Primary Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddOpen(true)}
            className="bg-[#0F4C3A] hover:bg-[#0B3B2E] text-white rounded-xl shadow-xs h-9 px-4 text-xs font-semibold"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Main View Area */}
      {view === 'kanban' ? (
        <KanbanBoard
          leads={leads}
          showLost={filters.show_lost ?? false}
          onToggleShowLost={() =>
            setFilters((prev) => ({ ...prev, show_lost: !prev.show_lost }))
          }
          selectedLeadId={selectedLead?.id}
          onSelectLead={(l) => setSelectedLead(l)}
          onStageChange={handleStageChange}
        />
      ) : (
        <LeadTable
          leads={leads}
          selectedLeadId={selectedLead?.id}
          onSelectLead={(l) => setSelectedLead(l)}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          page={page}
          totalPages={totalPages}
          total={totalLeads}
          pageSize={pageSize}
          onPageChange={(p) => setPage(p)}
        />
      )}

      {/* Lead Details Drawer */}
      <LeadDetailsDrawer
        lead={selectedLead}
        isOpen={Boolean(selectedLead)}
        onClose={() => setSelectedLead(null)}
        onUpdateLead={handleUpdateLead}
        onStageChange={handleStageChange}
        onAddNote={handleAddNote}
        onOpenConvertDialog={(l) => setConvertTargetLead(l)}
        onOpenLostDialog={(l) => setLostTargetLead(l)}
      />

      {/* Add Lead Drawer */}
      <AddLeadDrawer
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleCreateLead}
      />

      {/* Filter Leads Popover */}
      <FilterLeadsPopover
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApply={(f) => {
          setFilters(f);
          setPage(1);
        }}
        onReset={() => {
          setFilters({
            branch_id: (isBranchUser ? user?.branch_id : 'all') || 'all',
            priority: 'all',
            source: 'all',
            follow_up: 'all',
            search: '',
            stage: 'all',
            show_lost: false,
          });
          setPage(1);
        }}
      />

      {/* Convert Lead Confirmation Dialog */}
      <ConvertLeadDialog
        isOpen={Boolean(convertTargetLead)}
        lead={convertTargetLead}
        onClose={() => setConvertTargetLead(null)}
        onConfirm={handleConfirmConvert}
      />

      {/* Lost Reason Dialog */}
      <LostReasonDialog
        isOpen={Boolean(lostTargetLead)}
        lead={lostTargetLead}
        onClose={() => setLostTargetLead(null)}
        onConfirm={handleConfirmLost}
      />
    </div>
  );
};
