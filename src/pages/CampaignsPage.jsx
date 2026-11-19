import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Send,
  Clock,
  Users,
  TrendingUp,
  Search,
  Store,
  SlidersHorizontal,
  Plus,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Info,
  Calendar,
  Sparkles,
  ShieldCheck,
  FileText,
  Copy,
  Trash2,
  ExternalLink,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  Eye,
  Filter,
} from 'lucide-react';
import { useBranch } from '../context/BranchContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { campaignService } from '../services/campaignService.js';
import { INITIAL_CAMPAIGNS } from '../mocks/seedData.js';

// Branch metadata matching the approved reference screenshot
const BRANCH_CONFIG = [
  { id: 'B1', name: 'Branch 1 (Anna Nagar)', code: 'B1', baseAudience: 7850 },
  { id: 'B2', name: 'Branch 2 (T. Nagar)', code: 'B2', baseAudience: 6920 },
  { id: 'B3', name: 'Branch 3 (Velachery)', code: 'B3', baseAudience: 6760 },
  { id: 'B4', name: 'Branch 4 (Adyar)', code: 'B4', baseAudience: 3030 },
];

// Pre-approved Meta WhatsApp templates catalog
const MESSAGE_TEMPLATES = [
  {
    id: 'tpl_product_announcement',
    name: 'Product Announcement',
    type: 'Promotional',
    title: '👕 New Winter Collection!',
    body: 'Discover our latest range of formal shirts starting from ₹1,299.\nVisit your nearest RS Mens World store today!',
    imageCategory: 'shirts',
    defaultOffer: 'starting from ₹1,299',
  },
  {
    id: 'tpl_festive_offer',
    name: 'Festive Offer & Discount',
    type: 'Promotional',
    title: '🎉 Festive Celebration - Flat 20% Off!',
    body: 'Celebrate in royal style with flat 20% off on all formal & casual collections across selected stores. Offer valid this week only!',
    imageCategory: 'festive',
    defaultOffer: 'Flat 20% Off',
  },
  {
    id: 'tpl_formal_arrivals',
    name: 'New Formal Arrivals',
    type: 'Announcement',
    title: '👔 New Arrivals Alert!',
    body: 'Premium Egyptian Cotton & Italian Linen formal shirts now in stock. Experience bespoke comfort and precision stitching today.',
    imageCategory: 'shirts',
    defaultOffer: 'Exclusive Selection',
  },
  {
    id: 'tpl_loyalty_privilege',
    name: 'Loyal Customer Exclusive',
    type: 'Loyalty',
    title: '⭐ Exclusive Member Privilege!',
    body: 'Dear valued patron, enjoy an additional 10% loyalty reward points on your next weekend purchase at RS Mens World.',
    imageCategory: 'suits',
    defaultOffer: '10% Bonus Points',
  },
  {
    id: 'tpl_store_event',
    name: 'Store Event Invitation',
    type: 'Event',
    title: '✨ Exclusive Styling Gala!',
    body: 'Join us for an exclusive evening of bespoke styling trials and master tailor consultations. Complimentary private styling session included.',
    imageCategory: 'suits',
    defaultOffer: 'Complimentary Consultation',
  },
  {
    id: 'tpl_customer_feedback',
    name: 'Customer Feedback Request',
    type: 'Engagement',
    title: '💬 How was your shopping experience?',
    body: 'Rate your recent visit to RS Mens World and help us serve you better. Takes only 30 seconds!',
    imageCategory: null,
    defaultOffer: 'Quick Survey',
  },
];

// Shirt product photos matching screenshot
const SHIRT_PREVIEW_PRODUCTS = [
  {
    id: 'shirt-1',
    name: 'Crisp White Oxford',
    image: 'https://images.unsplash.com/photo-1620012253295-c15c429f66bf?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'shirt-2',
    name: 'Sky Blue Chambray',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'shirt-3',
    name: 'Midnight Navy Slim',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=300&q=80',
  },
];

export default function CampaignsPage() {
  const { showToast } = useToast();

  // Primary campaign list state initialized from seed data
  const [campaigns, setCampaigns] = useState(() => {
    try {
      const stored = localStorage.getItem('rs_campaigns');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length >= 10) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load campaigns from storage', e);
    }
    return INITIAL_CAMPAIGNS;
  });

  // Filter & Search states
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'DRAFTS' | 'SCHEDULED' | 'SENT'
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [sortAsc, setSortAsc] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Drawer & Selection states
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Wizard state: 1: Details, 2: Audience, 3: Content, 4: Review
  const [wizardStep, setWizardStep] = useState(1);
  const [formCampaignName, setFormCampaignName] = useState('Winter Collection Launch');
  const [formCampaignType, setFormCampaignType] = useState('Promotional');
  const [formTemplateName, setFormTemplateName] = useState('Product Announcement');

  // Branch ON/OFF switches (defaults to B1, B2, B3 ON, B4 OFF as in screenshot)
  const [branchToggles, setBranchToggles] = useState({
    B1: true,
    B2: true,
    B3: true,
    B4: false,
  });

  // Wizard Step 2 & 3 custom settings
  const [targetSegment, setTargetSegment] = useState('ALL_CONSENTED');
  const [customOfferText, setCustomOfferText] = useState('starting from ₹1,299');
  const [ctaType, setCtaType] = useState('VISIT_STORE');
  const [deliveryTiming, setDeliveryTiming] = useState('SEND_NOW');
  const [scheduleDateTime, setScheduleDateTime] = useState('2025-11-20T10:30');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toggle single branch
  const handleToggleBranch = branchId => {
    setBranchToggles(prev => ({
      ...prev,
      [branchId]: !prev[branchId],
    }));
  };

  // Calculate live eligible audience based on active branch switches
  const selectedBranchCount = useMemo(() => {
    return Object.values(branchToggles).filter(Boolean).length;
  }, [branchToggles]);

  const eligibleAudienceSelected = useMemo(() => {
    let sum = 0;
    BRANCH_CONFIG.forEach(b => {
      if (branchToggles[b.id]) {
        sum += b.baseAudience;
      }
    });
    return sum;
  }, [branchToggles]);

  // Overall top KPI statistics
  const totalCampaignsCount = campaigns.length;
  const sentCampaignsCount = campaigns.filter(c => c.status?.toUpperCase() === 'SENT').length;
  const scheduledCampaignsCount = campaigns.filter(c => c.status?.toUpperCase() === 'SCHEDULED').length;
  const draftCampaignsCount = campaigns.filter(c => c.status?.toUpperCase() === 'DRAFT').length;
  const totalAudienceCount = 24560; // 7850 + 6920 + 6760 + 3030

  // Filtered campaigns for table
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(item => {
      // Tab filter
      if (activeTab === 'DRAFTS' && item.status?.toUpperCase() !== 'DRAFT') return false;
      if (activeTab === 'SCHEDULED' && item.status?.toUpperCase() !== 'SCHEDULED') return false;
      if (activeTab === 'SENT' && item.status?.toUpperCase() !== 'SENT') return false;

      // Dropdown status filter
      if (statusFilter !== 'ALL' && item.status?.toUpperCase() !== statusFilter.toUpperCase()) {
        return false;
      }

      // Dropdown branch filter
      if (branchFilter !== 'ALL') {
        const hasBranch = item.branches?.some(
          b => b.toLowerCase() === branchFilter.toLowerCase() || item.branchesDisplay?.includes(branchFilter)
        );
        if (!hasBranch) return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = item.name?.toLowerCase().includes(query);
        const matchesType = item.type?.toLowerCase().includes(query);
        const matchesBranch = item.branchesDisplay?.toLowerCase().includes(query);
        if (!matchesName && !matchesType && !matchesBranch) return false;
      }

      return true;
    });
  }, [campaigns, activeTab, statusFilter, branchFilter, searchTerm]);

  // Sort campaigns if needed
  const sortedCampaigns = useMemo(() => {
    return [...filteredCampaigns].sort((a, b) => {
      if (sortAsc) {
        return (a.name || '').localeCompare(b.name || '');
      }
      return 0; // retain default order as per screenshot
    });
  }, [filteredCampaigns, sortAsc]);

  // Paginated campaigns
  const totalPages = Math.max(1, Math.ceil(sortedCampaigns.length / pageSize));
  const paginatedCampaigns = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedCampaigns.slice(start, start + pageSize);
  }, [sortedCampaigns, currentPage, pageSize]);

  // Checkbox selection handlers
  const handleSelectAll = e => {
    if (e.target.checked) {
      setSelectedIds(new Set(paginatedCampaigns.map(c => c.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleRowSelect = (id, e) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Find currently active template object
  const currentTemplate = useMemo(() => {
    return (
      MESSAGE_TEMPLATES.find(t => t.name.toLowerCase() === formTemplateName.toLowerCase()) ||
      MESSAGE_TEMPLATES[0]
    );
  }, [formTemplateName]);

  // Handle template selection change
  const handleTemplateChange = e => {
    const tName = e.target.value;
    setFormTemplateName(tName);
    const found = MESSAGE_TEMPLATES.find(t => t.name === tName);
    if (found) {
      setFormCampaignType(found.type);
      setCustomOfferText(found.defaultOffer);
    }
  };

  // Step 4: Submit Campaign (Launch or Schedule or Draft)
  const handleSubmitCampaign = async (statusOverride = null) => {
    const activeBranchKeys = Object.keys(branchToggles).filter(k => branchToggles[k]);
    if (activeBranchKeys.length === 0) {
      showToast('Please enable at least one store branch', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalStatus =
        statusOverride ||
        (deliveryTiming === 'SCHEDULE_LATER' ? 'Scheduled' : 'Sent');

      const payload = {
        name: formCampaignName || 'Untitled Campaign',
        type: formCampaignType,
        branches: activeBranchKeys,
        template: formTemplateName,
        status: finalStatus,
        scheduleAt: deliveryTiming === 'SCHEDULE_LATER' ? scheduleDateTime : null,
      };

      const newCampaign = await campaignService.createCampaign(payload);

      setCampaigns(prev => {
        const updated = [newCampaign, ...prev];
        try {
          localStorage.setItem('rs_campaigns', JSON.stringify(updated));
        } catch (e) {
          console.warn('Storage failed', e);
        }
        return updated;
      });

      showToast(
        finalStatus === 'Sent'
          ? `Campaign "${newCampaign.name}" broadcast simulated to ${newCampaign.audience?.toLocaleString()} customers!`
          : `Campaign "${newCampaign.name}" saved as ${finalStatus}`,
        'success'
      );

      // Reset to details
      setWizardStep(1);
    } catch (err) {
      console.error(err);
      showToast('Failed to create campaign', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Duplicate campaign
  const handleDuplicate = (camp, e) => {
    e.stopPropagation();
    setActiveMenuId(null);
    const dup = {
      ...camp,
      id: `CAMP-${Date.now().toString().slice(-3)}`,
      name: `${camp.name} (Copy)`,
      status: 'Draft',
      date: '—',
    };
    setCampaigns(prev => [dup, ...prev]);
    showToast(`Duplicated "${camp.name}" to Drafts`, 'info');
  };

  // Delete campaign
  const handleDelete = (campId, e) => {
    e.stopPropagation();
    setActiveMenuId(null);
    setCampaigns(prev => prev.filter(c => c.id !== campId));
    showToast('Campaign deleted successfully', 'info');
  };

  // Send simulated test WhatsApp message
  const handleSendTestMessage = (camp, e) => {
    e.stopPropagation();
    setActiveMenuId(null);
    showToast(`Test WhatsApp message sent to store manager (+91 98765 43210)`, 'success');
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-12 font-sans select-none">
      {/* 1. TOP STATS ROW (5 Cards matching approved screenshot) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Card 1: Total Campaigns */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#e6f7f2] flex items-center justify-center text-[#008C83] shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xl sm:text-2xl font-extrabold text-[#102333] tracking-tight leading-none">
              {totalCampaignsCount}
            </div>
            <div className="text-[11px] font-medium text-slate-500 mt-1 truncate">
              Total Campaigns
            </div>
          </div>
        </div>

        {/* Card 2: Sent Campaigns */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#e6f7f2] flex items-center justify-center text-[#008C83] shrink-0">
            <Send className="w-4 h-4 -rotate-12" />
          </div>
          <div className="min-w-0">
            <div className="text-xl sm:text-2xl font-extrabold text-[#102333] tracking-tight leading-none">
              {sentCampaignsCount}
            </div>
            <div className="text-[11px] font-medium text-slate-500 mt-1 truncate">
              Sent Campaigns
            </div>
          </div>
        </div>

        {/* Card 3: Scheduled */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#e6f7f2] flex items-center justify-center text-[#008C83] shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xl sm:text-2xl font-extrabold text-[#102333] tracking-tight leading-none">
              {scheduledCampaignsCount}
            </div>
            <div className="text-[11px] font-medium text-slate-500 mt-1 truncate">
              Scheduled
            </div>
          </div>
        </div>

        {/* Card 4: Eligible Audience */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#e6f7f2] flex items-center justify-center text-[#008C83] shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xl sm:text-2xl font-extrabold text-[#102333] tracking-tight leading-none">
              {totalAudienceCount.toLocaleString()}
            </div>
            <div className="text-[11px] font-medium text-slate-500 mt-1 truncate">
              Eligible Audience
            </div>
          </div>
        </div>

        {/* Card 5: Avg. Delivery (Simulated) */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="w-10 h-10 rounded-full bg-[#e6f7f2] flex items-center justify-center text-[#008C83] shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xl sm:text-2xl font-extrabold text-[#102333] tracking-tight leading-none">
              82.4%
            </div>
            <div className="text-[11px] font-medium text-slate-500 mt-1 truncate">
              Avg. Delivery (Simulated)
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN SPLIT CONTENT: TABLE & FILTERS (LEFT) + CREATE CAMPAIGN PANEL (RIGHT) */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* LEFT COLUMN: Tabs + Filters + Dense Campaign Table + Pagination */}
        <div className={`space-y-3 transition-all duration-200 ${isDrawerOpen ? 'w-full lg:w-[58%] xl:w-[60%]' : 'w-full'}`}>
          {/* Top Status Tabs matching screenshot */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              <button
                onClick={() => {
                  setActiveTab('ALL');
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'ALL'
                    ? 'bg-[#004F4C] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                All Campaigns ({totalCampaignsCount})
              </button>

              <button
                onClick={() => {
                  setActiveTab('DRAFTS');
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'DRAFTS'
                    ? 'bg-[#004F4C] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Drafts ({draftCampaignsCount})
              </button>

              <button
                onClick={() => {
                  setActiveTab('SCHEDULED');
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'SCHEDULED'
                    ? 'bg-[#004F4C] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Scheduled ({scheduledCampaignsCount})
              </button>

              <button
                onClick={() => {
                  setActiveTab('SENT');
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'SENT'
                    ? 'bg-[#004F4C] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Sent ({sentCampaignsCount})
              </button>
            </div>

            {/* When drawer is closed, show "+ New Campaign" button */}
            {!isDrawerOpen && (
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="px-4 py-2 bg-[#004F4C] hover:bg-[#003d3a] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>New Campaign</span>
              </button>
            )}
          </div>

          {/* Search & Dropdown Filters Bar */}
          <div className="p-2.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-1.5 bg-transparent border-0 text-xs text-slate-800 placeholder-slate-400 outline-none font-sans"
              />
            </div>

            {/* Branch Dropdown */}
            <div className="relative">
              <select
                value={branchFilter}
                onChange={e => {
                  setBranchFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none pl-8 pr-7 py-1.5 text-xs font-medium bg-white text-slate-700 border border-slate-200 rounded-xl hover:border-slate-300 outline-none cursor-pointer"
              >
                <option value="ALL">Branch: All</option>
                <option value="B1">Branch 1 (Anna Nagar)</option>
                <option value="B2">Branch 2 (T. Nagar)</option>
                <option value="B3">Branch 3 (Velachery)</option>
                <option value="B4">Branch 4 (Adyar)</option>
              </select>
              <Store className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <span className="text-[10px] text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">▼</span>
            </div>

            {/* Status Dropdown */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={e => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none pl-8 pr-7 py-1.5 text-xs font-medium bg-white text-slate-700 border border-slate-200 rounded-xl hover:border-slate-300 outline-none cursor-pointer"
              >
                <option value="ALL">Status: All</option>
                <option value="SENT">Sent</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="DRAFT">Draft</option>
              </select>
              <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <span className="text-[10px] text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">▼</span>
            </div>

            {/* Reset Filters button */}
            <button
              onClick={() => {
                setSearchTerm('');
                setBranchFilter('ALL');
                setStatusFilter('ALL');
                setActiveTab('ALL');
                showToast('Campaign filters reset', 'info');
              }}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-medium text-slate-700 flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>Filters</span>
            </button>
          </div>

          {/* CAMPAIGNS TABLE */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#D9E9E8] text-slate-600 font-semibold text-xs bg-white">
                    <th className="p-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          paginatedCampaigns.length > 0 &&
                          selectedIds.size === paginatedCampaigns.length
                        }
                        onChange={handleSelectAll}
                        className="rounded border-slate-300 text-[#004F4C] focus:ring-[#004F4C]/20"
                      />
                    </th>
                    <th className="p-3 font-semibold text-slate-700">Campaign Name</th>
                    <th className="p-3 font-semibold text-slate-700">Type</th>
                    <th className="p-3 font-semibold text-slate-700">Branches</th>
                    <th className="p-3 font-semibold text-slate-700">Audience</th>
                    <th className="p-3 font-semibold text-slate-700">Status</th>
                    <th
                      className="p-3 font-semibold text-slate-700 cursor-pointer select-none"
                      onClick={() => setSortAsc(!sortAsc)}
                    >
                      <div className="flex items-center gap-1">
                        <span>Date</span>
                        <span className="text-[11px] text-slate-400">↕</span>
                      </div>
                    </th>
                    <th className="p-3 w-8 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedCampaigns.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-slate-400 text-xs">
                        No campaigns found matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedCampaigns.map(camp => {
                      const isChecked = selectedIds.has(camp.id);

                      // Type badge styling matching screenshot
                      let typeBadge = (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#e6f7f2] text-[#008C83]">
                          {camp.type}
                        </span>
                      );
                      if (camp.type === 'Announcement') {
                        typeBadge = (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#e8f4fd] text-[#1976d2]">
                            Announcement
                          </span>
                        );
                      } else if (camp.type === 'Loyalty') {
                        typeBadge = (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#f3e8ff] text-[#7c3aed]">
                            Loyalty
                          </span>
                        );
                      } else if (camp.type === 'Event') {
                        typeBadge = (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#e0f7fa] text-[#00838f]">
                            Event
                          </span>
                        );
                      } else if (camp.type === 'Engagement') {
                        typeBadge = (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#e1f5fe] text-[#0288d1]">
                            Engagement
                          </span>
                        );
                      }

                      // Status badge styling matching screenshot
                      let statusBadge = (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          Draft
                        </span>
                      );
                      if (camp.status === 'Sent') {
                        statusBadge = (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#eafaf1] text-[#1e7e34] border border-[#c3e6cb]">
                            Sent
                          </span>
                        );
                      } else if (camp.status === 'Scheduled') {
                        statusBadge = (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#fff8e6] text-[#b45309] border border-[#fde68a]">
                            Scheduled
                          </span>
                        );
                      }

                      return (
                        <tr
                          key={camp.id}
                          onClick={() => {
                            // Populate drawer with this campaign to inspect
                            setFormCampaignName(camp.name);
                            setFormCampaignType(camp.type);
                            setFormTemplateName(camp.template || 'Product Announcement');
                            const bMap = { B1: false, B2: false, B3: false, B4: false };
                            (camp.branches || []).forEach(bId => {
                              if (bMap[bId] !== undefined) bMap[bId] = true;
                            });
                            setBranchToggles(bMap);
                            setIsDrawerOpen(true);
                          }}
                          className={`hover:bg-[#f0f7f5]/40 transition-colors cursor-pointer ${
                            isChecked ? 'bg-[#f0f9f7]' : ''
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="p-3 text-center" onClick={e => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={e => handleToggleRowSelect(camp.id, e)}
                              className="rounded border-slate-300 text-[#004F4C] focus:ring-[#004F4C]/20"
                            />
                          </td>

                          {/* Campaign Name */}
                          <td className="p-3 font-semibold text-slate-900 tracking-tight">
                            {camp.name}
                          </td>

                          {/* Type */}
                          <td className="p-3">{typeBadge}</td>

                          {/* Branches */}
                          <td className="p-3 text-slate-600 font-medium font-mono text-[11px]">
                            {camp.branchesDisplay || camp.branches?.join(', ') || 'B1, B2'}
                          </td>

                          {/* Audience */}
                          <td className="p-3 text-slate-800 font-semibold font-mono">
                            {camp.audience ? camp.audience.toLocaleString() : '—'}
                          </td>

                          {/* Status */}
                          <td className="p-3">{statusBadge}</td>

                          {/* Date */}
                          <td className="p-3 text-slate-600 font-medium">
                            {camp.date || '—'}
                          </td>

                          {/* Action dots menu */}
                          <td className="p-3 text-center relative" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() =>
                                setActiveMenuId(activeMenuId === camp.id ? null : camp.id)
                              }
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* Dropdown popup */}
                            {activeMenuId === camp.id && (
                              <div className="absolute right-3 top-8 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-30 text-left">
                                <button
                                  onClick={e => {
                                    handleSendTestMessage(camp, e);
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                  <Smartphone className="w-3.5 h-3.5 text-[#008C83]" />
                                  <span>Send Test Message</span>
                                </button>
                                <button
                                  onClick={e => handleDuplicate(camp, e)}
                                  className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Duplicate Campaign</span>
                                </button>
                                <button
                                  onClick={e => handleDelete(camp.id, e)}
                                  className="w-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                  <span>Delete Campaign</span>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer matching approved screenshot */}
            <div className="p-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 bg-white">
              <div>
                Showing {Math.min((currentPage - 1) * pageSize + 1, sortedCampaigns.length)} –{' '}
                {Math.min(currentPage * pageSize, sortedCampaigns.length)} of {sortedCampaigns.length} campaigns
              </div>

              <div className="flex items-center gap-3">
                {/* Rows per page dropdown */}
                <div className="relative">
                  <select
                    value={pageSize}
                    onChange={e => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="appearance-none pl-3 pr-6 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none cursor-pointer"
                  >
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                  </select>
                  <span className="text-[9px] text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">▼</span>
                </div>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    const isActive = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#004F4C] text-white shadow-xs'
                            : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: "Create WhatsApp Campaign" Panel / Drawer matching screenshot */}
        {isDrawerOpen && (
          <div className="w-full lg:w-[42%] xl:w-[40%] bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 shrink-0 flex flex-col justify-between space-y-4">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-[#102333] tracking-tight">
                Create WhatsApp Campaign
              </h3>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="w-7 h-7 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                title="Close Drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stepper Navigation (1 Details - 2 Audience - 3 Content - 4 Review) */}
            <div className="flex items-center justify-between text-xs font-semibold py-1">
              {/* Step 1: Details */}
              <button
                onClick={() => setWizardStep(1)}
                className="flex items-center gap-1.5 cursor-pointer text-left"
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    wizardStep === 1
                      ? 'bg-[#004F4C] text-white'
                      : wizardStep > 1
                      ? 'bg-[#008C83] text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {wizardStep > 1 ? <Check className="w-3 h-3 stroke-[3]" /> : '1'}
                </div>
                <span className={wizardStep === 1 ? 'text-[#102333] font-bold' : 'text-slate-500 font-medium'}>
                  Details
                </span>
              </button>

              <div className="flex-1 h-px bg-slate-200 mx-2" />

              {/* Step 2: Audience */}
              <button
                onClick={() => setWizardStep(2)}
                className="flex items-center gap-1.5 cursor-pointer text-left"
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    wizardStep === 2
                      ? 'bg-[#004F4C] text-white'
                      : wizardStep > 2
                      ? 'bg-[#008C83] text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {wizardStep > 2 ? <Check className="w-3 h-3 stroke-[3]" /> : '2'}
                </div>
                <span className={wizardStep === 2 ? 'text-[#102333] font-bold' : 'text-slate-500 font-medium'}>
                  Audience
                </span>
              </button>

              <div className="flex-1 h-px bg-slate-200 mx-2" />

              {/* Step 3: Content */}
              <button
                onClick={() => setWizardStep(3)}
                className="flex items-center gap-1.5 cursor-pointer text-left"
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    wizardStep === 3
                      ? 'bg-[#004F4C] text-white'
                      : wizardStep > 3
                      ? 'bg-[#008C83] text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {wizardStep > 3 ? <Check className="w-3 h-3 stroke-[3]" /> : '3'}
                </div>
                <span className={wizardStep === 3 ? 'text-[#102333] font-bold' : 'text-slate-500 font-medium'}>
                  Content
                </span>
              </button>

              <div className="flex-1 h-px bg-slate-200 mx-2" />

              {/* Step 4: Review */}
              <button
                onClick={() => setWizardStep(4)}
                className="flex items-center gap-1.5 cursor-pointer text-left"
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    wizardStep === 4
                      ? 'bg-[#004F4C] text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  4
                </div>
                <span className={wizardStep === 4 ? 'text-[#102333] font-bold' : 'text-slate-500 font-medium'}>
                  Review
                </span>
              </button>
            </div>

            {/* STEP 1: DETAILS & SPLIT PREVIEW (Exactly matching approved screenshot) */}
            {wizardStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* Form Controls Column (Left) */}
                <div className="space-y-3.5">
                  {/* Campaign Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Campaign Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formCampaignName}
                      onChange={e => setFormCampaignName(e.target.value)}
                      placeholder="e.g. Winter Collection Launch"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#008C83] focus:ring-1 focus:ring-[#008C83]"
                    />
                  </div>

                  {/* Campaign Type */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Campaign Type <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formCampaignType}
                        onChange={e => setFormCampaignType(e.target.value)}
                        className="w-full appearance-none pl-8 pr-7 py-2 text-xs font-medium bg-white text-slate-800 border border-slate-200 rounded-xl hover:border-slate-300 outline-none cursor-pointer focus:border-[#008C83]"
                      >
                        <option value="Promotional">Promotional</option>
                        <option value="Announcement">Announcement</option>
                        <option value="Loyalty">Loyalty</option>
                        <option value="Event">Event</option>
                        <option value="Engagement">Engagement</option>
                      </select>
                      <Sparkles className="w-3.5 h-3.5 text-[#008C83] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <span className="text-[10px] text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">▼</span>
                    </div>
                  </div>

                  {/* Message Template */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Message Template <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formTemplateName}
                        onChange={handleTemplateChange}
                        className="w-full appearance-none pl-3 pr-7 py-2 text-xs font-medium bg-white text-slate-800 border border-slate-200 rounded-xl hover:border-slate-300 outline-none cursor-pointer focus:border-[#008C83]"
                      >
                        {MESSAGE_TEMPLATES.map(tpl => (
                          <option key={tpl.id} value={tpl.name}>
                            {tpl.name}
                          </option>
                        ))}
                      </select>
                      <span className="text-[10px] text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">▼</span>
                    </div>
                  </div>

                  {/* Select Branches (Independent ON/OFF) */}
                  <div className="pt-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Select Branches (Independent ON/OFF)
                    </label>
                    <div className="space-y-2">
                      {BRANCH_CONFIG.map(branch => {
                        const isEnabled = !!branchToggles[branch.id];
                        return (
                          <div
                            key={branch.id}
                            onClick={() => handleToggleBranch(branch.id)}
                            className="flex items-center justify-between p-2 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              {/* Green Checkbox */}
                              <div
                                className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                                  isEnabled
                                    ? 'bg-[#10b981] text-white'
                                    : 'border border-slate-300 bg-white'
                                }`}
                              >
                                {isEnabled && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span className="text-xs font-medium text-slate-800">
                                {branch.code} – {branch.name}
                              </span>
                            </div>

                            {/* Pill Switch Toggle matching screenshot */}
                            <div
                              className={`w-9 h-5 rounded-full transition-colors flex items-center p-0.5 ${
                                isEnabled ? 'bg-[#10b981]' : 'bg-slate-300'
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform transform ${
                                  isEnabled ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* WhatsApp Message Preview Column (Right) */}
                <div className="space-y-1.5 flex flex-col justify-start">
                  <div className="text-xs font-semibold text-slate-700">
                    Message Preview
                  </div>

                  {/* WhatsApp chat card container */}
                  <div className="bg-[#eef5f3] p-3 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
                    {/* WhatsApp Message Bubble */}
                    <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-xs border border-slate-100 space-y-2.5">
                      {/* Product Shirts Carousel matching screenshot */}
                      {currentTemplate.imageCategory === 'shirts' && (
                        <div className="grid grid-cols-3 gap-1.5">
                          {SHIRT_PREVIEW_PRODUCTS.map(prod => (
                            <div
                              key={prod.id}
                              className="rounded-lg overflow-hidden bg-slate-50 border border-slate-100 aspect-square"
                            >
                              <img
                                src={prod.image}
                                alt={prod.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Other category banner image if present */}
                      {currentTemplate.imageCategory === 'festive' && (
                        <div className="rounded-lg overflow-hidden bg-slate-50 border border-slate-100 h-28">
                          <img
                            src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80"
                            alt="Festive Collection"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {currentTemplate.imageCategory === 'suits' && (
                        <div className="rounded-lg overflow-hidden bg-slate-50 border border-slate-100 h-28">
                          <img
                            src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=400&q=80"
                            alt="Royal Bespoke Suits"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Message Body */}
                      <div className="text-xs text-slate-800 space-y-1.5 leading-relaxed font-sans">
                        <div className="font-bold text-[#102333]">
                          {currentTemplate.title}
                        </div>
                        <div className="text-slate-600 whitespace-pre-line text-[11px]">
                          {currentTemplate.body}
                        </div>
                      </div>

                      {/* Time & Read Double Tick matching screenshot */}
                      <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 pt-0.5">
                        <span>10:30 AM</span>
                        <span className="text-[#008C83] font-bold text-xs">✔✔</span>
                      </div>
                    </div>

                    {/* WhatsApp Quick Reply Action Button */}
                    <div className="bg-white/80 rounded-xl p-2 text-center text-xs font-semibold text-[#008C83] border border-slate-200/60 shadow-2xs">
                      🛒 Visit Nearest Store
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: AUDIENCE & DPDP COMPLIANCE GATING */}
            {wizardStep === 2 && (
              <div className="space-y-4 pt-1">
                <div className="p-3 bg-[#e6f7f2] border border-[#A8F0D0] rounded-xl flex items-start gap-2.5 text-xs text-[#004F4C]">
                  <ShieldCheck className="w-4 h-4 text-[#008C83] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Strict DPDP 2023 Consent Gate: </span>
                    Broadcasts only target patrons with explicit marketing opt-in collected at Petpooja POS billing or inbound chat.
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Target Customer Segment
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'ALL_CONSENTED', label: 'All Consented Patrons (Recommended)', count: eligibleAudienceSelected },
                      { id: 'VIP_ONLY', label: 'VIP Club Members (AOV > ₹3,500)', count: Math.round(eligibleAudienceSelected * 0.22) },
                      { id: 'REPEAT_BUYERS', label: 'Repeat Buyers (2+ orders this year)', count: Math.round(eligibleAudienceSelected * 0.54) },
                      { id: 'INACTIVE_60', label: 'Lapsed Customers (No visits in 60+ days)', count: Math.round(eligibleAudienceSelected * 0.24) },
                    ].map(seg => (
                      <div
                        key={seg.id}
                        onClick={() => setTargetSegment(seg.id)}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                          targetSegment === seg.id
                            ? 'bg-[#f0f9f7] border-[#008C83] text-[#004F4C] font-semibold'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="targetSegment"
                            checked={targetSegment === seg.id}
                            onChange={() => setTargetSegment(seg.id)}
                            className="text-[#004F4C] focus:ring-[#004F4C]"
                          />
                          <span>{seg.label}</span>
                        </div>
                        <span className="font-mono font-bold">{seg.count.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Branch Breakdown Table */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Selected Branch Reach
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {BRANCH_CONFIG.map(b => (
                      <div key={b.id} className="flex justify-between items-center text-slate-700">
                        <span className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              branchToggles[b.id] ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                          />
                          {b.name}
                        </span>
                        <span className="font-mono font-semibold">
                          {branchToggles[b.id] ? b.baseAudience.toLocaleString() : '0 (Disabled)'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: CONTENT & VARIABLES */}
            {wizardStep === 3 && (
              <div className="space-y-4 pt-1">
                <div className="text-xs text-slate-600 leading-relaxed">
                  Customize personalization variables and interactive CTA buttons for template:{' '}
                  <span className="font-bold text-[#004F4C]">{formTemplateName}</span>
                </div>

                {/* Variable 1 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Variable {'{{1}}'} — Customer Name
                  </label>
                  <input
                    type="text"
                    disabled
                    value="Auto-personalized from Customer DB (e.g. Namaste Rahul!)"
                    className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-500"
                  />
                </div>

                {/* Variable 2 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Variable {'{{2}}'} — Offer / Pricing Tag
                  </label>
                  <input
                    type="text"
                    value={customOfferText}
                    onChange={e => setCustomOfferText(e.target.value)}
                    placeholder="e.g. starting from ₹1,299"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-[#008C83]"
                  />
                </div>

                {/* Interactive Action Button */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Call-To-Action (CTA) Button
                  </label>
                  <select
                    value={ctaType}
                    onChange={e => setCtaType(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 outline-none"
                  >
                    <option value="VISIT_STORE">🛒 Visit Nearest Store (Google Maps Link)</option>
                    <option value="CHAT_STYLIST">💬 Chat with Branch Stylist (Direct Handover)</option>
                    <option value="CALL_NOW">📞 Call Store Desk</option>
                  </select>
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW & CONFIRM BROADCAST */}
            {wizardStep === 4 && (
              <div className="space-y-4 pt-1">
                <div className="bg-[#f0f9f7] p-3.5 rounded-xl border border-[#A8F0D0] space-y-2 text-xs">
                  <div className="font-bold text-[#004F4C] text-sm">
                    Campaign Broadcast Summary
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Campaign Name:</span>
                      <span className="font-semibold">{formCampaignName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Type & Template:</span>
                      <span className="font-semibold">{formCampaignType} · {formTemplateName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Target Branches:</span>
                      <span className="font-semibold">
                        {Object.keys(branchToggles).filter(k => branchToggles[k]).join(', ')} ({selectedBranchCount} branches)
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Audience Reach:</span>
                      <span className="font-bold text-[#008C83] text-sm font-mono">
                        {eligibleAudienceSelected.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delivery Scheduling */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Delivery Timing
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 text-xs">
                      <input
                        type="radio"
                        name="deliveryTiming"
                        checked={deliveryTiming === 'SEND_NOW'}
                        onChange={() => setDeliveryTiming('SEND_NOW')}
                        className="text-[#004F4C] focus:ring-[#004F4C]"
                      />
                      <span className="font-medium text-slate-800">
                        Send Immediately (Simulated Instant Dispatches)
                      </span>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 text-xs">
                      <input
                        type="radio"
                        name="deliveryTiming"
                        checked={deliveryTiming === 'SCHEDULE_LATER'}
                        onChange={() => setDeliveryTiming('SCHEDULE_LATER')}
                        className="text-[#004F4C] focus:ring-[#004F4C]"
                      />
                      <span className="font-medium text-slate-800">
                        Schedule for Later Date & Time
                      </span>
                    </label>
                  </div>

                  {deliveryTiming === 'SCHEDULE_LATER' && (
                    <div className="mt-2.5">
                      <input
                        type="datetime-local"
                        value={scheduleDateTime}
                        onChange={e => setScheduleDateTime(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bottom Drawer Actions Bar matching screenshot */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              {/* Eligible Audience Card (Mint green box on left matching screenshot) */}
              <div className="flex-1 bg-[#e6f7f2] rounded-xl p-2.5 sm:p-3 border border-[#A8F0D0]/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#A8F0D0]/50 flex items-center justify-center text-[#004F4C]">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[10px] text-[#004F4C] font-semibold leading-tight">
                      Eligible Audience (Selected Branches)
                    </div>
                    <div className="text-base sm:text-lg font-bold text-[#102333] tracking-tight font-mono leading-tight">
                      {eligibleAudienceSelected.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Audience is filtered against marketing consent and valid Indian 10-digit mobile numbers."
                >
                  <Info className="w-4 h-4" />
                </div>
              </div>

              {/* Wizard Step Navigation Button */}
              {wizardStep === 1 && (
                <button
                  onClick={() => setWizardStep(2)}
                  className="px-5 py-3 bg-[#004F4C] hover:bg-[#003d3a] text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-xs cursor-pointer shrink-0"
                >
                  <span>Next: Audience</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {wizardStep === 2 && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setWizardStep(1)}
                    className="px-3 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setWizardStep(3)}
                    className="px-4 py-3 bg-[#004F4C] hover:bg-[#003d3a] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Next: Content</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setWizardStep(2)}
                    className="px-3 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setWizardStep(4)}
                    className="px-4 py-3 bg-[#004F4C] hover:bg-[#003d3a] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Next: Review</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {wizardStep === 4 && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleSubmitCampaign('Draft')}
                    disabled={isSubmitting}
                    className="px-3 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Save Draft
                  </button>
                  <button
                    onClick={() => handleSubmitCampaign()}
                    disabled={isSubmitting}
                    className="px-4 py-3 bg-[#004F4C] hover:bg-[#003d3a] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>{deliveryTiming === 'SCHEDULE_LATER' ? 'Schedule' : 'Launch Broadcast'}</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
