import React, { useState, useEffect } from 'react';
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
import { useBranch } from '../context/BranchContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import PetpoojaImportWizard from '../components/customers/PetpoojaImportWizard.jsx';
import AddCustomerModal from '../components/customers/AddCustomerModal.jsx';

export default function CustomersPage() {
  const { activeBranchId, branches } = useBranch();
  const { isBranchUser, currentUser } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'NEW' | 'ACTIVE' | 'INACTIVE'
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [consentFilter, setConsentFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedCustomerIds, setSelectedCustomerIds] = useState(new Set());
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);

  // Exact reference customer records matching approved screenshot
  const [customerList, setCustomerList] = useState([
    {
      id: 'C-10248',
      name: 'Rahul Kumar',
      phone: '+91 98765 43210',
      email: 'rahul.kumar@gmail.com',
      branch: 'Branch 1',
      branchDetail: 'Branch 1 (Anna Nagar)',
      consent: true,
      lastInteraction: 'Nov 18, 2025',
      customerType: 'Regular',
      status: 'Active',
      customerSince: 'Mar 15, 2024',
      purchases: {
        total: '₹24,560',
        orders: 12,
        avgOrderValue: '₹2,047',
      },
    },
    {
      id: 'C-10249',
      name: 'Priya Sharma',
      phone: '+91 98450 12345',
      email: 'priya.sharma@gmail.com',
      branch: 'Branch 2',
      branchDetail: 'Branch 2 (Kukatpally)',
      consent: true,
      lastInteraction: 'Nov 17, 2025',
      customerType: 'VIP',
      status: 'Active',
      customerSince: 'Jan 10, 2024',
      purchases: {
        total: '₹68,400',
        orders: 18,
        avgOrderValue: '₹3,800',
      },
    },
    {
      id: 'C-10250',
      name: 'Arjun Reddy',
      phone: '+91 90000 67890',
      email: 'arjun.reddy@gmail.com',
      branch: 'Branch 3',
      branchDetail: 'Branch 3 (Madhapur)',
      consent: false,
      lastInteraction: 'Nov 16, 2025',
      customerType: 'Regular',
      status: 'Active',
      customerSince: 'Apr 22, 2024',
      purchases: {
        total: '₹14,200',
        orders: 6,
        avgOrderValue: '₹2,367',
      },
    },
    {
      id: 'C-10251',
      name: 'Vikram Singh',
      phone: '+91 98123 45678',
      email: 'vikram.singh@gmail.com',
      branch: 'Branch 4',
      branchDetail: 'Branch 4 (Gachibowli)',
      consent: true,
      lastInteraction: 'Nov 15, 2025',
      customerType: 'Repeat',
      status: 'Active',
      customerSince: 'May 05, 2024',
      purchases: {
        total: '₹32,800',
        orders: 14,
        avgOrderValue: '₹2,343',
      },
    },
    {
      id: 'C-10252',
      name: 'Neha Iyer',
      phone: '+91 99456 78901',
      email: 'neha.iyer@gmail.com',
      branch: 'Branch 1',
      branchDetail: 'Branch 1 (Anna Nagar)',
      consent: true,
      lastInteraction: 'Nov 15, 2025',
      customerType: 'Regular',
      status: 'Active',
      customerSince: 'Jun 18, 2024',
      purchases: {
        total: '₹18,900',
        orders: 8,
        avgOrderValue: '₹2,362',
      },
    },
    {
      id: 'C-10253',
      name: 'Karthik M',
      phone: '+91 98760 23456',
      email: 'karthik.m@gmail.com',
      branch: 'Branch 2',
      branchDetail: 'Branch 2 (Kukatpally)',
      consent: true,
      lastInteraction: 'Nov 14, 2025',
      customerType: 'VIP',
      status: 'Active',
      customerSince: 'Feb 12, 2024',
      purchases: {
        total: '₹74,500',
        orders: 20,
        avgOrderValue: '₹3,725',
      },
    },
    {
      id: 'C-10254',
      name: 'Meera Nair',
      phone: '+91 98877 66554',
      email: 'meera.nair@gmail.com',
      branch: 'Branch 3',
      branchDetail: 'Branch 3 (Madhapur)',
      consent: true,
      lastInteraction: 'Nov 14, 2025',
      customerType: 'Regular',
      status: 'Active',
      customerSince: 'Aug 04, 2024',
      purchases: {
        total: '₹22,100',
        orders: 9,
        avgOrderValue: '₹2,455',
      },
    },
    {
      id: 'C-10255',
      name: 'Sandeep Rao',
      phone: '+91 99876 55432',
      email: 'sandeep.rao@gmail.com',
      branch: 'Branch 1',
      branchDetail: 'Branch 1 (Anna Nagar)',
      consent: false,
      lastInteraction: 'Nov 13, 2025',
      customerType: 'Regular',
      status: 'Active',
      customerSince: 'Sep 19, 2024',
      purchases: {
        total: '₹11,400',
        orders: 5,
        avgOrderValue: '₹2,280',
      },
    },
    {
      id: 'C-10256',
      name: 'Vishal Mehta',
      phone: '+91 98765 87654',
      email: 'vishal.mehta@gmail.com',
      branch: 'Branch 4',
      branchDetail: 'Branch 4 (Gachibowli)',
      consent: true,
      lastInteraction: 'Nov 12, 2025',
      customerType: 'Repeat',
      status: 'Active',
      customerSince: 'Jul 28, 2024',
      purchases: {
        total: '₹38,200',
        orders: 16,
        avgOrderValue: '₹2,387',
      },
    },
    {
      id: 'C-10257',
      name: 'Anita Joshi',
      phone: '+91 99654 32109',
      email: 'anita.joshi@gmail.com',
      branch: 'Branch 2',
      branchDetail: 'Branch 2 (Kukatpally)',
      consent: true,
      lastInteraction: 'Nov 12, 2025',
      customerType: 'Regular',
      status: 'Active',
      customerSince: 'Oct 02, 2024',
      purchases: {
        total: '₹16,800',
        orders: 7,
        avgOrderValue: '₹2,400',
      },
    },
  ]);

  const [selectedCustomer, setSelectedCustomer] = useState(customerList[0]);

  // Filter customers
  const filteredCustomers = customerList.filter(c => {
    // Search
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        c.id.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Branch filter
    if (branchFilter !== 'ALL' && c.branch !== branchFilter) {
      return false;
    }

    // Consent filter
    if (consentFilter === 'YES' && !c.consent) return false;
    if (consentFilter === 'NO' && c.consent) return false;

    // Customer Type filter
    if (typeFilter !== 'ALL' && c.customerType !== typeFilter) {
      return false;
    }

    // Tab filter
    if (activeTab === 'ACTIVE' && c.status !== 'Active') return false;
    if (activeTab === 'INACTIVE' && c.status !== 'Inactive') return false;

    return true;
  });

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
    setCustomerList(prev => [newCustomer, ...prev]);
    setSelectedCustomer(newCustomer);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-4 max-w-full mx-auto font-sans select-none">
      {/* 1. Customer Status Tabs & Action Buttons Bar matching Screenshot */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left Status Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {/* All Customers */}
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-[#004F4C] text-white shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>All Customers (2,486)</span>
          </button>

          {/* + New */}
          <button
            onClick={() => setActiveTab('NEW')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'NEW'
                ? 'bg-[#004F4C] text-white shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>New (684)</span>
          </button>

          {/* Active */}
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'ACTIVE'
                ? 'bg-[#004F4C] text-white shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Active (1,642)</span>
          </button>

          {/* Inactive */}
          <button
            onClick={() => setActiveTab('INACTIVE')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'INACTIVE'
                ? 'bg-[#004F4C] text-white shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs'
            }`}
          >
            <PauseCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Inactive (160)</span>
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-4 py-2 bg-[#e6f7f2] hover:bg-[#d5f3e9] text-[#004F4C] border border-[#A8F0D0] rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Import (Petpooja)</span>
          </button>

          <button
            onClick={() => setIsAddCustomerOpen(true)}
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

        {/* Branch dropdown filter */}
        <div className="relative">
          <select
            value={branchFilter}
            onChange={e => setBranchFilter(e.target.value)}
            className="appearance-none pl-8 pr-7 py-1.5 text-xs font-medium bg-white text-slate-700 border border-slate-200 rounded-xl hover:border-slate-300 outline-none cursor-pointer"
          >
            <option value="ALL">Branch: All</option>
            <option value="Branch 1">Branch 1 (Anna Nagar)</option>
            <option value="Branch 2">Branch 2 (Kukatpally)</option>
            <option value="Branch 3">Branch 3 (Madhapur)</option>
            <option value="Branch 4">Branch 4 (Gachibowli)</option>
          </select>
          <Store className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <span className="text-[10px] text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">▼</span>
        </div>

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

        {/* Filters button */}
        <button
          onClick={() => {
            setSearchTerm('');
            setBranchFilter('ALL');
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
                    <th className="p-3 w-8 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.map(customer => {
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
                          {customer.phone}
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
                        <td className="p-3 text-center" onClick={e => e.stopPropagation()}>
                          <button
                            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700"
                            aria-label="Actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Bar matching Screenshot */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 pt-1">
            <span className="font-sans">
              Showing 1 – 10 of 2,486 customers
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
                  className="w-7 h-7 rounded-lg border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center font-bold text-xs shadow-2xs"
                  aria-label="Previous page"
                >
                  &lt;
                </button>
                <button className="w-7 h-7 rounded-lg bg-[#004F4C] text-white font-bold text-xs shadow-xs flex items-center justify-center">
                  1
                </button>
                <button className="w-7 h-7 rounded-lg border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs flex items-center justify-center">
                  2
                </button>
                <button className="w-7 h-7 rounded-lg border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs flex items-center justify-center">
                  3
                </button>
                <button className="w-7 h-7 rounded-lg border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs flex items-center justify-center hidden sm:flex">
                  4
                </button>
                <button className="w-7 h-7 rounded-lg border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs flex items-center justify-center hidden sm:flex">
                  5
                </button>
                <span className="px-1 text-slate-400">...</span>
                <button className="w-8 h-7 rounded-lg border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs flex items-center justify-center">
                  249
                </button>
                <button
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

              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#e6f7f2] text-[#008C83] border border-[#A8F0D0]">
                {selectedCustomer.status || 'Active'}
              </span>
            </div>

            {/* Contact Details List */}
            <div className="space-y-2.5 text-xs text-slate-700 pt-1 font-sans">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-mono text-slate-800 font-medium">
                  {selectedCustomer.phone}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-800 font-medium truncate">
                  {selectedCustomer.email}
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
                  {selectedCustomer.customerSince || 'Customer Since: Mar 15, 2024'}
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
                href={`https://wa.me/91${selectedCustomer.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-[#004F4C] hover:bg-[#003d3a] text-white font-semibold rounded-xl text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send WhatsApp</span>
              </a>

              <button
                onClick={() => showToast(`Edit modal opened for ${selectedCustomer.name}`, 'info')}
                className="w-full py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit Customer</span>
              </button>

              <button
                onClick={() =>
                  showToast(
                    `Displaying ${selectedCustomer.purchases?.orders || 12} historical POS orders`,
                    'info'
                  )
                }
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
        onImportComplete={() => showToast('Petpooja records synchronized', 'success')}
      />

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        onCustomerAdded={handleCustomerAdded}
      />
    </div>
  );
}
