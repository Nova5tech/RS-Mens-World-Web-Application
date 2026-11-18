import React, { useState, useEffect } from 'react';
import {
  LayoutGrid,
  Table as TableIcon,
  Search,
  SlidersHorizontal,
  Plus,
} from 'lucide-react';
import { leadService } from '../services/leadService.js';
import { useBranch } from '../context/BranchContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import LeadKanbanBoard from '../components/leads/LeadKanbanBoard.jsx';
import LeadTableView from '../components/leads/LeadTableView.jsx';
import LeadDetailsPanel from '../components/leads/LeadDetailsPanel.jsx';
import AddLeadModal from '../components/leads/AddLeadModal.jsx';

export default function LeadsPage({ isAddModalOpen: propIsAddOpen, setIsAddModalOpen: propSetIsAddOpen }) {
  const [localIsAddOpen, setLocalIsAddOpen] = useState(false);
  const isAddModalOpen = propIsAddOpen !== undefined ? propIsAddOpen : localIsAddOpen;
  const setIsAddModalOpen = propSetIsAddOpen || setLocalIsAddOpen;

  const { activeBranchId } = useBranch();
  const { isBranchUser, currentUser } = useAuth();
  const { showToast } = useToast();

  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);

  // Reference pipeline data matching screenshot exactly
  const initialLeads = [
    // Column 1: New (12)
    {
      id: 'L-3821',
      name: 'Rohit Verma',
      enquiry: "Men's wedding wear collection",
      stage: 'New',
      branchLabel: 'Branch 1',
      preferredBranchId: 'Branch 1 (Anna Nagar)',
      mobile: '+91 98111 22334',
      aiCategory: 'Wedding Wear',
      timeAgo: '5 min ago',
      followUpDateFormatted: 'Nov 19, 2025',
    },
    {
      id: 'L-3822',
      name: 'Kiran Das',
      enquiry: 'Casual shirts enquiry',
      stage: 'New',
      branchLabel: 'Branch 2',
      preferredBranchId: 'Branch 2 (Rajahmundry)',
      mobile: '+91 98222 33445',
      aiCategory: 'Casual Shirts',
      timeAgo: '10 min ago',
      followUpDateFormatted: 'Nov 19, 2025',
    },
    {
      id: 'L-3823',
      name: 'Amit Joshi',
      enquiry: 'Store location and timing',
      stage: 'New',
      branchLabel: 'Branch 1',
      preferredBranchId: 'Branch 1 (Anna Nagar)',
      mobile: '+91 98333 44556',
      aiCategory: 'General Enquiry',
      timeAgo: '25 min ago',
      followUpDateFormatted: 'Nov 20, 2025',
    },

    // Column 2: In Progress (8)
    {
      id: 'L-3824',
      name: 'Sandeep Rao',
      enquiry: 'Formal wear in bulk',
      stage: 'In Progress',
      branchLabel: 'Branch 3',
      preferredBranchId: 'Branch 3 (Eluru)',
      mobile: '+91 98444 55667',
      aiCategory: 'Formal Wear',
      timeAgo: '1 hr ago',
      followUpDateFormatted: 'Nov 21, 2025',
    },
    {
      id: 'L-3825',
      name: 'Neha Iyer',
      enquiry: 'Party wear collection',
      stage: 'In Progress',
      branchLabel: 'Branch 2',
      preferredBranchId: 'Branch 2 (Kakinada)',
      mobile: '+91 98555 66778',
      aiCategory: 'Party Wear',
      timeAgo: '2 hr ago',
      followUpDateFormatted: 'Nov 21, 2025',
    },
    {
      id: 'L-3826',
      name: 'Manoj Gupta',
      enquiry: 'Size availability (L)',
      stage: 'In Progress',
      branchLabel: 'Branch 4',
      preferredBranchId: 'Branch 4 (Vijayawada)',
      mobile: '+91 98666 77889',
      aiCategory: 'Suits & Blazers',
      timeAgo: '3 hr ago',
      followUpDateFormatted: 'Nov 22, 2025',
    },

    // Column 3: Follow-up (5) - Includes Priya Sharma selected in screenshot
    {
      id: 'L-3816',
      name: 'Priya Sharma',
      enquiry: 'Offer details and pricing',
      stage: 'Follow-up',
      branchLabel: 'Branch 1',
      preferredBranchId: 'Branch 1 (Anna Nagar)',
      mobile: '+91 98450 12345',
      aiCategory: 'Formal Wear',
      timeAgo: 'Today',
      followUpDateFormatted: 'Nov 20, 2025',
      notes: [
        {
          text: 'Interested in festive collection. Share latest offers and available sizes.',
        },
      ],
    },
    {
      id: 'L-3827',
      name: 'Vishal Mehta',
      enquiry: 'Purchase completed - need more options',
      stage: 'Follow-up',
      branchLabel: 'Branch 3',
      preferredBranchId: 'Branch 3 (Eluru)',
      mobile: '+91 98777 88990',
      aiCategory: 'Formal Shirts',
      timeAgo: 'Tomorrow',
      followUpDateFormatted: 'Nov 21, 2025',
    },
    {
      id: 'L-3828',
      name: 'Arjun Reddy',
      enquiry: 'Order status inquiry',
      stage: 'Follow-up',
      branchLabel: 'Branch 2',
      preferredBranchId: 'Branch 2 (Rajahmundry)',
      mobile: '+91 98888 99001',
      aiCategory: 'Linen Blazers',
      timeAgo: 'Tomorrow',
      followUpDateFormatted: 'Nov 21, 2025',
    },

    // Column 4: Converted (4)
    {
      id: 'L-3829',
      name: 'Arjun Pillai',
      enquiry: 'Order placed – 2 shirts',
      stage: 'Converted',
      branchLabel: 'Branch 1',
      preferredBranchId: 'Branch 1 (Anna Nagar)',
      mobile: '+91 98999 00112',
      aiCategory: 'Formal Wear',
      timeAgo: '2 days ago',
      followUpDateFormatted: 'Completed',
    },
    {
      id: 'L-3830',
      name: 'Meera Nair',
      enquiry: 'Purchased formal shirt',
      stage: 'Converted',
      branchLabel: 'Branch 4',
      preferredBranchId: 'Branch 4 (Vijayawada)',
      mobile: '+91 99000 11223',
      aiCategory: 'Formal Shirts',
      timeAgo: '3 days ago',
      followUpDateFormatted: 'Completed',
    },
    {
      id: 'L-3831',
      name: 'Vikram Singh',
      enquiry: 'Completed in-store purchase',
      stage: 'Converted',
      branchLabel: 'Branch 2',
      preferredBranchId: 'Branch 2 (Kakinada)',
      mobile: '+91 99111 22334',
      aiCategory: 'Wedding Wear',
      timeAgo: '4 days ago',
      followUpDateFormatted: 'Completed',
    },
  ];

  const [leads, setLeads] = useState(initialLeads);

  // Load persisted leads from leadService and merge with reference dataset
  useEffect(() => {
    async function syncLeads() {
      try {
        const storedLeads = await leadService.getLeads({ branchId: effectiveBranchId });
        if (storedLeads && storedLeads.length > 0) {
          // Normalize stored leads into table/kanban shape
          const mappedStored = storedLeads.map(l => ({
            id: l.id,
            name: l.name,
            enquiry: l.enquiry,
            stage: l.stage,
            branchLabel: l.preferredBranchId === 'B2' ? 'Branch 2' : l.preferredBranchId === 'B3' ? 'Branch 3' : l.preferredBranchId === 'B4' ? 'Branch 4' : 'Branch 1',
            preferredBranchId: l.preferredBranchId || 'Branch 1 (Anna Nagar)',
            mobile: l.mobile,
            aiCategory: l.aiCategory || 'General Enquiry',
            timeAgo: 'Recently',
            followUpDateFormatted: l.followUpDate ? l.followUpDate.slice(0, 10) : 'Nov 20, 2025',
          }));

          // Deduplicate by ID
          const existingIds = new Set(mappedStored.map(m => m.id));
          const remainingInitial = initialLeads.filter(init => !existingIds.has(init.id));
          setLeads([...mappedStored, ...remainingInitial]);
        }
      } catch (err) {
        console.error('Failed to sync leads from service:', err);
      }
    }
    syncLeads();
  }, [effectiveBranchId]);

  // Set Priya Sharma as default selected lead matching screenshot
  useEffect(() => {
    if (!selectedLead && leads.length > 0) {
      const priya = leads.find(l => l.name === 'Priya Sharma');
      if (priya) setSelectedLead(priya);
      else setSelectedLead(leads[0]);
    }
  }, [leads]);

  const handleStageChange = async (leadId, newStage) => {
    setLeads(prev =>
      prev.map(l => (l.id === leadId ? { ...l, stage: newStage } : l))
    );
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead(prev => ({ ...prev, stage: newStage }));
    }
    try {
      await leadService.updateLead(leadId, { stage: newStage });
    } catch (e) {
      // Ignore in mock
    }
    showToast(`Lead moved to ${newStage}`, 'success');
  };

  const handleUpdateLead = async (leadId, updates) => {
    setLeads(prev =>
      prev.map(l => (l.id === leadId ? { ...l, ...updates } : l))
    );
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead(prev => ({ ...prev, ...updates }));
    }
    try {
      await leadService.updateLead(leadId, updates);
    } catch (e) {
      // Ignore in mock
    }
  };

  const handleCreateNewLead = async newLeadData => {
    try {
      const savedLead = await leadService.createLead({
        name: newLeadData.name,
        mobile: newLeadData.mobile,
        email: newLeadData.email || null,
        enquiry: newLeadData.enquiry,
        preferredBranchId: newLeadData.preferredBranchId || 'B1',
        assignedBranchId: newLeadData.preferredBranchId || 'B1',
        source: 'Manual Walk-in',
        stage: 'New',
        consentToContact: true,
      });

      const created = {
        id: savedLead.id || `L-${Date.now().toString().slice(-4)}`,
        name: savedLead.name,
        enquiry: savedLead.enquiry,
        mobile: savedLead.mobile,
        stage: 'New',
        branchLabel: newLeadData.preferredBranchId || 'Branch 1',
        preferredBranchId: newLeadData.preferredBranchId || 'Branch 1 (Anna Nagar)',
        timeAgo: 'Just now',
        followUpDateFormatted: 'Nov 20, 2025',
      };
      setLeads(prev => [created, ...prev]);
      setSelectedLead(created);
      showToast('New lead added to pipeline', 'success');
    } catch (err) {
      showToast('Failed to save lead', 'error');
    }
  };

  // Filter leads based on search term
  const filteredLeads = leads.filter(l => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      l.name.toLowerCase().includes(q) ||
      (l.mobile && l.mobile.includes(q)) ||
      (l.enquiry && l.enquiry.toLowerCase().includes(q)) ||
      (l.branchLabel && l.branchLabel.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-6 font-sans">
      {/* Top Action & View Toggle Bar matching screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: View Mode Toggles (Kanban / Table) */}
        <div className="flex items-center gap-2">
          {/* Kanban Button */}
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              viewMode === 'kanban'
                ? 'bg-[#0f766e] text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Kanban</span>
          </button>

          {/* Table Button */}
          <button
            onClick={() => setViewMode('table')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              viewMode === 'table'
                ? 'bg-[#0f766e] text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <TableIcon className="w-4 h-4" />
            <span>Table</span>
          </button>
        </div>

        {/* Right: Search, Filter, and Add Lead */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search leads, name or phone..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-[#0f766e] text-slate-800 placeholder-slate-400 transition-colors shadow-2xs"
            />
          </div>

          {/* Filters Button */}
          <button
            onClick={() => showToast('Filters applied for active month', 'info')}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>Filters</span>
          </button>

          {/* Add Lead Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#0f766e] hover:bg-[#0c5c56] active:bg-[#094742] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Main Board Area */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Kanban Board Columns (~72% width when details open, 100% when closed) */}
          <div className={selectedLead ? 'lg:col-span-8 xl:col-span-9' : 'lg:col-span-12'}>
            <LeadKanbanBoard
              leads={filteredLeads}
              selectedLeadId={selectedLead?.id}
              onSelectLead={lead => setSelectedLead(lead)}
              onStageChange={handleStageChange}
            />
          </div>

          {/* Right Lead Details Panel (~28% width matching screenshot) */}
          {selectedLead && (
            <div className="lg:col-span-4 xl:col-span-3 sticky top-4">
              <LeadDetailsPanel
                lead={selectedLead}
                onClose={() => setSelectedLead(null)}
                onUpdateLead={handleUpdateLead}
                onEditLead={() => setIsAddModalOpen(true)}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <LeadTableView
            leads={filteredLeads}
            onSelectLead={lead => {
              setSelectedLead(lead);
              setViewMode('kanban');
            }}
          />
        </div>
      )}

      {/* Add Lead Modal */}
      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCreateLead={handleCreateNewLead}
      />
    </div>
  );
}
