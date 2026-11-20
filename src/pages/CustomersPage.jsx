import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Download,
  Users,
  PlusCircle,
  CheckCircle2,
  PauseCircle,
  Plus,
  SlidersHorizontal,
  Store,
  ShieldCheck,
  Tag,
  MoreVertical,
  X,
  Phone,
  Mail,
  Calendar,
  ShoppingCart,
  MessageCircle,
  Edit2,
  History,
  Check,
} from 'lucide-react';
import { customerService } from '../services/customerService.js';
import { mockStorage } from '../mocks/mockStorage.js';
import { INITIAL_CUSTOMERS } from '../mocks/seedData.js';
import { useBranch } from '../context/BranchContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import PetpoojaImportWizard from '../components/customers/PetpoojaImportWizard.jsx';
import AddCustomerModal from '../components/customers/AddCustomerModal.jsx';
import BulkActionBar from '../components/customers/BulkActionBar.jsx';
import BulkCategoryModal from '../components/customers/BulkCategoryModal.jsx';
import AddToAudienceModal from '../components/customers/AddToAudienceModal.jsx';
import { downloadCustomersCSV } from '../utils/customerExport.js';

export default function CustomersPage() {
  const { activeBranchId, branches } = useBranch();
  const { isBranchUser, currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'NEW' | 'ACTIVE' | 'INACTIVE'
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [consentFilter, setConsentFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedCustomerIds, setSelectedCustomerIds] = useState(new Set());
  const [isBulkCategoryOpen, setIsBulkCategoryOpen] = useState(false);
  const [isAddToAudienceOpen, setIsAddToAudienceOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [openActionMenuId, setOpenActionMenuId] = useState(null);
  const actionMenuRef = useRef(null);

  // Initialize customer list from mockStorage or fallback
  const [customerList, setCustomerList] = useState(() => {
    try {
      const stored = mockStorage.getCustomers();
      if (Array.isArray(stored) && stored.length > 0) {
        return stored;
      }
    } catch (e) {
      console.warn('Error reading customers in CustomersPage', e);
    }
    return INITIAL_CUSTOMERS;
  });

  // 1. Strict Authenticated Branch-Based Access
  // If logged in as branch user, strictly isolate to their assigned store branch
  const authorizedCustomers = useMemo(() => {
    if (isBranchUser) {
      const assignedId = currentUser?.assignedBranchId || 'B1';
      return customerList.filter(c => {
        if (c.branchId) {
          return c.branchId === assignedId;
        }
        if (assignedId === 'B1') return c.branch === 'Branch 1';
        if (assignedId === 'B2') return c.branch === 'Branch 2';
        if (assignedId === 'B3') return c.branch === 'Branch 3';
        if (assignedId === 'B4') return c.branch === 'Branch 4';
        return false;
      });
    }
    return customerList;
  }, [customerList, isBranchUser, currentUser]);

  // 2. Dynamic Customer Status Tab Counts derived strictly from authorized records
  const counts = useMemo(() => {
    const all = authorizedCustomers.length;
    const newCount = authorizedCustomers.filter(
      c => c.status === 'New' || c.customerType === 'New'
    ).length;
    const active = authorizedCustomers.filter(c => c.status === 'Active').length;
    const inactive = authorizedCustomers.filter(c => c.status === 'Inactive').length;
    return { all, newCount, active, inactive };
  }, [authorizedCustomers]);

  // Default selected customer to first authorized customer
  const [selectedCustomer, setSelectedCustomer] = useState(() => authorizedCustomers[0] || null);

  useEffect(() => {
    if (authorizedCustomers.length > 0) {
      if (!selectedCustomer || !authorizedCustomers.some(c => c.id === selectedCustomer.id)) {
        setSelectedCustomer(authorizedCustomers[0]);
      }
    } else {
      setSelectedCustomer(null);
    }
  }, [authorizedCustomers]);

  // Close row action menu on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = () => setOpenActionMenuId(null);
    const handleKeyDown = e => {
      if (e.key === 'Escape') setOpenActionMenuId(null);
    };
    if (openActionMenuId) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openActionMenuId]);

  // 3. Reactive Filtering of Visible Rows
  const filteredCustomers = useMemo(() => {
    return authorizedCustomers.filter(c => {
      // Search
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const match =
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          (c.mobile && c.mobile.includes(q)) ||
          (c.email && c.email.toLowerCase().includes(q)) ||
          c.id.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Branch filter (only applicable for Super Admin)
      if (!isBranchUser && branchFilter !== 'ALL') {
        if (c.branchId && c.branchId !== branchFilter) {
          const branchNum = branchFilter.replace('B', '');
          if (c.branch !== `Branch ${branchNum}` && c.branch !== branchFilter) {
            return false;
          }
        } else if (c.branch && c.branch !== branchFilter) {
          return false;
        }
      }

      // Consent filter
      if (consentFilter === 'YES' && !c.consent) return false;
      if (consentFilter === 'NO' && c.consent) return false;

      // Customer Type filter
      if (typeFilter !== 'ALL' && c.customerType !== typeFilter) {
        return false;
      }

      // Tab filter
      if (activeTab === 'NEW') {
        if (c.status !== 'New' && c.customerType !== 'New') return false;
      } else if (activeTab === 'ACTIVE') {
        if (c.status !== 'Active') return false;
      } else if (activeTab === 'INACTIVE') {
        if (c.status !== 'Inactive') return false;
      }

      return true;
    });
  }, [authorizedCustomers, searchTerm, branchFilter, consentFilter, typeFilter, activeTab, isBranchUser]);

  const handleSelectAll = e => {
    if (e.target.checked) {
      setSelectedCustomerIds(new Set(filteredCustomers.map(c => c.id)));
    } else {
      setSelectedCustomerIds(new Set());
    }
  };

  const handleToggleSelectOne = (id, e) => {
    e.stopPropagation();
    setSelectedCustomerIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCustomerAdded = newCustomer => {
    const nextList = [newCustomer, ...customerList];
    setCustomerList(nextList);
    mockStorage.saveCustomers(nextList);
    setSelectedCustomer(newCustomer);
    setIsDetailsOpen(true);
  };

  const handleCustomerUpdated = updatedCust => {
    const nextList = customerList.map(c => (c.id === updatedCust.id ? updatedCust : c));
    setCustomerList(nextList);
    mockStorage.saveCustomers(nextList);
    setSelectedCustomer(updatedCust);
    setIsDetailsOpen(true);
  };

  const handleToggleCustomerStatus = customer => {
    const nextStatus = customer.status === 'Active' ? 'Inactive' : 'Active';
    const updated = { ...customer, status: nextStatus };
    const nextList = customerList.map(c => (c.id === customer.id ? updated : c));
    setCustomerList(nextList);
    mockStorage.saveCustomers(nextList);
    if (selectedCustomer?.id === customer.id) {
      setSelectedCustomer(updated);
    }
    showToast(`${customer.name} marked as ${nextStatus}`, 'success');
  };

  // Selected customer objects derived strictly from authorized records
  const selectedCustomers = useMemo(() => {
    return authorizedCustomers.filter(c => selectedCustomerIds.has(c.id));
  }, [authorizedCustomers, selectedCustomerIds]);

  const handleDeselectAll = () => {
    setSelectedCustomerIds(new Set());
  };

  const handleExportSelected = () => {
    if (selectedCustomers.length === 0) return;
    downloadCustomersCSV(selectedCustomers);
    showToast(`Exported ${selectedCustomers.length} customer records to CSV`, 'success');
  };

  const handleBulkCategoryConfirm = newCategory => {
    const updatedList = customerList.map(c => {
      if (selectedCustomerIds.has(c.id)) {
        return { ...c, customerType: newCategory };
      }
      return c;
    });
    setCustomerList(updatedList);
    mockStorage.saveCustomers(updatedList);

    if (selectedCustomer && selectedCustomerIds.has(selectedCustomer.id)) {
      setSelectedCustomer(prev => (prev ? { ...prev, customerType: newCategory } : prev));
    }

    showToast(`Updated ${selectedCustomerIds.size} customers to ${newCategory} category`, 'success');
  };

  const handleAddToAudienceConfirm = ({ consentedCustomers, unconsentedCount, mode, campaignId, newCampaignName }) => {
    try {
      const allCampaigns = mockStorage.getCampaigns();
      if (mode === 'existing' && campaignId) {
        const updatedCampaigns = allCampaigns.map(camp => {
          if (camp.id === campaignId) {
            const addCount = consentedCustomers.length;
            const newTotalAudience = (camp.audience || 0) + addCount;
            const updatedBranchAudience = { ...(camp.branchAudience || {}) };
            consentedCustomers.forEach(c => {
              const bId = c.branchId || 'B1';
              updatedBranchAudience[bId] = (updatedBranchAudience[bId] || 0) + 1;
            });
            return {
              ...camp,
              audience: newTotalAudience,
              branchAudience: updatedBranchAudience,
            };
          }
          return camp;
        });
        mockStorage.saveCampaigns(updatedCampaigns);
        const targetCamp = allCampaigns.find(c => c.id === campaignId);
        showToast(
          `Added ${consentedCustomers.length} opted-in customers to "${targetCamp?.name || 'Campaign'}"`,
          'success'
        );
      } else {
        const newCampId = `CAMP-${String(allCampaigns.length + 1).padStart(3, '0')}`;
        const branchCounts = {};
        consentedCustomers.forEach(c => {
          const bId = c.branchId || 'B1';
          branchCounts[bId] = (branchCounts[bId] || 0) + 1;
        });
        const activeBranches = Object.keys(branchCounts);
        const newCamp = {
          id: newCampId,
          name: newCampaignName || 'Custom Audience Campaign',
          title: newCampaignName || 'Custom Audience Campaign',
          type: 'Promotional',
          branches: activeBranches.length > 0 ? activeBranches : ['B1'],
          branchesDisplay: activeBranches.join(', '),
          audience: consentedCustomers.length,
          branchAudience: branchCounts,
          status: 'Drafts',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          template: 'Product Announcement',
          caption: 'Special curated promotion for selected customers.',
          deliveryCounts: { sent: 0, delivered: 0, read: 0, failed: 0 },
          deliveryRate: '0%',
          readRate: '0%',
          createdAt: new Date().toISOString(),
        };
        mockStorage.saveCampaigns([newCamp, ...allCampaigns]);
        showToast(
          `Created draft campaign "${newCamp.name}" with ${consentedCustomers.length} recipients`,
          'success'
        );
      }
      setSelectedCustomerIds(new Set());
    } catch (e) {
      console.error('Error adding to campaign audience', e);
      showToast('Failed to update campaign audience', 'error');
    }
  };

  return (
    <div className="space-y-4 max-w-full mx-auto font-sans select-none">
      {/* 1. Customer Status Tabs & Action Buttons Bar matching Screenshot */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left Status Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {/* All Customers */}
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-[#004F4C] text-white shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>All Customers ({counts.all})</span>
          </button>

          {/* + New */}
          <button
            type="button"
            onClick={() => setActiveTab('NEW')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'NEW'
                ? 'bg-[#004F4C] text-white shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs'
            }`}
          >
            <PlusCircle className={`w-3.5 h-3.5 ${activeTab === 'NEW' ? 'text-white' : 'text-slate-500'}`} />
            <span>New ({counts.newCount})</span>
          </button>

          {/* Active */}
          <button
            type="button"
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'ACTIVE'
                ? 'bg-[#004F4C] text-white shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${activeTab === 'ACTIVE' ? 'text-white' : 'text-slate-500'}`} />
            <span>Active ({counts.active})</span>
          </button>

          {/* Inactive */}
          <button
            type="button"
            onClick={() => setActiveTab('INACTIVE')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'INACTIVE'
                ? 'bg-[#004F4C] text-white shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs'
            }`}
          >
            <PauseCircle className={`w-3.5 h-3.5 ${activeTab === 'INACTIVE' ? 'text-white' : 'text-slate-500'}`} />
            <span>Inactive ({counts.inactive})</span>
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="px-4 py-2 bg-[#e6f7f2] hover:bg-[#d5f3e9] text-[#004F4C] border border-[#A8F0D0] rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Import (Petpooja)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCustomerToEdit(null);
              setIsAddCustomerOpen(true);
            }}
            className="px-4 py-2 bg-[#004F4C] hover:bg-[#003d3a] text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* 2. Horizontal Filter Bar matching Screenshot */}
      <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center gap-2.5">
        {/* Search input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, phone or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-transparent border-0 text-xs text-slate-800 placeholder-slate-400 outline-none font-sans"
          />
        </div>

        {/* Branch dropdown filter or locked store badge */}
        {isBranchUser ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#e6f7f2] border border-[#A8F0D0] text-[#004F4C] rounded-xl text-xs font-semibold shadow-2xs select-none">
            <Store className="w-3.5 h-3.5 text-[#008C83]" />
            <span>{currentUser?.branchName || 'Rajahmandary Main Branch'}</span>
          </div>
        ) : (
          <div className="relative">
            <select
              value={branchFilter}
              onChange={e => setBranchFilter(e.target.value)}
              className="appearance-none pl-8 pr-7 py-1.5 text-xs font-medium bg-white text-slate-700 border border-slate-200 rounded-xl hover:border-slate-300 outline-none cursor-pointer"
            >
              <option value="ALL">Branch: All</option>
              <option value="B1">Branch 1 – Rajahmandary Main Branch</option>
              <option value="B2">Branch 2 – Kakinada Branch</option>
              <option value="B3">Branch 3 – Vijayawada Branch</option>
              <option value="B4">Branch 4 – Guntur Branch</option>
            </select>
            <Store className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <span className="text-[10px] text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">▼</span>
          </div>
        )}

        {/* Consent dropdown filter */}
        <div className="relative">
          <select
            value={consentFilter}
            onChange={e => setConsentFilter(e.target.value)}
            className="appearance-none pl-8 pr-7 py-1.5 text-xs font-medium bg-white text-slate-700 border border-slate-200 rounded-xl hover:border-slate-300 outline-none cursor-pointer"
          >
            <option value="ALL">Consent: All</option>
            <option value="YES">Consent: Yes</option>
            <option value="NO">Consent: No</option>
          </select>
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <span className="text-[10px] text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">▼</span>
        </div>

        {/* Customer Type dropdown filter */}
        <div className="relative">
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="appearance-none pl-8 pr-7 py-1.5 text-xs font-medium bg-white text-slate-700 border border-slate-200 rounded-xl hover:border-slate-300 outline-none cursor-pointer"
          >
            <option value="ALL">Customer Type: All</option>
            <option value="Regular">Regular</option>
            <option value="VIP">VIP</option>
            <option value="Repeat">Repeat</option>
          </select>
          <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <span className="text-[10px] text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">▼</span>
        </div>

        {/* Reset Filters button */}
        <button
          type="button"
          onClick={() => {
            setSearchTerm('');
            if (!isBranchUser) setBranchFilter('ALL');
            setConsentFilter('ALL');
            setTypeFilter('ALL');
            setActiveTab('ALL');
            showToast('Filters reset', 'info');
          }}
          className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-medium text-slate-700 flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
          <span>Filters</span>
        </button>
      </div>

      {/* 3. Main Split View: Dense Customer Table (Left) + Customer Details Panel (Right) */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Left: Dense Customer Table + Pagination Bar */}
        <div className="flex-1 min-w-0 w-full space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#D9E9E8] text-slate-600 font-semibold text-xs bg-white">
                    <th className="p-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          filteredCustomers.length > 0 &&
                          selectedCustomerIds.size === filteredCustomers.length
                        }
                        onChange={handleSelectAll}
                        className="rounded border-slate-300 text-[#004F4C] focus:ring-[#004F4C]/20"
                      />
                    </th>
                    <th className="p-3">Customer Name</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Branch</th>
                    <th className="p-3">Consent</th>
                    <th className="p-3">Last Interaction</th>
                    <th className="p-3">Customer Type</th>
                    <th className="p-3 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Users className="w-8 h-8 text-slate-300" />
                          <p className="font-semibold text-slate-600 text-sm">No customers found</p>
                          <p className="text-xs text-slate-400">No records match the selected status or filters.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map(customer => {
                      const isSelected = selectedCustomer?.id === customer.id;
                      const isChecked = selectedCustomerIds.has(customer.id);

                      // Badge styles
                      let typeBadge = (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#e6f7f2] text-[#008C83]">
                          {customer.customerType}
                        </span>
                      );
                      if (customer.customerType === 'VIP') {
                        typeBadge = (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#fff8e6] text-[#b45309] border border-[#fde68a]">
                            VIP
                          </span>
                        );
                      } else if (customer.customerType === 'Repeat') {
                        typeBadge = (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]">
                            Repeat
                          </span>
                        );
                      }

                      return (
                        <tr
                          key={customer.id}
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setIsDetailsOpen(true);
                          }}
                          className={`hover:bg-[#f0f7f5]/40 transition-colors cursor-pointer ${
                            isSelected ? 'bg-[#f0f9f7]' : ''
                          }`}
                        >
                          <td className="p-3 text-center" onClick={e => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={e => handleToggleSelectOne(customer.id, e)}
                              className="rounded border-slate-300 text-[#004F4C] focus:ring-[#004F4C]/20"
                            />
                          </td>
                          <td className="p-3 font-semibold text-[#102333]">
                            {customer.name}
                          </td>
                          <td className="p-3 font-mono text-slate-700">
                            {customer.phone || customer.mobile}
                          </td>
                          <td className="p-3 text-slate-700">
                            {customer.branch}
                          </td>
                          <td className="p-3">
                            {customer.consent ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#047857] text-[11px] font-semibold">
                                <span className="w-3.5 h-3.5 rounded-full bg-[#10b981] text-white flex items-center justify-center text-[9px] font-bold">
                                  ✓
                                </span>
                                <span>Yes</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fef2f2] text-[#b91c1c] text-[11px] font-semibold">
                                <span className="w-3.5 h-3.5 rounded-full bg-[#ef4444] text-white flex items-center justify-center text-[9px] font-bold">
                                  ✕
                                </span>
                                <span>No</span>
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-slate-600 font-sans">
                            {customer.lastInteraction}
                          </td>
                          <td className="p-3">{typeBadge}</td>
                          <td className="p-3 text-center relative" onClick={e => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                setOpenActionMenuId(prev => (prev === customer.id ? null : customer.id));
                              }}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                openActionMenuId === customer.id
                                  ? 'bg-[#e6f7f2] text-[#004F4C]'
                                  : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
                              }`}
                              aria-label="Actions"
                              title="Customer actions"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* Floating Three-Dot Context Menu */}
                            {openActionMenuId === customer.id && (
                              <div
                                ref={actionMenuRef}
                                className="absolute right-3 top-10 w-44 bg-white rounded-xl shadow-float border border-slate-200/90 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150 text-left font-sans"
                                onClick={e => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedCustomer(customer);
                                    setIsDetailsOpen(true);
                                    setOpenActionMenuId(null);
                                  }}
                                  className="w-full px-3 py-2 text-xs text-slate-700 hover:bg-[#e6f7f2] hover:text-[#004F4C] flex items-center gap-2 transition-colors cursor-pointer"
                                >
                                  <Users className="w-3.5 h-3.5 text-slate-400" />
                                  <span>View Details</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setCustomerToEdit(customer);
                                    setIsAddCustomerOpen(true);
                                    setOpenActionMenuId(null);
                                  }}
                                  className="w-full px-3 py-2 text-xs text-slate-700 hover:bg-[#e6f7f2] hover:text-[#004F4C] flex items-center gap-2 transition-colors cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Edit Customer</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    handleToggleCustomerStatus(customer);
                                    setOpenActionMenuId(null);
                                  }}
                                  className="w-full px-3 py-2 text-xs text-slate-700 hover:bg-[#e6f7f2] hover:text-[#004F4C] flex items-center gap-2 transition-colors cursor-pointer border-t border-slate-100 mt-1 pt-1.5"
                                >
                                  {customer.status === 'Active' ? (
                                    <>
                                      <PauseCircle className="w-3.5 h-3.5 text-amber-500" />
                                      <span>Mark as Inactive</span>
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>Mark as Active</span>
                                    </>
                                  )}
                                </button>

                                <a
                                  href={`https://wa.me/91${(customer.phone || customer.mobile || '').replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => setOpenActionMenuId(null)}
                                  className="w-full px-3 py-2 text-xs text-slate-700 hover:bg-[#e6f7f2] hover:text-[#004F4C] flex items-center gap-2 transition-colors cursor-pointer"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>Send WhatsApp</span>
                                </a>
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
          </div>

          {/* Pagination Bar matching Screenshot */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 pt-1">
            <span className="font-sans">
              Showing {filteredCustomers.length > 0 ? 1 : 0} – {filteredCustomers.length} of {authorizedCustomers.length} customers
            </span>

            <div className="flex items-center gap-3">
              {/* Rows per page dropdown */}
              <div className="flex items-center gap-1 bg-white border border-slate-200/90 rounded-xl px-2.5 py-1 text-slate-700 shadow-2xs">
                <span>10 per page</span>
                <span className="text-[10px] text-slate-400">▼</span>
              </div>

              {/* Numbered pagination */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center font-bold text-xs shadow-2xs"
                  aria-label="Previous page"
                >
                  &lt;
                </button>
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg bg-[#004F4C] text-white font-bold text-xs shadow-xs flex items-center justify-center"
                >
                  1
                </button>
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs flex items-center justify-center"
                >
                  2
                </button>
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs flex items-center justify-center"
                >
                  3
                </button>
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs flex items-center justify-center hidden sm:flex"
                >
                  4
                </button>
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs flex items-center justify-center hidden sm:flex"
                >
                  5
                </button>
                <span className="px-1 text-slate-400">...</span>
                <button
                  type="button"
                  className="w-8 h-7 rounded-lg border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs flex items-center justify-center"
                >
                  {Math.max(1, Math.ceil(authorizedCustomers.length / 10))}
                </button>
                <button
                  type="button"
                  className="w-7 h-7 rounded-lg border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center font-bold text-xs shadow-2xs"
                  aria-label="Next page"
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Docked Customer Details Panel matching Screenshot */}
        {isDetailsOpen && selectedCustomer && (
          <div className="w-full lg:w-80 shrink-0 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
            {/* Header: Title + Close Button */}
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 tracking-tight">
                Customer Details
              </h3>
              <button
                type="button"
                onClick={() => setIsDetailsOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                aria-label="Close details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Avatar & Title */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#e6f7f2] flex items-center justify-center text-[#008C83]">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 leading-tight">
                    {selectedCustomer.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Customer ID: {selectedCustomer.id}
                  </p>
                </div>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                  selectedCustomer.status === 'Active'
                    ? 'bg-[#e6f7f2] text-[#008C83] border-[#A8F0D0]'
                    : selectedCustomer.status === 'New'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {selectedCustomer.status || 'Active'}
              </span>
            </div>

            {/* Contact Details List */}
            <div className="space-y-2.5 text-xs text-slate-700 pt-1 font-sans">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-mono text-slate-800 font-medium">
                  {selectedCustomer.phone || selectedCustomer.mobile}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-800 font-medium truncate">
                  {selectedCustomer.email || `${selectedCustomer.name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Store className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-800 font-medium">
                  {selectedCustomer.branchDetail || selectedCustomer.branch}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Tag className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-800 font-medium">
                  {selectedCustomer.customerType} Customer
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-600 font-medium">
                  Customer Since: {selectedCustomer.customerSince || 'Mar 15, 2024'}
                </span>
              </div>
            </div>

            {/* Purchase Summary Card */}
            <div className="bg-[#eefaf6] rounded-xl p-3.5 border border-[#D9E9E8] space-y-2.5">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <ShoppingCart className="w-4 h-4 text-[#008C83]" />
                <span>Purchase Summary</span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Total Purchases</span>
                  <span className="font-bold text-slate-900">
                    {selectedCustomer.purchases?.total || '₹24,560'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">No. of Orders</span>
                  <span className="font-bold text-slate-900">
                    {selectedCustomer.purchases?.orders ?? 12}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Avg. Order Value</span>
                  <span className="font-bold text-slate-900">
                    {selectedCustomer.purchases?.avgOrderValue || '₹2,047'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons Stack matching Screenshot */}
            <div className="space-y-2 pt-1">
              <a
                href={`https://wa.me/91${(selectedCustomer.phone || selectedCustomer.mobile || '').replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-[#004F4C] hover:bg-[#003d3a] text-white font-semibold rounded-xl text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setCustomerToEdit(selectedCustomer);
                  setIsAddCustomerOpen(true);
                }}
                className="w-full py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit Customer</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  navigate(`/invoices?search=${encodeURIComponent(selectedCustomer.name)}`);
                }}
                className="w-full py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
              >
                <History className="w-3.5 h-3.5 text-slate-500" />
                <span>View Purchase History</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Petpooja Import Wizard Modal */}
      <PetpoojaImportWizard
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={() => {
          showToast('Petpooja records synchronized', 'success');
          // Reload customers
          const reloaded = mockStorage.getCustomers();
          setCustomerList(reloaded);
        }}
      />

      {/* Add / Edit Customer Modal */}
      <AddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => {
          setIsAddCustomerOpen(false);
          setCustomerToEdit(null);
        }}
        onCustomerAdded={handleCustomerAdded}
        onCustomerUpdated={handleCustomerUpdated}
        customerToEdit={customerToEdit}
      />

      {/* Floating Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedCustomerIds.size}
        onDeselectAll={handleDeselectAll}
        onExport={handleExportSelected}
        onUpdateCategory={() => setIsBulkCategoryOpen(true)}
        onAddToCampaign={() => setIsAddToAudienceOpen(true)}
        isBranchUser={isBranchUser}
      />

      {/* Bulk Category Update Modal */}
      <BulkCategoryModal
        isOpen={isBulkCategoryOpen}
        onClose={() => setIsBulkCategoryOpen(false)}
        selectedCount={selectedCustomerIds.size}
        onConfirm={handleBulkCategoryConfirm}
      />

      {/* Add to WhatsApp Campaign Audience Modal (Super Admin Only + DPDP Consent) */}
      <AddToAudienceModal
        isOpen={isAddToAudienceOpen}
        onClose={() => setIsAddToAudienceOpen(false)}
        selectedCustomers={selectedCustomers}
        onConfirm={handleAddToAudienceConfirm}
      />
    </div>
  );
}
