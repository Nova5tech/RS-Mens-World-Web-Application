import React, { useState, useEffect } from 'react';
import {
  LayoutGrid,
  Table as TableIcon,
  Search,
  SlidersHorizontal,
  Plus,
  X,
  RotateCcw,
} from 'lucide-react';
import { leadService } from '../services/leadService.js';
import { useBranch } from '../context/BranchContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import LeadKanbanBoard from '../components/leads/LeadKanbanBoard.jsx';
import LeadTableView from '../components/leads/LeadTableView.jsx';
import LeadDetailsPanel from '../components/leads/LeadDetailsPanel.jsx';
import AddLeadModal from '../components/leads/AddLeadModal.jsx';
import LeadFiltersPopover from '../components/leads/LeadFiltersPopover.jsx';

export default function LeadsPage({ isAddModalOpen: propIsAddOpen, setIsAddModalOpen: propSetIsAddOpen }) {
  const [localIsAddOpen, setLocalIsAddOpen] = useState(false);
  const isAddModalOpen = propIsAddOpen !== undefined ? propIsAddOpen : localIsAddOpen;
  const setIsAddModalOpen = propSetIsAddOpen || setLocalIsAddOpen;
  const [editingLead, setEditingLead] = useState(null);

  const { activeBranchId } = useBranch();
  const { isBranchUser, currentUser } = useAuth();
  const { showToast } = useToast();

  const effectiveBranchId = isBranchUser ? currentUser?.assignedBranchId : activeBranchId;

  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [leadFilters, setLeadFilters] = useState({
    branch: 'ALL',
    stage: 'ALL',
    priority: 'ALL',
    source: 'ALL',
  });
  const [focusedStage, setFocusedStage] = useState(null);

  // Reference pipeline data matching screenshot exactly
  const initialLeads = [
    // Column 1: New (12)
    {
      id: 'L-3821',
      name: 'Rohit Verma',
      enquiry: "Men's wedding wear collection",
      stage: 'New',
      branchLabel: 'Branch 1',
      preferredBranchId: 'Branch 1 – Rajahmandary Main Branch',
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
      preferredBranchId: 'Branch 2 – Kakinada Branch',
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
      preferredBranchId: 'Branch 1 – Rajahmandary Main Branch',
      mobile: '+91 98333 44556',
      aiCategory: 'General Enquiry',
      timeAgo: '25 min ago',
      followUpDateFormatted: 'Nov 20, 2025',
    },
    {
      id: 'L-3832',
      name: 'Ramesh Sundaram',
      enquiry: 'Pure silk kurta for engagement',
      stage: 'New',
      branchLabel: 'Branch 3',
      preferredBranchId: 'Branch 3 – Vijayawada Branch',
      mobile: '+91 98451 98765',
      aiCategory: 'Ethnic Wear',
      timeAgo: '35 min ago',
      followUpDateFormatted: 'Nov 20, 2025',
    },
    {
      id: 'L-3833',
      name: 'Praveen Chander',
      enquiry: 'Custom tailored tuxedo fit trial',
      stage: 'New',
      branchLabel: 'Branch 1',
      preferredBranchId: 'Branch 1 – Rajahmandary Main Branch',
      mobile: '+91 98761 11223',
      aiCategory: 'Suits & Blazers',
      timeAgo: '42 min ago',
      followUpDateFormatted: 'Nov 20, 2025',
    },
    {
      id: 'L-3834',
      name: 'Harish Varma',
      enquiry: 'Modi jackets in pastel shades',
      stage: 'New',
      branchLabel: 'Branch 4',
      preferredBranchId: 'Branch 4 – Guntur Branch',
      mobile: '+91 98321 44556',
      aiCategory: 'Ethnic Wear',
      timeAgo: '50 min ago',
      followUpDateFormatted: 'Nov 21, 2025',
    },
    {
      id: 'L-3835',
      name: 'Dinesh Balaji',
      enquiry: 'Formal trousers slim fit size 34',
      stage: 'New',
      branchLabel: 'Branch 2',
      preferredBranchId: 'Branch 2 – Kakinada Branch',
      mobile: '+91 98432 55667',
      aiCategory: 'Trousers',
      timeAgo: '1 hr ago',
      followUpDateFormatted: 'Nov 21, 2025',
    },
    {
      id: 'L-3836',
      name: 'Venkat Raman',
      enquiry: 'Wedding bandhgala with custom safa',
      stage: 'New',
      branchLabel: 'Branch 1',
      preferredBranchId: 'Branch 1 – Rajahmandary Main Branch',
      mobile: '+91 98654 66778',
      aiCategory: 'Wedding Wear',
      timeAgo: '1 hr ago',
      followUpDateFormatted: 'Nov 21, 2025',
    },
    {
      id: 'L-3837',
      name: 'Karthik Raja',
      enquiry: 'Italian fabric formal blazers',
      stage: 'New',
      branchLabel: 'Branch 3',
      preferredBranchId: 'Branch 3 – Vijayawada Branch',
      mobile: '+91 98765 77889',
      aiCategory: 'Suits & Blazers',
      timeAgo: '2 hr ago',
      followUpDateFormatted: 'Nov 22, 2025',
    },
    {
      id: 'L-3838',
      name: 'Gowtham N',
      enquiry: 'Linen casual shirts collection',
      stage: 'New',
      branchLabel: 'Branch 4',
      preferredBranchId: 'Branch 4 – Guntur Branch',
      mobile: '+91 98876 88990',
      aiCategory: 'Casual Shirts',
      timeAgo: '2 hr ago',
      followUpDateFormatted: 'Nov 22, 2025',
    },
    {
      id: 'L-3839',
      name: 'Senthil Kumar',
      enquiry: 'Sherwani alteration inquiry',
      stage: 'New',
      branchLabel: 'Branch 2',
      preferredBranchId: 'Branch 2 – Kakinada Branch',
      mobile: '+91 98987 99001',
      aiCategory: 'Alteration',
      timeAgo: '3 hr ago',
      followUpDateFormatted: 'Nov 22, 2025',
    },
    {
      id: 'L-3840',
      name: 'Mahesh Babu',
      enquiry: 'Festive festive promo discounts',
      stage: 'New',
      branchLabel: 'Branch 1',
      preferredBranchId: 'Branch 1 – Rajahmandary Main Branch',
      mobile: '+91 98123 00112',
      aiCategory: 'General Enquiry',
      timeAgo: '3 hr ago',
      followUpDateFormatted: 'Nov 22, 2025',
    },

    // Column 2: In Progress (8)
    {
      id: 'L-3824',
      name: 'Sandeep Rao',
      enquiry: 'Formal wear in bulk',
      stage: 'In Progress',
      branchLabel: 'Branch 3',
      preferredBranchId: 'Branch 3 – Vijayawada Branch',
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
      preferredBranchId: 'Branch 2 – Kakinada Branch',
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
      preferredBranchId: 'Branch 4 – Guntur Branch',
      mobile: '+91 98666 77889',
      aiCategory: 'Suits & Blazers',
      timeAgo: '3 hr ago',
      followUpDateFormatted: 'Nov 22, 2025',
    },
    {
      id: 'L-3841',
      name: 'Ashwin Narayanan',
      enquiry: 'Corporate uniform trial booking',
      stage: 'In Progress',
      branchLabel: 'Branch 1',
      preferredBranchId: 'Branch 1 – Rajahmandary Main Branch',
      mobile: '+91 98234 11223',
      aiCategory: 'Corporate Wear',
      timeAgo: '4 hr ago',
      followUpDateFormatted: 'Nov 22, 2025',
    },
    {
      id: 'L-3842',
      name: 'Balaji Krishnan',
      enquiry: 'Groom waistcoat styling options',
      stage: 'In Progress',
      branchLabel: 'Branch 2',
      preferredBranchId: 'Branch 2 – Kakinada Branch',
      mobile: '+91 98345 22334',
      aiCategory: 'Wedding Wear',
      timeAgo: '4 hr ago',
      followUpDateFormatted: 'Nov 22, 2025',
    },
    {
      id: 'L-3843',
      name: 'Subramanian S',
      enquiry: 'Fitting trial rescheduled for Friday',
      stage: 'In Progress',
      branchLabel: 'Branch 3',
      preferredBranchId: 'Branch 3 – Vijayawada Branch',
      mobile: '+91 98456 33445',
      aiCategory: 'Tailoring',
      timeAgo: '5 hr ago',
      followUpDateFormatted: 'Nov 23, 2025',
    },
    {
      id: 'L-3844',
      name: 'Pradeep Chandran',
      enquiry: 'Raymond fabric samples sent for review',
      stage: 'In Progress',
      branchLabel: 'Branch 4',
      preferredBranchId: 'Branch 4 – Guntur Branch',
      mobile: '+91 98567 44556',
      aiCategory: 'Fabrics',
      timeAgo: '5 hr ago',
      followUpDateFormatted: 'Nov 23, 2025',
    },
    {
      id: 'L-3845',
      name: 'Naveen Vignesh',
      enquiry: 'Tuxedo lapel customization discussion',
      stage: 'In Progress',
      branchLabel: 'Branch 1',
      preferredBranchId: 'Branch 1 – Rajahmandary Main Branch',
      mobile: '+91 98678 55667',
      aiCategory: 'Suits & Blazers',
      timeAgo: '6 hr ago',
      followUpDateFormatted: 'Nov 23, 2025',
    },

    // Column 3: Follow-up (5) - Includes Priya Sharma selected in screenshot
    {
      id: 'L-3816',
      name: 'Priya Sharma',
      enquiry: 'Offer details and pricing',
      stage: 'Follow-up',
      branchLabel: 'Branch 1',
      preferredBranchId: 'Branch 1 – Rajahmandary Main Branch',
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
      preferredBranchId: 'Branch 3 – Vijayawada Branch',
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
      preferredBranchId: 'Branch 2 – Kakinada Branch',
      mobile: '+91 98888 99001',
      aiCategory: 'Linen Blazers',
      timeAgo: 'Tomorrow',
      followUpDateFormatted: 'Nov 21, 2025',
    },
    {
      id: 'L-3846',
      name: 'Kishore Varma',
      enquiry: 'Wedding reception suit trial scheduled',
      stage: 'Follow-up',
      branchLabel: 'Branch 1',
      preferredBranchId: 'Branch 1 – Rajahmandary Main Branch',
      mobile: '+91 98789 66778',
      aiCategory: 'Wedding Wear',
      timeAgo: 'Nov 21',
      followUpDateFormatted: 'Nov 21, 2025',
    },
    {
      id: 'L-3847',
      name: 'Sanjay Dutt',
      enquiry: 'Measurement reminder call required',
      stage: 'Follow-up',
      branchLabel: 'Branch 4',
      preferredBranchId: 'Branch 4 – Guntur Branch',
      mobile: '+91 98890 77889',
      aiCategory: 'Tailoring',
      timeAgo: 'Nov 22',
      followUpDateFormatted: 'Nov 22, 2025',
    },

    // Column 4: Converted (4)
    {
      id: 'L-3829',
      name: 'Arjun Pillai',
      enquiry: 'Order placed – 2 shirts',
      stage: 'Converted',
      branchLabel: 'Branch 1',
      preferredBranchId: 'Branch 1 – Rajahmandary Main Branch',
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
      preferredBranchId: 'Branch 4 – Guntur Branch',
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
      preferredBranchId: 'Branch 2 – Kakinada Branch',
      mobile: '+91 99111 22334',
      aiCategory: 'Wedding Wear',
      timeAgo: '4 days ago',
      followUpDateFormatted: 'Completed',
    },
    {
      id: 'L-3848',
      name: 'Rajesh Kannan',
      enquiry: 'Purchased 3-piece Italian suit',
      stage: 'Converted',
      branchLabel: 'Branch 3',
      preferredBranchId: 'Branch 3 – Vijayawada Branch',
      mobile: '+91 99222 33445',
      aiCategory: 'Suits & Blazers',
      timeAgo: '5 days ago',
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
          const initialIds = new Set(initialLeads.map(l => l.id));
          const newCustomLeads = storedLeads
            .filter(l => !initialIds.has(l.id))
            .map(l => ({
              id: l.id,
              name: l.name,
              enquiry: l.enquiry,
              stage: l.stage || 'New',
              branchLabel:
                l.preferredBranchId === 'B2'
                  ? 'Branch 2'
                  : l.preferredBranchId === 'B3'
                    ? 'Branch 3'
                    : l.preferredBranchId === 'B4'
                      ? 'Branch 4'
                      : 'Branch 1',
              preferredBranchId: l.preferredBranchId || 'Branch 1 – Rajahmandary Main Branch',
              mobile: l.mobile,
              aiCategory: l.aiCategory || 'General Enquiry',
              timeAgo: 'Recently',
              followUpDateFormatted: l.followUpDate ? l.followUpDate.slice(0, 10) : 'Nov 20, 2025',
            }));

          if (newCustomLeads.length > 0) {
            setLeads([...newCustomLeads, ...initialLeads]);
          }
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
      const branchId = isBranchUser && currentUser?.assignedBranchId
        ? currentUser.assignedBranchId
        : newLeadData.preferredBranchId || 'B1';

      const branchLabelMap = {
        B1: 'Branch 1',
        B2: 'Branch 2',
        B3: 'Branch 3',
        B4: 'Branch 4',
      };
      const branchDetailMap = {
        B1: 'Branch 1 – Rajahmandary Main Branch',
        B2: 'Branch 2 – Kakinada Branch',
        B3: 'Branch 3 – Vijayawada Branch',
        B4: 'Branch 4 – Guntur Branch',
      };

      const resolvedLabel = branchLabelMap[branchId] || (branchId.startsWith('Branch') ? branchId : 'Branch 1');
      const resolvedDetail = branchDetailMap[branchId] || `${resolvedLabel} – Rajahmandary Main Branch`;

      const savedLead = await leadService.createLead({
        name: newLeadData.name,
        mobile: newLeadData.mobile,
        email: newLeadData.email || null,
        enquiry: newLeadData.enquiry,
        preferredBranchId: branchId,
        assignedBranchId: branchId,
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
        branchLabel: resolvedLabel,
        preferredBranchId: resolvedDetail,
        timeAgo: 'Just now',
        followUpDateFormatted: 'Nov 20, 2025',
      };
      setLeads(prev => [created, ...prev]);
      setSelectedLead(created);
      showToast(`New lead added to ${resolvedLabel} pipeline`, 'success');
    } catch (err) {
      showToast('Failed to save lead', 'error');
    }
  };

  const handleApplyFilters = newFilters => {
    setLeadFilters(newFilters);
    showToast('Filters applied successfully', 'success');
  };

  const handleClearAllFilters = () => {
    setLeadFilters({
      branch: 'ALL',
      stage: 'ALL',
      priority: 'ALL',
      source: 'ALL',
    });
    setFocusedStage(null);
    setSearchTerm('');
    showToast('All filters cleared', 'info');
  };

  const handleToggleFocusStage = stageId => {
    setFocusedStage(prev => (prev === stageId ? null : stageId));
  };

  const activeFilterCount =
    (leadFilters.branch !== 'ALL' ? 1 : 0) +
    (leadFilters.stage !== 'ALL' ? 1 : 0) +
    (leadFilters.priority !== 'ALL' ? 1 : 0) +
    (leadFilters.source !== 'ALL' ? 1 : 0) +
    (focusedStage ? 1 : 0);

  // Filter leads based on search term, branch, stage, priority, and source
  const filteredLeads = leads.filter(l => {
    // 0. Automatic branch restriction for Branch Users
    if (isBranchUser && effectiveBranchId && effectiveBranchId !== 'ALL') {
      const branchLabelMap = {
        B1: 'Branch 1',
        B2: 'Branch 2',
        B3: 'Branch 3',
        B4: 'Branch 4',
      };
      const expectedLabel = branchLabelMap[effectiveBranchId];
      const matchUserBranch =
        l.preferredBranchId === effectiveBranchId ||
        l.assignedBranchId === effectiveBranchId ||
        (expectedLabel && (l.branchLabel === expectedLabel || (typeof l.preferredBranchId === 'string' && l.preferredBranchId.includes(expectedLabel))));
      if (!matchUserBranch) return false;
    }

    // 1. Search term
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        l.name.toLowerCase().includes(q) ||
        (l.mobile && l.mobile.includes(q)) ||
        (l.enquiry && l.enquiry.toLowerCase().includes(q)) ||
        (l.branchLabel && l.branchLabel.toLowerCase().includes(q));
      if (!matchSearch) return false;
    }

    // 2. Branch filter from popover
    if (leadFilters.branch !== 'ALL') {
      const matchBranch =
        l.branchLabel === leadFilters.branch ||
        (l.preferredBranchId && l.preferredBranchId.includes(leadFilters.branch));
      if (!matchBranch) return false;
    }

    // 3. Stage filter from popover
    if (leadFilters.stage !== 'ALL') {
      if (leadFilters.stage === 'In Progress') {
        const isInProgress =
          l.stage === 'In Progress' ||
          l.stage === 'Contacted' ||
          l.stage === 'Qualified';
        if (!isInProgress) return false;
      } else if (l.stage !== leadFilters.stage) {
        return false;
      }
    }

    // 4. Priority filter
    if (leadFilters.priority !== 'ALL') {
      const p = l.priority || l.aiPriority;
      if (p !== leadFilters.priority) return false;
    }

    // 5. Source filter
    if (leadFilters.source !== 'ALL') {
      const s = (l.source || '').toLowerCase();
      if (!s.includes(leadFilters.source.toLowerCase())) return false;
    }

    // 6. Stage focus (in Table view)
    if (focusedStage && viewMode === 'table') {
      if (focusedStage === 'In Progress') {
        const isInProgress =
          l.stage === 'In Progress' ||
          l.stage === 'Contacted' ||
          l.stage === 'Qualified';
        if (!isInProgress) return false;
      } else if (l.stage !== focusedStage) {
        return false;
      }
    }

    return true;
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
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${viewMode === 'kanban'
              ? 'bg-[#004F4C] text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs'
              }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Kanban</span>
          </button>

          {/* Table Button */}
          <button
            onClick={() => setViewMode('table')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${viewMode === 'table'
              ? 'bg-[#004F4C] text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs'
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
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search leads, name or phone..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-[#008C83] text-slate-800 placeholder-slate-400 transition-colors shadow-2xs"
            />
          </div>

          {/* Filters Button with Interactive Popover */}
          <div className="relative">
            <button
              onClick={() => setIsFiltersOpen(prev => !prev)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs ${activeFilterCount > 0 || isFiltersOpen
                ? 'bg-[#004F4C] text-white border-[#004F4C]'
                : 'bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white text-[#004F4C] text-[10px] font-black flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <LeadFiltersPopover
              isOpen={isFiltersOpen}
              onClose={() => setIsFiltersOpen(false)}
              initialFilters={leadFilters}
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearAllFilters}
              isBranchUser={isBranchUser}
            />
          </div>

          {/* Add Lead Button */}
          <button
            onClick={() => {
              setEditingLead(null);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#004F4C] hover:bg-[#003d3a] active:bg-[#002b29] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Active Filter Chips Bar */}
      {(activeFilterCount > 0 || searchTerm.trim()) && (
        <div className="flex items-center gap-2 flex-wrap text-xs pt-0.5">
          <span className="text-slate-400 font-medium text-[11px]">Active Filters:</span>

          {searchTerm.trim() && (
            <span className="px-2.5 py-1 bg-[#e6f7f2] text-[#004F4C] rounded-lg font-semibold flex items-center gap-1.5 shadow-2xs">
              <span>Search: "{searchTerm}"</span>
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="hover:text-rose-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {leadFilters.branch !== 'ALL' && (
            <span className="px-2.5 py-1 bg-[#e6f7f2] text-[#004F4C] rounded-lg font-semibold flex items-center gap-1.5 shadow-2xs">
              <span>Branch: {leadFilters.branch}</span>
              <button
                type="button"
                onClick={() => setLeadFilters(prev => ({ ...prev, branch: 'ALL' }))}
                className="hover:text-rose-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {leadFilters.stage !== 'ALL' && (
            <span className="px-2.5 py-1 bg-[#e6f7f2] text-[#004F4C] rounded-lg font-semibold flex items-center gap-1.5 shadow-2xs">
              <span>Stage: {leadFilters.stage}</span>
              <button
                type="button"
                onClick={() => setLeadFilters(prev => ({ ...prev, stage: 'ALL' }))}
                className="hover:text-rose-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {leadFilters.priority !== 'ALL' && (
            <span className="px-2.5 py-1 bg-[#e6f7f2] text-[#004F4C] rounded-lg font-semibold flex items-center gap-1.5 shadow-2xs">
              <span>Priority: {leadFilters.priority}</span>
              <button
                type="button"
                onClick={() => setLeadFilters(prev => ({ ...prev, priority: 'ALL' }))}
                className="hover:text-rose-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {leadFilters.source !== 'ALL' && (
            <span className="px-2.5 py-1 bg-[#e6f7f2] text-[#004F4C] rounded-lg font-semibold flex items-center gap-1.5 shadow-2xs">
              <span>Source: {leadFilters.source}</span>
              <button
                type="button"
                onClick={() => setLeadFilters(prev => ({ ...prev, source: 'ALL' }))}
                className="hover:text-rose-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {focusedStage && (
            <span className="px-2.5 py-1 bg-[#004F4C] text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-2xs">
              <span>Focus: {focusedStage}</span>
              <button
                type="button"
                onClick={() => setFocusedStage(null)}
                className="hover:text-amber-300 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={handleClearAllFilters}
            className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer ml-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear All</span>
          </button>
        </div>
      )}

      {/* Main Board Area */}
      {filteredLeads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#e6f7f2] border border-[#A8F0D0] text-[#004F4C] mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No matching leads found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, branch, or stage filters to view more leads.
          </p>
          <button
            type="button"
            onClick={handleClearAllFilters}
            className="px-4 py-2 bg-[#004F4C] hover:bg-[#003d3a] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      ) : viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Kanban Board Columns (~72% width when details open, 100% when closed) */}
          <div className={selectedLead ? 'lg:col-span-8 xl:col-span-9' : 'lg:col-span-12'}>
            <LeadKanbanBoard
              leads={filteredLeads}
              selectedLeadId={selectedLead?.id}
              onSelectLead={lead => setSelectedLead(lead)}
              onStageChange={handleStageChange}
              focusedStage={focusedStage}
              onToggleFocusStage={handleToggleFocusStage}
            />
          </div>

          {/* Right Lead Details Panel (~28% width matching screenshot) */}
          {selectedLead && (
            <div className="lg:col-span-4 xl:col-span-3 sticky top-4">
              <LeadDetailsPanel
                lead={selectedLead}
                onClose={() => setSelectedLead(null)}
                onUpdateLead={handleUpdateLead}
                onEditLead={lead => {
                  setEditingLead(lead);
                  setIsAddModalOpen(true);
                }}
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

      {/* Add / Edit Lead Modal */}
      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingLead(null);
        }}
        onCreateLead={handleCreateNewLead}
        onUpdateLead={handleUpdateLead}
        leadToEdit={editingLead}
      />
    </div>
  );
}
