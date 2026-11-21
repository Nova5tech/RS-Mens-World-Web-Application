import React, { useState, useEffect } from 'react';
import {
  Download,
  Search,
  Megaphone,
  Users,
  Target,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import {
  getCampaignsReport,
  getCustomersReport,
  getLeadsReport,
  getChatReport,
  downloadCSV,
  ReportFilter,
} from '@/services/reports';
import { Button } from '@/components/ui/Button';

export const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const isBranchUser = user?.role === 'branch_user';

  const [activeTab, setActiveTab] = useState<'campaign' | 'customer' | 'lead' | 'chat'>('campaign');
  const [branchFilter, setBranchFilter] = useState(
    isBranchUser ? user?.branch_id || 'branch_1' : 'all'
  );
  const [dateRange, setDateRange] = useState('this_month');
  const [search, setSearch] = useState('');
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    loadReport();
  }, [activeTab, branchFilter, dateRange]);

  const loadReport = async () => {
    const filter: ReportFilter = {
      branchId: branchFilter,
      dateRange,
    };

    try {
      if (activeTab === 'campaign') {
        const rows = await getCampaignsReport(filter);
        setData(rows);
      } else if (activeTab === 'customer') {
        const rows = await getCustomersReport(filter);
        setData(rows);
      } else if (activeTab === 'lead') {
        const rows = await getLeadsReport(filter);
        setData(rows);
      } else if (activeTab === 'chat') {
        const rows = await getChatReport(filter);
        setData(rows);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportCSV = () => {
    const timestamp = new Date().toISOString().slice(0, 10);

    if (activeTab === 'campaign') {
      const headers = [
        'Campaign ID',
        'Campaign Name',
        'Status',
        'Template',
        'Targeted',
        'Sent',
        'Delivered',
        'Read',
        'Failed',
        'Delivery Rate',
        'Created Date',
      ];
      const rows = data.map((d) => [
        d.id,
        d.name,
        d.status,
        d.template,
        d.targeted,
        d.sent,
        d.delivered,
        d.read,
        d.failed,
        d.deliveryRate,
        d.createdAt,
      ]);
      downloadCSV(`campaigns_report_${timestamp}.csv`, headers, rows);
    } else if (activeTab === 'customer') {
      const headers = [
        'Customer Code',
        'Customer Name',
        'Phone',
        'Branch',
        'Customer Type',
        'Status',
        'Marketing Consent',
        'Total Purchases',
        'Order Count',
        'Last Interaction',
      ];
      const rows = data.map((d) => [
        d.code,
        d.name,
        d.phone,
        d.branch,
        d.type,
        d.status,
        d.consent,
        d.totalPurchases,
        d.orderCount,
        d.lastInteraction,
      ]);
      downloadCSV(`customers_report_${timestamp}.csv`, headers, rows);
    } else if (activeTab === 'lead') {
      const headers = [
        'Lead ID',
        'Customer Name',
        'Phone',
        'Branch',
        'Stage',
        'Priority',
        'Source',
        'Follow-up Date',
        'Enquiry Description',
        'Created Date',
      ];
      const rows = data.map((d) => [
        d.id,
        d.name,
        d.phone,
        d.branch,
        d.stage,
        d.priority,
        d.source,
        d.followUp,
        d.enquiry,
        d.createdAt,
      ]);
      downloadCSV(`leads_report_${timestamp}.csv`, headers, rows);
    } else if (activeTab === 'chat') {
      const headers = [
        'Conversation ID',
        'Customer Name',
        'Phone',
        'Channel',
        'Branch',
        'Status',
        'AI Handover / Human Mode',
        'Last Message',
        'Updated Date',
      ];
      const rows = data.map((d) => [
        d.id,
        d.name,
        d.phone,
        d.channel,
        d.branch,
        d.status,
        d.aiPaused,
        d.lastMessage,
        d.updatedAt,
      ]);
      downloadCSV(`chat_report_${timestamp}.csv`, headers, rows);
    }
  };

  const filteredData = data.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return Object.values(item).some((v) => String(v).toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Reports & Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Exportable operational metrics across campaigns, customers, leads, and customer chat
          </p>
        </div>

        {/* Global Export Button */}
        <Button
          variant="primary"
          size="sm"
          onClick={handleExportCSV}
          className="bg-[#0F4C3A] hover:bg-[#0B3B2E] text-white rounded-xl shadow-xs h-9 px-4 text-xs font-semibold"
        >
          <Download className="w-4 h-4 mr-1.5" />
          Export CSV (Excel UTF-8)
        </Button>
      </div>

      {/* Tabs Row */}
      <div className="flex p-1 bg-gray-100 rounded-2xl border border-gray-200/80 max-w-lg">
        {[
          { id: 'campaign', label: 'Campaign Report', icon: Megaphone },
          { id: 'customer', label: 'Customer Report', icon: Users },
          { id: 'lead', label: 'Lead Report', icon: Target },
          { id: 'chat', label: 'Chat Report', icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                isActive
                  ? 'bg-white text-[#0F4C3A] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search in report table..."
              className="w-full h-9 pl-9 pr-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0F4C3A]"
            />
          </div>

          {/* Branch filter */}
          <select
            value={isBranchUser ? (user?.branch_id || 'branch_1') : branchFilter}
            disabled={isBranchUser}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="h-9 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0F4C3A] disabled:opacity-60"
          >
            <option value="all">All Branches</option>
            <option value="branch_1">Branch 1 (Rajahmundry)</option>
            <option value="branch_2">Branch 2 (Kakinada)</option>
            <option value="branch_3">Branch 3 (Vijayawada)</option>
            <option value="branch_4">Branch 4 (Guntur)</option>
          </select>

          {/* Date range filter */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="h-9 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0F4C3A]"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="this_month">This Month</option>
            <option value="all">All Time</option>
          </select>
        </div>

        <div className="text-xs text-gray-500 font-medium">
          Showing <span className="font-bold text-gray-900">{filteredData.length}</span> records
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === 'campaign' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Campaign Name</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Template</th>
                  <th className="py-3 px-4">Targeted</th>
                  <th className="py-3 px-4">Sent</th>
                  <th className="py-3 px-4">Delivered</th>
                  <th className="py-3 px-4">Read</th>
                  <th className="py-3 px-4">Delivery Rate</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/50">
                    <td className="py-3.5 px-4 font-bold text-gray-900">{row.name}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">{row.template}</td>
                    <td className="py-3.5 px-4 text-gray-700">{row.targeted}</td>
                    <td className="py-3.5 px-4 text-gray-700">{row.sent}</td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-700">{row.delivered}</td>
                    <td className="py-3.5 px-4 text-gray-700">{row.read}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-800">{row.deliveryRate}</td>
                    <td className="py-3.5 px-4 text-gray-500">{row.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'customer' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">WhatsApp Consent</th>
                  <th className="py-3 px-4">Total Purchases</th>
                  <th className="py-3 px-4">Orders</th>
                  <th className="py-3 px-4">Last Visit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="py-3.5 px-4 font-mono font-semibold text-gray-700">{row.code}</td>
                    <td className="py-3.5 px-4 font-bold text-gray-900">{row.name}</td>
                    <td className="py-3.5 px-4 font-mono text-gray-600">{row.phone}</td>
                    <td className="py-3.5 px-4 text-gray-700">{row.branch}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700">
                        {row.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          row.consent === 'Opted In'
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-rose-50 text-rose-800'
                        }`}
                      >
                        {row.consent}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-900">{row.totalPurchases}</td>
                    <td className="py-3.5 px-4 text-gray-700">{row.orderCount}</td>
                    <td className="py-3.5 px-4 text-gray-500">{row.lastInteraction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'lead' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Lead ID</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Follow-up</th>
                  <th className="py-3 px-4">Enquiry</th>
                  <th className="py-3 px-4">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/50">
                    <td className="py-3.5 px-4 font-mono font-semibold text-gray-700">{row.id}</td>
                    <td className="py-3.5 px-4 font-bold text-gray-900">{row.name}</td>
                    <td className="py-3.5 px-4 font-mono text-gray-600">{row.phone}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800">
                        {row.stage}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 capitalize font-medium text-gray-700">{row.priority}</td>
                    <td className="py-3.5 px-4 capitalize text-gray-600">{row.source}</td>
                    <td className="py-3.5 px-4 text-gray-700">{row.followUp}</td>
                    <td className="py-3.5 px-4 text-gray-600 max-w-xs truncate">{row.enquiry}</td>
                    <td className="py-3.5 px-4 text-gray-500">{row.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'chat' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Human Handover Mode</th>
                  <th className="py-3 px-4">Last Message</th>
                  <th className="py-3 px-4">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/50">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900">{row.name}</div>
                      <div className="font-mono text-gray-500">{row.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 capitalize text-gray-700">{row.channel}</td>
                    <td className="py-3.5 px-4 text-gray-700">{row.branch}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800">
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-700">{row.aiPaused}</td>
                    <td className="py-3.5 px-4 text-gray-600 max-w-xs truncate">{row.lastMessage}</td>
                    <td className="py-3.5 px-4 text-gray-500">{row.updatedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
