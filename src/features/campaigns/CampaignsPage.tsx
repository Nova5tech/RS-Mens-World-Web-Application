import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  MoreVertical,
  Clock,
  Eye,
  Trash2,
  Copy,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { useBranchContext } from '@/contexts/BranchContext';
import { Campaign, CampaignStats, Branch } from '@/types/models';
import {
  getCampaigns,
  getCampaignStats,
  deleteCampaign,
  cancelCampaign,
  createCampaign,
} from '@/services/campaigns';
import { getBranches } from '@/services/branches';
import { Button } from '@/components/ui/Button';
import { Pill } from '@/components/ui/Pill';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { CampaignWizard } from './CampaignWizard';
import { CampaignReportModal } from './CampaignReportModal';

export const CampaignsPage: React.FC = () => {
  const { user, role } = useAuth();
  const { selectedBranchId } = useBranchContext();
  const isBranchUser = role === 'branch_user';

  // Active status tab: 'all' | 'draft' | 'scheduled' | 'sent'
  const [activeTab, setActiveTab] = useState<'all' | 'draft' | 'scheduled' | 'sent'>('all');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Data states
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<CampaignStats>({
    total: 12,
    sent: 23510,
    delivered: 97.4,
    read: 84.2,
    failed: 210,
  });
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals & Drawers
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [reportCampaignId, setReportCampaignId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Load branches
  useEffect(() => {
    getBranches().then((list) => setBranches(list.filter((b) => b.is_active)));
  }, []);

  // Sync branch filter with Topbar
  useEffect(() => {
    if (isBranchUser && user?.branch_id) {
      setBranchFilter(user.branch_id);
    } else if (selectedBranchId) {
      setBranchFilter(selectedBranchId);
    } else {
      setBranchFilter('all');
    }
  }, [selectedBranchId, isBranchUser, user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const effectiveBranchId = isBranchUser ? user?.branch_id || undefined : (branchFilter === 'all' ? undefined : branchFilter);

      const [camps, statData] = await Promise.all([
        getCampaigns({
          branchId: effectiveBranchId,
          status: statusFilter === 'all' ? undefined : statusFilter,
          search: searchQuery,
        }),
        getCampaignStats(effectiveBranchId),
      ]);

      setCampaigns(camps);
      setStats(statData);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [branchFilter, statusFilter, searchQuery]);

  // Compute tab counts
  const tabCounts = useMemo(() => {
    return {
      all: campaigns.length,
      draft: campaigns.filter((c) => c.status === 'Draft').length,
      scheduled: campaigns.filter((c) => c.status === 'Scheduled').length,
      sent: campaigns.filter((c) => c.status === 'Sent' || c.status === 'Sending').length,
    };
  }, [campaigns]);

  // Filtered campaigns by active tab
  const displayedCampaigns = useMemo(() => {
    if (activeTab === 'all') return campaigns;
    if (activeTab === 'draft') return campaigns.filter((c) => c.status === 'Draft');
    if (activeTab === 'scheduled') return campaigns.filter((c) => c.status === 'Scheduled');
    if (activeTab === 'sent') return campaigns.filter((c) => c.status === 'Sent' || c.status === 'Sending');
    return campaigns;
  }, [campaigns, activeTab]);

  // Row actions
  const handleViewReport = (c: Campaign) => {
    setReportCampaignId(c.id);
    setActiveMenuId(null);
  };

  const handleDuplicate = async (c: Campaign) => {
    try {
      await createCampaign({
        name: `${c.name} (Copy)`,
        type: c.type,
        template_id: c.template_id,
        template_name: c.template_name,
        media_url: c.media_url,
        segment_id: c.segment_id,
        segment_name: c.segment_name,
        branches: c.branches,
        audience_count: c.audience_count,
        status: 'Draft',
        variables: c.variables,
      });
      setActiveMenuId(null);
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Duplicate failed');
    }
  };

  const handleCancelSchedule = async (c: Campaign) => {
    if (confirm(`Cancel scheduled campaign "${c.name}"?`)) {
      await cancelCampaign(c.id);
      setActiveMenuId(null);
      await loadData();
    }
  };

  const handleDelete = async (c: Campaign) => {
    if (confirm(`Delete campaign "${c.name}"?`)) {
      await deleteCampaign(c.id);
      setActiveMenuId(null);
      await loadData();
    }
  };

  // Close menus on outside click
  useEffect(() => {
    const handleOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-app-text tracking-tight">WhatsApp Campaigns</h1>
          <p className="text-sm text-app-muted mt-1">
            Create and manage WhatsApp marketing campaigns across branches
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsWizardOpen(true)}
          className="gap-2 bg-primary-brand hover:bg-[#0B3B2E]"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Campaign</span>
        </Button>
      </div>

      {/* 5 Stat Cards matching 05-campaigns-wizard.png */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-border-card shadow-card">
          <span className="text-xs text-app-muted font-medium block">Total Campaigns</span>
          <span className="text-2xl font-bold text-app-text mt-1.5 block">
            {stats.total}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-border-card shadow-card">
          <span className="text-xs text-app-muted font-medium block">Messages Sent</span>
          <span className="text-2xl font-bold text-app-text mt-1.5 block">
            {stats.sent.toLocaleString()}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-border-card shadow-card">
          <span className="text-xs text-app-muted font-medium block">Delivered %</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1.5 block">
            {stats.delivered}%
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-border-card shadow-card">
          <span className="text-xs text-app-muted font-medium block">Read %</span>
          <span className="text-2xl font-bold text-blue-700 mt-1.5 block">
            {stats.read}%
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-border-card shadow-card">
          <span className="text-xs text-app-muted font-medium block">Failed</span>
          <span className="text-2xl font-bold text-red-700 mt-1.5 block">
            {stats.failed.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Tab Chips with Counts matching screenshot */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer',
            activeTab === 'all'
              ? 'bg-primary-brand text-white shadow-sm'
              : 'bg-white text-slate-700 border border-border-card hover:bg-slate-50'
          )}
        >
          <span>All Campaigns</span>
          <span
            className={cn(
              'text-[11px] px-2 py-0.5 rounded-full font-bold',
              activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
            )}
          >
            {tabCounts.all}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('draft')}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer',
            activeTab === 'draft'
              ? 'bg-primary-brand text-white shadow-sm'
              : 'bg-white text-slate-700 border border-border-card hover:bg-slate-50'
          )}
        >
          <span>Drafts</span>
          <span
            className={cn(
              'text-[11px] px-2 py-0.5 rounded-full font-bold',
              activeTab === 'draft' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
            )}
          >
            {tabCounts.draft}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('scheduled')}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer',
            activeTab === 'scheduled'
              ? 'bg-primary-brand text-white shadow-sm'
              : 'bg-white text-slate-700 border border-border-card hover:bg-slate-50'
          )}
        >
          <span>Scheduled</span>
          <span
            className={cn(
              'text-[11px] px-2 py-0.5 rounded-full font-bold',
              activeTab === 'scheduled' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
            )}
          >
            {tabCounts.scheduled}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sent')}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer',
            activeTab === 'sent'
              ? 'bg-primary-brand text-white shadow-sm'
              : 'bg-white text-slate-700 border border-border-card hover:bg-slate-50'
          )}
        >
          <span>Sent</span>
          <span
            className={cn(
              'text-[11px] px-2 py-0.5 rounded-full font-bold',
              activeTab === 'sent' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
            )}
          >
            {tabCounts.sent}
          </span>
        </button>
      </div>

      {/* Filter Bar matching 05-campaigns-wizard.png */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full h-10 pl-10 pr-4 text-xs bg-white border border-border-card rounded-xl text-app-text placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-brand transition-all"
          />
        </div>

        <div className="relative">
          <select
            disabled={isBranchUser}
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
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

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 pl-3 pr-8 text-xs bg-white border border-border-card rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-accent-brand appearance-none cursor-pointer"
          >
            <option value="all">Status: All</option>
            <option value="sent">Sent</option>
            <option value="scheduled">Scheduled</option>
            <option value="draft">Draft</option>
            <option value="failed">Failed</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      )}

      {/* Campaigns Table matching 05-campaigns-wizard.png */}
      {!loading && (
        <div className="bg-white rounded-2xl border border-border-card shadow-card overflow-hidden">
          {displayedCampaigns.length === 0 ? (
            <EmptyState
              title="No campaigns found"
              description={searchQuery ? 'Try adjusting your search filters.' : 'Create your first WhatsApp marketing campaign.'}
              action={
                <Button variant="primary" size="sm" onClick={() => setIsWizardOpen(true)} className="bg-primary-brand">
                  Create Campaign
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
                        checked={selectedIds.length === displayedCampaigns.length && displayedCampaigns.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedIds(displayedCampaigns.map((c) => c.id));
                          else setSelectedIds([]);
                        }}
                        className="w-4 h-4 text-primary-brand rounded border-slate-300 focus:ring-accent-brand cursor-pointer"
                      />
                    </th>
                    <th className="py-3.5 px-4">Campaign Name</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Branches</th>
                    <th className="py-3.5 px-4">Audience</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 text-right w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-card">
                  {displayedCampaigns.map((c) => {
                    const isSelected = selectedIds.includes(c.id);
                    return (
                      <tr
                        key={c.id}
                        className={cn(
                          'hover:bg-slate-50/70 transition-colors cursor-pointer',
                          isSelected && 'bg-emerald-50/40'
                        )}
                        onClick={() => handleViewReport(c)}
                      >
                        <td
                          className="py-3.5 px-4 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() =>
                              setSelectedIds((prev) =>
                                prev.includes(c.id)
                                  ? prev.filter((id) => id !== c.id)
                                  : [...prev, c.id]
                              )
                            }
                            className="w-4 h-4 text-primary-brand rounded border-slate-300 focus:ring-accent-brand cursor-pointer"
                          />
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-app-text text-sm">
                          {c.name}
                        </td>

                        <td className="py-3.5 px-4">
                          {c.type === 'Promotional' && <Pill variant="green">Promotional</Pill>}
                          {c.type === 'Announcement' && <Pill variant="blue">Announcement</Pill>}
                          {c.type === 'Loyalty' && <Pill variant="purple">Loyalty</Pill>}
                          {c.type === 'Greeting' && <Pill variant="amber">Greeting</Pill>}
                        </td>

                        <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                          {c.branch_codes.join(', ')}
                        </td>

                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                          {c.audience_count.toLocaleString()}
                        </td>

                        <td className="py-3.5 px-4">
                          {c.status === 'Sent' && <Pill variant="green" dot>Sent</Pill>}
                          {c.status === 'Scheduled' && <Pill variant="amber" dot>Scheduled</Pill>}
                          {c.status === 'Draft' && <Pill variant="gray" dot>Draft</Pill>}
                          {c.status === 'Sending' && <Pill variant="blue" dot>Sending</Pill>}
                          {c.status === 'Failed' && <Pill variant="red" dot>Failed</Pill>}
                        </td>

                        <td className="py-3.5 px-4 text-slate-600">
                          {formatDate(c.scheduled_at || c.sent_at || c.created_at)}
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
                                onClick={() => handleViewReport(c)}
                                className="w-full px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-400" />
                                <span>View Report</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDuplicate(c)}
                                className="w-full px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5 text-slate-400" />
                                <span>Duplicate</span>
                              </button>
                              {c.status === 'Scheduled' && (
                                <button
                                  type="button"
                                  onClick={() => handleCancelSchedule(c)}
                                  className="w-full px-3.5 py-1.5 text-xs text-amber-700 hover:bg-amber-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Cancel Schedule</span>
                                </button>
                              )}
                              {c.status === 'Draft' && (
                                <button
                                  type="button"
                                  onClick={() => handleDelete(c)}
                                  className="w-full px-3.5 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                  <span>Delete Draft</span>
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create Campaign Drawer */}
      <CampaignWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSuccess={loadData}
        isBranchUser={isBranchUser}
        currentUserBranchId={user?.branch_id}
      />

      {/* Campaign Report Modal */}
      <CampaignReportModal
        campaignId={reportCampaignId}
        isOpen={Boolean(reportCampaignId)}
        onClose={() => setReportCampaignId(null)}
        onRefreshParent={loadData}
      />
    </div>
  );
};
