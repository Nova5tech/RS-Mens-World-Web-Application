import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Store,
  BookOpen,
  RotateCcw,
  Server,
  Edit2,
  Shield,
  Users,
  CheckCircle2,
  Key,
  Plus,
  Save,
  X,
  ExternalLink,
  Smartphone,
  History,
  Search,
  Clock,
} from 'lucide-react';
import { useBranch } from '../context/BranchContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { mockStorage } from '../mocks/mockStorage.js';
import { branchService } from '../services/branchService.js';
import { authService } from '../services/authService.js';
import { auditService } from '../services/auditService.js';
import { formatDateTime } from '../utils/formatters.js';

export default function SettingsPage() {
  const { branches, reloadBranches } = useBranch();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    tabParam && ['branches', 'users', 'knowledge', 'integration', 'audit'].includes(tabParam)
      ? tabParam
      : 'branches'
  );

  useEffect(() => {
    const currentParam = searchParams.get('tab');
    if (currentParam && ['branches', 'users', 'knowledge', 'integration', 'audit'].includes(currentParam)) {
      setActiveTab(currentParam);
    }
  }, [searchParams]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  const [editingBranchId, setEditingBranchId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', hours: '', address: '' });
  const [knowledgeBase, setKnowledgeBase] = useState(() => mockStorage.getKnowledgeBase());
  const [demoAccounts] = useState(() => authService.getDemoAccounts());
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditBranchFilter, setAuditBranchFilter] = useState('ALL');
  const [auditSearch, setAuditSearch] = useState('');

  const loadAuditLogs = async () => {
    try {
      const logs = await auditService.getAuditLogs({
        branchId: auditBranchFilter,
        search: auditSearch,
      });
      setAuditLogs(logs);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'audit') {
      loadAuditLogs();
    }
  }, [activeTab, auditBranchFilter, auditSearch]);

  const handleStartEdit = branch => {
    setEditingBranchId(branch.id);
    setEditForm({
      name: branch.name,
      phone: branch.phone,
      hours: branch.hours,
      address: branch.address,
    });
  };

  const handleSaveBranch = async id => {
    try {
      await branchService.updateBranch(id, editForm);
      setEditingBranchId(null);
      await reloadBranches();
      showToast('Store details updated successfully', 'success');
    } catch (err) {
      showToast('Failed to update branch details', 'error');
    }
  };

  const handleToggleBranch = async (id, currentEnabled) => {
    try {
      await branchService.toggleBranch(id, !currentEnabled);
      await reloadBranches();
      showToast(`Branch ${id} ${!currentEnabled ? 'enabled' : 'disabled'}`, 'info');
    } catch (err) {
      showToast('Failed to update branch status', 'error');
    }
  };

  const handleResetData = () => {
    if (
      window.confirm(
        'Reset all prototype demonstration data, leads, customers, and campaigns to initial state?'
      )
    ) {
      mockStorage.resetSeedData();
      reloadBranches();
      setKnowledgeBase(mockStorage.getKnowledgeBase());
      showToast('System demonstration data reset successfully', 'success');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Store & System Settings
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Retail branches, role-based user access, approved AI knowledge base & API integrations
          </p>
        </div>

        <button
          onClick={handleResetData}
          className="px-3.5 py-2 bg-white border border-slate-200/90 hover:border-slate-300 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset Demo Data</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="p-1.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-1 overflow-x-auto">
        <button
          onClick={() => handleTabChange('branches')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'branches'
            ? 'bg-[#0f766e] text-white shadow-2xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
        >
          <Store className="w-4 h-4" />
          <span>Store Branches ({branches.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('users')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'users'
            ? 'bg-[#0f766e] text-white shadow-2xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
        >
          <Users className="w-4 h-4" />
          <span>Users & Roles ({demoAccounts.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('knowledge')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'knowledge'
            ? 'bg-[#0f766e] text-white shadow-2xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>AI Knowledge Base ({knowledgeBase.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('integration')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'integration'
            ? 'bg-[#0f766e] text-white shadow-2xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
        >
          <Server className="w-4 h-4" />
          <span>WhatsApp & API Services</span>
        </button>

        <button
          onClick={() => handleTabChange('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'audit'
            ? 'bg-[#0f766e] text-white shadow-2xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
        >
          <History className="w-4 h-4" />
          <span>System Audit Log</span>
        </button>
      </div>

      {/* TAB 1: Four Retail Store Branches */}
      {activeTab === 'branches' && (
        <div className="space-y-4">
          <div className="p-3.5 bg-[#f0f9f7] rounded-2xl border border-[#D9E9E8] text-xs text-slate-700 flex items-center justify-between">
            <span>
              All 4 retail store branches operate with dedicated staff logins, branch-scoped lead routing, and localized WhatsApp broadcasts.
            </span>
            <span className="font-bold text-[#008C83] shrink-0 ml-3">4 Locations Configured</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {branches.map(branch => {
              const isEditing = editingBranchId === branch.id;

              return (
                <div
                  key={branch.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-[#008C83]/30 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#e6f7f2] flex items-center justify-center text-[#008C83] font-bold text-sm">
                        {branch.id}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">{branch.name}</h3>
                        <span className="text-[11px] font-mono text-slate-400">
                          {branch.code}
                          {branch.isConfirmed && ' • Flagship Store'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleBranch(branch.id, branch.enabled)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${branch.enabled
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                        : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}
                    >
                      {branch.enabled ? 'Active Store' : 'Inactive'}
                    </button>
                  </div>

                  {isEditing ? (
                    <div className="space-y-2.5 pt-2 text-xs">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">Store Name</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full p-2 bg-[#f8fbfb] border border-slate-200 rounded-xl text-xs outline-none focus:border-[#0f766e]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">Address</label>
                        <input
                          type="text"
                          value={editForm.address}
                          onChange={e => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                          className="w-full p-2 bg-[#f8fbfb] border border-slate-200 rounded-xl text-xs outline-none focus:border-[#0f766e]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-500 block mb-1">Phone</label>
                          <input
                            type="text"
                            value={editForm.phone}
                            onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full p-2 bg-[#f8fbfb] border border-slate-200 rounded-xl text-xs outline-none focus:border-[#0f766e]"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-500 block mb-1">Hours</label>
                          <input
                            type="text"
                            value={editForm.hours}
                            onChange={e => setEditForm(prev => ({ ...prev, hours: e.target.value }))}
                            className="w-full p-2 bg-[#f8fbfb] border border-slate-200 rounded-xl text-xs outline-none focus:border-[#0f766e]"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          onClick={() => setEditingBranchId(null)}
                          className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveBranch(branch.id)}
                          className="px-4 py-1.5 bg-[#0f766e] hover:bg-[#0d655f] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Changes</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs text-slate-600 pt-1">
                      <p className="line-clamp-2 text-slate-700">{branch.address}</p>
                      <div className="flex items-center justify-between pt-1">
                        <p className="font-mono text-[11px] text-slate-500">{branch.phone} • {branch.hours}</p>
                        <button
                          onClick={() => handleStartEdit(branch)}
                          className="text-[#0f766e] hover:text-[#004F4C] text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Users & Role-Based Access */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="p-3.5 bg-[#f0f9f7] rounded-2xl border border-[#D9E9E8] text-xs text-slate-700 flex items-center justify-between">
            <span>
              Role-Based Access Control (RBAC): Super Admin possesses centralized cross-branch authority; store branch accounts are scoped strictly to their store.
            </span>
            <span className="font-bold text-[#008C83] shrink-0 ml-3">5 Accounts Active</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f8fbfb] border-b border-[#D9E9E8] text-slate-500 font-semibold text-[11px] tracking-wider uppercase">
                  <th className="p-4">Account Name</th>
                  <th className="p-4">Role & Scope</th>
                  <th className="p-4">Store Assignment</th>
                  <th className="p-4">Authentication PIN</th>
                  <th className="p-4">Access Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {demoAccounts.map(acc => {
                  const isAdminAcc = acc.role === 'ADMIN';
                  return (
                    <tr key={acc.id} className="hover:bg-[#f0f7f5]/40 transition-colors">
                      <td className="p-4 font-bold text-slate-900 flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${isAdminAcc ? 'bg-[#06332b] text-[#48d597]' : 'bg-[#e6f7f2] text-[#008C83]'
                            }`}
                        >
                          {acc.name.charAt(0)}
                        </div>
                        <div>
                          <span>{acc.name}</span>
                          <span className="block text-[11px] text-slate-400 font-normal">{acc.id}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${isAdminAcc
                            ? 'bg-[#062b24] text-[#48d597]'
                            : 'bg-blue-50 text-blue-700 border border-blue-200/80'
                            }`}
                        >
                          <Shield className="w-3 h-3" />
                          {isAdminAcc ? 'Super Administrator' : 'Branch Staff / Cashier'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-700 font-medium">
                        {acc.branchName || 'All 4 Retail Branches'}
                      </td>
                      <td className="p-4 font-mono text-slate-600 font-bold">
                        •••• (Demo: {acc.demoPinHint})
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Authorized
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Approved AI Knowledge Base */}
      {activeTab === 'knowledge' && (
        <div className="space-y-4">
          <div className="p-3.5 bg-[#f0f9f7] rounded-2xl border border-[#D9E9E8] text-xs text-slate-700 flex items-center justify-between">
            <span>
              The AI Chat Concierge strictly matches visitor inquiries against verified store knowledge below. Unknown queries trigger automatic handover to store staff.
            </span>
            <span className="font-bold text-[#008C83] shrink-0 ml-3">Verified Policy Store</span>
          </div>

          <div className="space-y-3">
            {knowledgeBase.map(faq => (
              <div
                key={faq.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2.5 text-xs hover:border-[#008C83]/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#e6f7f2] text-[#008C83] font-semibold text-[11px]">
                    <CheckCircle2 className="w-3 h-3" />
                    {faq.category}
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">#{faq.id}</span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm">{faq.question}</h4>

                <p className="text-slate-700 leading-relaxed bg-[#f8fbfb] p-3 rounded-xl border border-slate-100">
                  {faq.answer}
                </p>

                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-400">Match Keywords:</span>
                  {faq.keywords.map(kw => (
                    <span
                      key={kw}
                      className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-mono text-[10px]"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: WhatsApp & Service Endpoints */}
      {activeTab === 'integration' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4 text-xs">
            <div>
              <h3 className="font-bold text-sm text-slate-900 tracking-tight">
                WhatsApp Cloud API & Provisional Endpoints
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Frontend is operating with connected mock storage persistence and real-time state emulation
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#f8fbfb] rounded-2xl border border-slate-200/80 space-y-2">
                <span className="font-bold text-xs text-slate-900 block">WhatsApp Meta WABA Status</span>
                <p className="text-[11px] text-slate-500">
                  WABA ID: 104928374928174 · Tier: Tier-2 (10,000 unique business messages/24hr)
                </p>
                <div className="flex items-center gap-2 pt-1 text-emerald-700 font-semibold text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Connected & Verified
                </div>
              </div>

              <div className="p-4 bg-[#f8fbfb] rounded-2xl border border-slate-200/80 space-y-2">
                <span className="font-bold text-xs text-slate-900 block">Petpooja POS Connector</span>
                <p className="text-[11px] text-slate-500">
                  Sync Mode: Periodic CSV/Excel Upload with Auto-deduplication by mobile number
                </p>
                <div className="flex items-center gap-2 pt-1 text-emerald-700 font-semibold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  Ready for File Import
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden pt-2">
              <div className="bg-[#f8fbfb] px-4 py-2 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase">
                Active REST API Endpoints
              </div>
              <div className="divide-y divide-slate-100 font-mono text-[11px]">
                {[
                  { method: 'GET', endpoint: '/api/branches' },
                  { method: 'GET', endpoint: '/api/chats' },
                  { method: 'POST', endpoint: '/api/chats/messages' },
                  { method: 'POST', endpoint: '/api/chats/{id}/handover' },
                  { method: 'GET', endpoint: '/api/leads' },
                  { method: 'POST', endpoint: '/api/leads' },
                  { method: 'PATCH', endpoint: '/api/leads/{id}' },
                  { method: 'GET', endpoint: '/api/customers' },
                  { method: 'POST', endpoint: '/api/customers/import/confirm' },
                  { method: 'GET/POST', endpoint: '/api/campaigns' },
                  { method: 'GET', endpoint: '/api/reports/kpis' },
                  { method: 'GET', endpoint: '/api/audit' },
                ].map(ep => (
                  <div key={ep.endpoint + ep.method} className="p-3 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <span className="w-16 font-bold text-[#008C83]">{ep.method}</span>
                      <span className="text-slate-800">{ep.endpoint}</span>
                    </div>
                    <span className="text-emerald-700 font-semibold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Mock Active
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: System Audit Trail Log */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="p-3.5 bg-[#f0f9f7] rounded-2xl border border-[#D9E9E8] text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>
              Real-time audit log recording staff logins, campaign dispatches, lead pipeline updates, customer imports, and store profile edits across all 4 branches.
            </span>
            <span className="font-bold text-[#008C83] shrink-0">
              {auditLogs.length} Events Logged
            </span>
          </div>

          {/* Filter Bar */}
          <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search actions, users, or details..."
                value={auditSearch}
                onChange={e => setAuditSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#f8fbfb] border border-slate-200 rounded-xl text-xs outline-none focus:border-[#008C83]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-medium">Branch:</span>
              <select
                value={auditBranchFilter}
                onChange={e => setAuditBranchFilter(e.target.value)}
                className="px-3 py-1.5 bg-[#f8fbfb] border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer"
              >
                <option value="ALL">All Branches</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Audit Log Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-[#f8fbfb] border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">When</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No audit events match the search filter.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map(log => {
                    let actionBadge = 'bg-slate-100 text-slate-700';
                    if (log.action.includes('Campaign')) actionBadge = 'bg-blue-50 text-blue-700 border border-blue-200';
                    else if (log.action.includes('Lead')) actionBadge = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
                    else if (log.action.includes('Import')) actionBadge = 'bg-purple-50 text-purple-700 border border-purple-200';
                    else if (log.action.includes('Sign In')) actionBadge = 'bg-teal-50 text-teal-700 border border-teal-200';

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                          {formatDateTime(log.date)}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{log.user}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-700">
                            {log.branch === 'ALL' ? 'All Branches' : log.branch}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${actionBadge}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-md">{log.detail}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
