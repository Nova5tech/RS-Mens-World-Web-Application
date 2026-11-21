import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Upload,
  Download,
  Search,
  Filter,
  MoreVertical,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  History,
  Trash2,
  UserX,
  Edit2,
  Eye,
  ChevronDown,
} from 'lucide-react';
import Papa from 'papaparse';
import { useAuth } from '@/features/auth/useAuth';
import { useBranchContext } from '@/contexts/BranchContext';
import { Customer, Branch, CustomerType } from '@/types/models';
import {
  getCustomers,
  getCustomerCounts,
  CustomerCounts,
  deleteCustomer,
  markCustomerOptedOut,
  bulkUpdateCustomerType,
  bulkOptOutCustomers,
} from '@/services/customers';
import { getBranches } from '@/services/branches';
import { Button } from '@/components/ui/Button';
import { Pill } from '@/components/ui/Pill';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatPhone } from '@/lib/phone';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { CustomerDrawer } from './CustomerDrawer';
import { AddEditCustomerDrawer } from './AddEditCustomerDrawer';
import { ImportWizard } from './ImportWizard';
import { ImportHistoryModal } from './ImportHistoryModal';

export const CustomersPage: React.FC = () => {
  const { user, role } = useAuth();
  const { selectedBranchId } = useBranchContext();
  const isBranchUser = role === 'branch_user';

  // Active status tab: 'all' | 'new' | 'active' | 'inactive'
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'active' | 'inactive'>('all');
  const [counts, setCounts] = useState<CustomerCounts>({ all: 0, new: 0, active: 0, inactive: 0 });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [consentFilter, setConsentFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Regular' | 'VIP' | 'Repeat'>('all');

  // Advanced Filters Popover
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [birthdayMonth, setBirthdayMonth] = useState<string>('');
  const [anniversaryMonth, setAnniversaryMonth] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  // Sorting & Pagination
  const [sortBy, setSortBy] = useState<string>('last_interaction_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState<number>(1);
  const pageSize = 20;

  // Data states
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalCustomers, setTotalCustomers] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selection states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Drawers and Modals
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Row Action Menu State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Load branches
  useEffect(() => {
    getBranches().then((list) => setBranches(list.filter((b) => b.is_active)));
  }, []);

  // Sync branch filter with Topbar branch selector
  useEffect(() => {
    if (isBranchUser && user?.branch_id) {
      setBranchFilter(user.branch_id);
    } else if (selectedBranchId) {
      setBranchFilter(selectedBranchId);
    } else {
      setBranchFilter('all');
    }
  }, [selectedBranchId, isBranchUser, user]);

  // Fetch customers & counts
  const loadCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const effectiveBranchId = isBranchUser ? user?.branch_id || undefined : (branchFilter === 'all' ? undefined : branchFilter);

      const [res, countRes] = await Promise.all([
        getCustomers({
          page,
          pageSize,
          search: searchQuery,
          branchId: effectiveBranchId,
          status: activeTab === 'all' ? undefined : activeTab,
          consent: consentFilter === 'all' ? undefined : consentFilter,
          type: typeFilter === 'all' ? undefined : typeFilter,
          birthdayMonth: birthdayMonth ? parseInt(birthdayMonth, 10) : undefined,
          anniversaryMonth: anniversaryMonth ? parseInt(anniversaryMonth, 10) : undefined,
          source: sourceFilter === 'all' ? undefined : sourceFilter,
          sortBy,
          sortOrder,
        }),
        getCustomerCounts(effectiveBranchId),
      ]);

      setCustomers(res.items);
      setTotalCustomers(res.total);
      setTotalPages(res.totalPages || 1);
      setCounts(countRes);

      // Refresh drawer if open
      if (selectedCustomer) {
        const updated = res.items.find((c) => c.id === selectedCustomer.id);
        if (updated) setSelectedCustomer(updated);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [
    page,
    searchQuery,
    branchFilter,
    activeTab,
    consentFilter,
    typeFilter,
    birthdayMonth,
    anniversaryMonth,
    sourceFilter,
    sortBy,
    sortOrder,
  ]);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(customers.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk actions
  const handleExportSelectedCsv = () => {
    const selectedCustomers = customers.filter((c) => selectedIds.includes(c.id));
    const targetList = selectedCustomers.length > 0 ? selectedCustomers : customers;

    const exportRows = targetList.map((c) => ({
      'Customer ID': c.code,
      'Name': c.name,
      'Mobile Phone': c.phone,
      'Email': c.email || '',
      'Store Branch': c.branch_name || '',
      'Customer Type': c.customer_type,
      'Status': c.status,
      'Consent': c.consent ? 'Yes' : 'No',
      'Total Purchases (INR)': c.total_purchases,
      'Order Count': c.order_count,
      'Last Interaction': formatDate(c.last_interaction_at),
      'Created At': formatDate(c.created_at),
    }));

    const csvString = Papa.unparse(exportRows);
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `customers_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkChangeType = async (newType: CustomerType) => {
    if (selectedIds.length === 0) return;
    try {
      await bulkUpdateCustomerType(selectedIds, newType);
      setSelectedIds([]);
      await loadCustomers();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Bulk update failed');
    }
  };

  const handleBulkOptOut = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Mark ${selectedIds.length} selected customers as opted-out?`)) {
      try {
        await bulkOptOutCustomers(selectedIds);
        setSelectedIds([]);
        await loadCustomers();
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : 'Bulk opt-out failed');
      }
    }
  };

  // Row actions
  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailsOpen(true);
    setActiveMenuId(null);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsAddEditOpen(true);
    setActiveMenuId(null);
  };

  const handleOptOutCustomer = async (customer: Customer) => {
    if (confirm(`Mark ${customer.name} as opted-out?`)) {
      await markCustomerOptedOut(customer.id);
      setActiveMenuId(null);
      await loadCustomers();
    }
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    if (confirm(`Delete customer ${customer.name}? This cannot be undone.`)) {
      await deleteCustomer(customer.id);
      setActiveMenuId(null);
      await loadCustomers();
    }
  };

  // Close menus on outside click
  useEffect(() => {
    const handleOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  const hasActiveFilters =
    birthdayMonth !== '' || anniversaryMonth !== '' || sourceFilter !== 'all';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-app-text tracking-tight">Customer Database</h1>
          <p className="text-sm text-app-muted mt-1">
            Manage customers and import from Petpooja
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="p-2 text-slate-500 hover:text-primary-brand hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Import History"
          >
            <History className="w-5 h-5" />
          </button>

          {/* Import Button: mint-soft style matching 03-customers.png */}
          <button
            type="button"
            onClick={() => setIsImportOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-soft hover:bg-[#D4F3E4] text-primary-brand font-semibold text-xs transition-all cursor-pointer shadow-xs"
          >
            <Upload className="w-4 h-4" />
            <span>Import (Petpooja)</span>
          </button>

          {/* Add Customer Button */}
          <Button
            variant="primary"
            onClick={() => {
              setEditingCustomer(null);
              setIsAddEditOpen(true);
            }}
            className="gap-2 bg-primary-brand hover:bg-[#0B3B2E]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </Button>
        </div>
      </div>

      {/* Tab Chips with Counts matching 03-customers.png */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setActiveTab('all');
            setPage(1);
          }}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer',
            activeTab === 'all'
              ? 'bg-primary-brand text-white shadow-sm'
              : 'bg-white text-slate-700 border border-border-card hover:bg-slate-50'
          )}
        >
          <Users className="w-3.5 h-3.5" />
          <span>All Customers</span>
          <span
            className={cn(
              'text-[11px] px-2 py-0.5 rounded-full font-bold',
              activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
            )}
          >
            {counts.all.toLocaleString()}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('new');
            setPage(1);
          }}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer',
            activeTab === 'new'
              ? 'bg-primary-brand text-white shadow-sm'
              : 'bg-white text-slate-700 border border-border-card hover:bg-slate-50'
          )}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New</span>
          <span
            className={cn(
              'text-[11px] px-2 py-0.5 rounded-full font-bold',
              activeTab === 'new' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
            )}
          >
            {counts.new.toLocaleString()}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('active');
            setPage(1);
          }}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer',
            activeTab === 'active'
              ? 'bg-primary-brand text-white shadow-sm'
              : 'bg-white text-slate-700 border border-border-card hover:bg-slate-50'
          )}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Active</span>
          <span
            className={cn(
              'text-[11px] px-2 py-0.5 rounded-full font-bold',
              activeTab === 'active' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
            )}
          >
            {counts.active.toLocaleString()}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('inactive');
            setPage(1);
          }}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer',
            activeTab === 'inactive'
              ? 'bg-primary-brand text-white shadow-sm'
              : 'bg-white text-slate-700 border border-border-card hover:bg-slate-50'
          )}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Inactive</span>
          <span
            className={cn(
              'text-[11px] px-2 py-0.5 rounded-full font-bold',
              activeTab === 'inactive' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
            )}
          >
            {counts.inactive.toLocaleString()}
          </span>
        </button>
      </div>

      {/* Filter Bar matching 03-customers.png */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, phone or email..."
            className="w-full h-10 pl-10 pr-4 text-xs bg-white border border-border-card rounded-xl text-app-text placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-brand focus:border-transparent transition-all"
          />
        </div>

        {/* Branch Select */}
        <div className="relative">
          <select
            disabled={isBranchUser}
            value={branchFilter}
            onChange={(e) => {
              setBranchFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 pl-3 pr-8 text-xs bg-white border border-border-card rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-accent-brand appearance-none cursor-pointer"
          >
            <option value="all">Branch: All</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.code} – {b.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
        </div>

        {/* Consent Select */}
        <div className="relative">
          <select
            value={consentFilter}
            onChange={(e) => {
              setConsentFilter(e.target.value as 'all' | 'yes' | 'no');
              setPage(1);
            }}
            className="h-10 pl-3 pr-8 text-xs bg-white border border-border-card rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-accent-brand appearance-none cursor-pointer"
          >
            <option value="all">Consent: All</option>
            <option value="yes">Consent: Yes</option>
            <option value="no">Consent: No</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
        </div>

        {/* Customer Type Select */}
        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as 'all' | 'Regular' | 'VIP' | 'Repeat');
              setPage(1);
            }}
            className="h-10 pl-3 pr-8 text-xs bg-white border border-border-card rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-accent-brand appearance-none cursor-pointer"
          >
            <option value="all">Customer Type: All</option>
            <option value="Regular">Regular</option>
            <option value="VIP">VIP</option>
            <option value="Repeat">Repeat</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
        </div>

        {/* Advanced Filters Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={cn(
              'h-10 px-3.5 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer',
              hasActiveFilters
                ? 'border-primary-brand bg-primary-brand/5 text-primary-brand ring-1 ring-primary-brand'
                : 'border-border-card bg-white text-slate-700 hover:bg-slate-50'
            )}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-accent-brand" />
            )}
          </button>

          {/* Filter Popover */}
          {isFilterOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-border-card p-4 z-40 space-y-3.5 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-border-card text-xs font-bold text-app-text">
                <span>Filter Customers</span>
                <button
                  type="button"
                  onClick={() => {
                    setBirthdayMonth('');
                    setAnniversaryMonth('');
                    setSourceFilter('all');
                  }}
                  className="text-[11px] text-primary-brand hover:underline font-semibold"
                >
                  Reset
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-app-text mb-1">
                  Birthday Month
                </label>
                <select
                  value={birthdayMonth}
                  onChange={(e) => setBirthdayMonth(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs bg-white border border-border-card rounded-lg"
                >
                  <option value="">Any Month</option>
                  {[
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'
                  ].map((m, idx) => (
                    <option key={m} value={idx + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-app-text mb-1">
                  Anniversary Month
                </label>
                <select
                  value={anniversaryMonth}
                  onChange={(e) => setAnniversaryMonth(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs bg-white border border-border-card rounded-lg"
                >
                  <option value="">Any Month</option>
                  {[
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'
                  ].map((m, idx) => (
                    <option key={m} value={idx + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-app-text mb-1">
                  Customer Source
                </label>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs bg-white border border-border-card rounded-lg"
                >
                  <option value="all">All Sources</option>
                  <option value="Petpooja">Petpooja Import</option>
                  <option value="Walk-in">Walk-in Store</option>
                  <option value="Chat">Website Chat</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full bg-primary-brand"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Actions Floating Bar */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-[#0B3B2E] text-white rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3 text-xs">
            <span className="font-bold bg-accent-brand text-[#0B3B2E] px-2.5 py-0.5 rounded-full">
              {selectedIds.length}
            </span>
            <span>customers selected</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportSelectedCsv}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 gap-1.5 text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </Button>

            <div className="relative inline-block">
              <select
                onChange={(e) => {
                  if (e.target.value) handleBulkChangeType(e.target.value as CustomerType);
                }}
                className="h-8 px-2.5 text-xs bg-white/10 text-white border border-white/20 rounded-xl focus:outline-none cursor-pointer"
                defaultValue=""
              >
                <option value="" disabled className="text-slate-800">
                  Change Type...
                </option>
                <option value="Regular" className="text-slate-800">Regular</option>
                <option value="VIP" className="text-slate-800">VIP</option>
                <option value="Repeat" className="text-slate-800">Repeat</option>
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkOptOut}
              className="bg-white/10 text-white border-white/20 hover:bg-red-500/30 gap-1.5 text-xs"
            >
              <UserX className="w-3.5 h-3.5" />
              <span>Mark Opted-out</span>
            </Button>

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-xs text-white/70 hover:text-white px-2 py-1"
            >
              Deselect
            </button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={loadCustomers}>
            Retry
          </Button>
        </div>
      )}

      {/* Main Customers Table matching 03-customers.png */}
      {!loading && !error && (
        <div className="bg-white rounded-2xl border border-border-card shadow-card overflow-hidden">
          {customers.length === 0 ? (
            <EmptyState
              title="No customers found"
              description={searchQuery ? 'No customer records match your filter criteria.' : 'No customers registered yet.'}
              action={
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsImportOpen(true)}
                  className="bg-primary-brand"
                >
                  Import from Petpooja
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFA] text-slate-600 font-semibold border-b border-border-card uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === customers.length && customers.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-4 h-4 text-primary-brand rounded border-slate-300 focus:ring-accent-brand cursor-pointer"
                      />
                    </th>
                    <th className="py-3.5 px-4">Customer Name</th>
                    <th className="py-3.5 px-4">Phone</th>
                    <th className="py-3.5 px-4">Branch</th>
                    <th className="py-3.5 px-4">Consent</th>
                    <th
                      className="py-3.5 px-4 cursor-pointer select-none group"
                      onClick={() => {
                        if (sortBy === 'last_interaction_at') {
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortBy('last_interaction_at');
                          setSortOrder('desc');
                        }
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Last Interaction</span>
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
                      </div>
                    </th>
                    <th className="py-3.5 px-4">Customer Type</th>
                    <th className="py-3.5 px-4 text-right w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-card">
                  {customers.map((c) => {
                    const isSelected = selectedIds.includes(c.id);
                    return (
                      <tr
                        key={c.id}
                        className={cn(
                          'hover:bg-slate-50/70 transition-colors cursor-pointer',
                          isSelected && 'bg-emerald-50/40'
                        )}
                        onClick={() => handleViewCustomer(c)}
                      >
                        <td
                          className="py-3.5 px-4 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectRow(c.id)}
                            className="w-4 h-4 text-primary-brand rounded border-slate-300 focus:ring-accent-brand cursor-pointer"
                          />
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-app-text text-sm">
                            {c.name}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                          {formatPhone(c.phone)}
                        </td>

                        <td className="py-3.5 px-4 text-slate-700">
                          {c.branch_name ? (
                            c.branch_name.replace('Rajahmundry Main Branch', 'Branch 1').replace('Kakinada Branch', 'Branch 2').replace('Vijayawada Branch', 'Branch 3').replace('Guntur Branch', 'Branch 4')
                          ) : (
                            'Branch 1'
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {c.consent ? (
                            <Pill variant="green">
                              ✓ Yes
                            </Pill>
                          ) : (
                            <Pill variant="red">
                              ✕ No
                            </Pill>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-slate-600">
                          {formatDate(c.last_interaction_at)}
                        </td>

                        <td className="py-3.5 px-4">
                          {c.customer_type === 'Regular' && (
                            <Pill variant="green">Regular</Pill>
                          )}
                          {c.customer_type === 'VIP' && (
                            <Pill variant="amber">VIP</Pill>
                          )}
                          {c.customer_type === 'Repeat' && (
                            <Pill variant="blue">Repeat</Pill>
                          )}
                        </td>

                        <td
                          className="py-3.5 px-4 text-right relative"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setActiveMenuId(activeMenuId === c.id ? null : c.id)
                            }
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuId === c.id && (
                            <div className="absolute right-4 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-border-card py-1.5 z-50 text-left animate-in fade-in zoom-in-95">
                              <button
                                type="button"
                                onClick={() => handleViewCustomer(c)}
                                className="w-full px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-400" />
                                <span>View Details</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleEditCustomer(c)}
                                className="w-full px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                                <span>Edit Customer</span>
                              </button>
                              {c.consent && (
                                <button
                                  type="button"
                                  onClick={() => handleOptOutCustomer(c)}
                                  className="w-full px-3.5 py-1.5 text-xs text-amber-700 hover:bg-amber-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <UserX className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Mark Opted-out</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteCustomer(c)}
                                className="w-full px-3.5 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination Bar */}
              <div className="px-6 py-4 border-t border-border-card bg-[#F8FAFA] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                <div>
                  Showing <strong>{(page - 1) * pageSize + 1}</strong> to{' '}
                  <strong>{Math.min(page * pageSize, totalCustomers)}</strong> of{' '}
                  <strong>{totalCustomers.toLocaleString()}</strong> customers
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="gap-1 text-xs"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </Button>

                  <span className="font-semibold px-2">
                    Page {page} of {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="gap-1 text-xs"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Customer Details Drawer */}
      <CustomerDrawer
        isOpen={isDetailsOpen}
        customer={selectedCustomer}
        onClose={() => setIsDetailsOpen(false)}
        onEdit={(cust) => {
          setIsDetailsOpen(false);
          setEditingCustomer(cust);
          setIsAddEditOpen(true);
        }}
        onRefresh={loadCustomers}
      />

      {/* Add / Edit Customer Drawer */}
      <AddEditCustomerDrawer
        isOpen={isAddEditOpen}
        customer={editingCustomer}
        onClose={() => setIsAddEditOpen(false)}
        onSuccess={loadCustomers}
        branches={branches}
        currentBranchId={isBranchUser ? user?.branch_id : undefined}
        isBranchUser={isBranchUser}
      />

      {/* Petpooja Import Wizard (Full-screen Modal) */}
      <ImportWizard
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={loadCustomers}
        branches={branches}
        currentBranchId={isBranchUser ? user?.branch_id : undefined}
        isBranchUser={isBranchUser}
        existingCustomers={customers}
        currentUserFullName={user?.full_name || 'Super Admin'}
      />

      {/* Import History Modal */}
      <ImportHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  );
};
