import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  ArrowLeft,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { auditService, AuditLogFilter } from '@/services/audit';
import { AuditLog } from '@/types/models';
import { downloadCSV } from '@/services/reports';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';

export const AuditLogPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isBranchUser = user?.role === 'branch_user';

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState(
    isBranchUser ? user?.branch_id || 'branch_1' : 'all'
  );
  const [actionFilter, setActionFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');

  useEffect(() => {
    loadLogs();
  }, [branchFilter, actionFilter, entityFilter, search]);

  const loadLogs = async () => {
    const filter: AuditLogFilter = {
      branchId: branchFilter,
      action: actionFilter,
      entity: entityFilter,
      search,
    };
    const res = await auditService.getLogs(filter);
    setLogs(res);
  };

  const handleExportCSV = () => {
    const timestamp = new Date().toISOString().slice(0, 10);
    const headers = [
      'Log ID',
      'Timestamp',
      'User Name',
      'Role',
      'Branch',
      'Action',
      'Entity',
      'Entity ID',
      'Details',
    ];
    const rows = logs.map((l) => [
      l.id,
      new Date(l.created_at).toLocaleString(),
      l.user_name,
      l.user_role,
      l.branch_name || l.branch_id || 'All',
      l.action,
      l.entity,
      l.entity_id || '—',
      l.details,
    ]);

    downloadCSV(`audit_log_${timestamp}.csv`, headers, rows);
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'login':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'campaign_send':
      case 'campaign_schedule':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'lead_stage_change':
      case 'lead_convert':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'import':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'user_create':
      case 'user_deactivate':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header & Back Link */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
            title="Back to Settings"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              System Audit Log
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Immutable security record of logins, campaigns, Petpooja imports, leads, and configuration changes
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl h-10 px-4 text-xs font-semibold shadow-2xs"
        >
          <Download className="w-4 h-4 mr-1.5 text-gray-500" />
          Export Audit Trail (CSV)
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user, action, details..."
              className="w-full h-10 pl-9 pr-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0F4C3A]"
            />
          </div>

          {/* Branch Filter */}
          <select
            value={isBranchUser ? (user?.branch_id || 'branch_1') : branchFilter}
            disabled={isBranchUser}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0F4C3A] disabled:opacity-60"
          >
            <option value="all">All Branches</option>
            <option value="branch_1">Branch 1 (Rajahmundry)</option>
            <option value="branch_2">Branch 2 (Kakinada)</option>
            <option value="branch_3">Branch 3 (Vijayawada)</option>
            <option value="branch_4">Branch 4 (Guntur)</option>
          </select>

          {/* Action Filter */}
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0F4C3A]"
          >
            <option value="all">All Actions</option>
            <option value="login">User Login</option>
            <option value="campaign_send">Campaign Send</option>
            <option value="lead_stage_change">Lead Stage Change</option>
            <option value="lead_convert">Lead Converted</option>
            <option value="import">Petpooja Import</option>
            <option value="kb_edit">Knowledge Base Edit</option>
            <option value="user_create">User Created</option>
            <option value="settings_update">Settings Updated</option>
          </select>

          {/* Entity Filter */}
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0F4C3A]"
          >
            <option value="all">All Modules</option>
            <option value="auth">Authentication</option>
            <option value="campaigns">Campaigns</option>
            <option value="leads">Leads CRM</option>
            <option value="customers">Customer DB</option>
            <option value="kb">AI Knowledge Base</option>
            <option value="users">Users & Branches</option>
            <option value="settings">Settings</option>
          </select>
        </div>

        <div className="text-xs text-gray-500 font-medium">
          Showing <span className="font-bold text-gray-900">{logs.length}</span> audit events
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">Event ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    No audit records match the selected filters
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50">
                    <td className="py-3.5 px-4 font-mono font-semibold text-gray-700">
                      {log.id}
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        {log.user_name}
                      </div>
                      <div className="text-[10px] text-gray-500 capitalize">{log.user_role}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-700">
                      {log.branch_name || log.branch_id}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getActionBadge(
                          log.action
                        )}`}
                      >
                        {log.action.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-700 max-w-md">
                      <div>{log.details}</div>
                      {log.entity_id && (
                        <div className="text-[10px] font-mono text-gray-400 mt-0.5">
                          ID: {log.entity_id}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
