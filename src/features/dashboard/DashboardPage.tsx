import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  CheckCircle,
  Megaphone,
  CheckCheck,
  Eye,
  Target,
  TrendingUp,
  MessageSquare,
  AlertCircle,
  Clock,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useAuth } from '@/features/auth/useAuth';
import { getDashboardData } from '@/services/dashboard';
import { Link, useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'super_admin';
  const isBranchUser = user?.role === 'branch_user';
  const navigate = useNavigate();

  const [branchFilter, setBranchFilter] = useState(
    isBranchUser ? user?.branch_id || 'branch_1' : 'all'
  );
  const [dateRange, setDateRange] = useState('this_month');
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [branchFilter, dateRange]);

  const loadData = async () => {
    try {
      const res = await getDashboardData(branchFilter, dateRange);
      setData(res);
    } catch (e) {
      console.error(e);
    }
  };

  if (!data) return null;

  const { summary, charts, lists, branchComparison } = data;

  const kpis = [
    {
      label: 'Total Customers',
      value: summary.total_customers.toLocaleString(),
      change: '+12%',
      isPositive: true,
      icon: Users,
      caption: 'vs last month',
      color: 'bg-emerald-50 text-emerald-800',
    },
    {
      label: 'New Customers',
      value: summary.new_customers.toLocaleString(),
      change: '+8%',
      isPositive: true,
      icon: UserPlus,
      caption: 'this period',
      color: 'bg-teal-50 text-teal-800',
    },
    {
      label: 'Opted-in %',
      value: `${summary.opted_in_pct}%`,
      change: '+3%',
      isPositive: true,
      icon: CheckCircle,
      caption: 'WhatsApp marketing',
      color: 'bg-sky-50 text-sky-800',
    },
    {
      label: 'Campaigns Sent',
      value: summary.campaigns_sent.toLocaleString(),
      change: '+2',
      isPositive: true,
      icon: Megaphone,
      caption: 'broadcasts executed',
      color: 'bg-indigo-50 text-indigo-800',
    },
    {
      label: 'Delivered %',
      value: `${summary.messages_delivered_pct}%`,
      change: '+1.5%',
      isPositive: true,
      icon: CheckCheck,
      caption: 'delivery success',
      color: 'bg-green-50 text-green-800',
    },
    {
      label: 'Read %',
      value: `${summary.messages_read_pct}%`,
      change: '+4%',
      isPositive: true,
      icon: Eye,
      caption: 'open engagement',
      color: 'bg-amber-50 text-amber-800',
    },
    {
      label: 'New Leads',
      value: summary.new_leads.toLocaleString(),
      change: '+18%',
      isPositive: true,
      icon: Target,
      caption: 'pipeline enquiries',
      color: 'bg-cyan-50 text-cyan-800',
    },
    {
      label: 'Conversion %',
      value: `${summary.lead_conversion_pct}%`,
      change: '+5%',
      isPositive: true,
      icon: TrendingUp,
      caption: 'lead to customer',
      color: 'bg-emerald-50 text-emerald-800',
    },
    {
      label: 'Open Chats',
      value: summary.open_chats.toLocaleString(),
      change: '-2',
      isPositive: false,
      icon: MessageSquare,
      caption: 'active conversations',
      color: 'bg-blue-50 text-blue-800',
    },
    {
      label: 'Pending Handovers',
      value: summary.pending_handovers.toLocaleString(),
      change: 'Urgent',
      isPositive: false,
      icon: AlertCircle,
      caption: 'awaiting staff reply',
      color: 'bg-rose-50 text-rose-800',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Operations & Engagement Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Real-time retail performance, marketing funnel, and customer interaction insights
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Store Branch Filter (locked for branch user) */}
          <div className="relative">
            <select
              value={isBranchUser ? (user?.branch_id || 'branch_1') : branchFilter}
              disabled={isBranchUser}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="h-9 px-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0F4C3A] shadow-2xs disabled:opacity-60"
            >
              <option value="all">All Branches</option>
              <option value="branch_1">Branch 1 (Rajahmundry)</option>
              <option value="branch_2">Branch 2 (Kakinada)</option>
              <option value="branch_3">Branch 3 (Vijayawada)</option>
              <option value="branch_4">Branch 4 (Guntur)</option>
            </select>
          </div>

          {/* Date Range Selector */}
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="h-9 px-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0F4C3A] shadow-2xs"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="7days">This Week</option>
              <option value="this_month">This Month</option>
              <option value="custom">All Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* 10 KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs hover:shadow-md transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider truncate">
                  {kpi.label}
                </span>
                <div className={`p-2 rounded-xl ${kpi.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <span className="text-2xl font-bold text-gray-900 tracking-tight">
                  {kpi.value}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    kpi.isPositive
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                      : 'bg-rose-50 text-rose-800 border border-rose-200/60'
                  }`}
                >
                  {kpi.change}
                </span>
              </div>

              <p className="text-[11px] text-gray-400 truncate">{kpi.caption}</p>
            </div>
          );
        })}
      </div>

      {/* Row 1: Charts (Messages Trend & Leads by Stage) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages Trend (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">
                WhatsApp Delivery & Read Funnel Over Time
              </h3>
              <p className="text-xs text-gray-500">Daily messages sent, delivered, and read</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.messagesTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="sent"
                  name="Sent"
                  stroke="#0B3B2E"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="delivered"
                  name="Delivered"
                  stroke="#0F4C3A"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="read"
                  name="Read"
                  stroke="#46D68C"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leads by Stage (1 col) */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Leads by Stage</h3>
              <p className="text-xs text-gray-500">Pipeline distribution</p>
            </div>
            <Link to="/leads" className="text-xs font-semibold text-[#0F4C3A] hover:underline">
              View Kanban
            </Link>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.leadsByStage}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="stage" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {charts.leadsByStage.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Charts (Leads by Source Donut & Chat Volume Area) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leads by Source (1 col) */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
          <h3 className="font-bold text-gray-900 text-sm mb-1">Leads by Acquisition Source</h3>
          <p className="text-xs text-gray-500 mb-4">Channel origin share</p>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.leadsBySource}
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {charts.leadsBySource.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-gray-100">
            {charts.leadsBySource.map((s: any) => (
              <div key={s.name} className="flex items-center gap-1.5 text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.fill }} />
                <span className="truncate">{s.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Volume by Day (AreaChart - 1 col) */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
          <h3 className="font-bold text-gray-900 text-sm mb-1">AI Assistant Conversation Volume</h3>
          <p className="text-xs text-gray-500 mb-4">Daily interactions handled</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.chatVolumeByDay}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  name="Conversations"
                  stroke="#0F4C3A"
                  fill="#E6F7EF"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customers by Branch (Admin only BarChart - 1 col) */}
        {isAdmin && (
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
            <h3 className="font-bold text-gray-900 text-sm mb-1">Customers by Branch</h3>
            <p className="text-xs text-gray-500 mb-4">Retail database distribution</p>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.customersByBranch}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="branch" tick={{ fontSize: 10, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="customers" radius={[6, 6, 0, 0]}>
                    {charts.customersByBranch.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Row 3: Admin Branch Comparison Table (When All Branches selected) */}
      {isAdmin && branchFilter === 'all' && (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Branch Performance Comparison</h3>
              <p className="text-xs text-gray-500">Cross-branch retail and conversion metrics</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Store Branch</th>
                  <th className="py-3 px-4">Customers</th>
                  <th className="py-3 px-4">Leads</th>
                  <th className="py-3 px-4">Conversions</th>
                  <th className="py-3 px-4">Campaigns</th>
                  <th className="py-3 px-4">Delivery Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {branchComparison.map((b: any) => (
                  <tr key={b.branch_id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-bold text-gray-900">{b.branch_name}</td>
                    <td className="py-3 px-4 font-medium text-gray-700">{b.customers}</td>
                    <td className="py-3 px-4 font-medium text-gray-700">{b.leads}</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">{b.conversions}</td>
                    <td className="py-3 px-4 text-gray-600">{b.campaigns}</td>
                    <td className="py-3 px-4 font-semibold text-emerald-800">
                      {b.delivered_pct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Row 4: Action Lists (Follow-ups Due Today, Recent Campaigns, Recent Conversations) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Follow-ups Due Today */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              Follow-ups Due Today
            </h4>
            <Link to="/leads" className="text-xs font-semibold text-[#0F4C3A] hover:underline">
              View All
            </Link>
          </div>
          {lists.followUpsDueToday.length === 0 ? (
            <div className="text-xs text-gray-400 py-6 text-center">
              No follow-ups scheduled for today
            </div>
          ) : (
            <div className="space-y-2">
              {lists.followUpsDueToday.map((lead: any) => (
                <div
                  key={lead.id}
                  onClick={() => navigate('/leads')}
                  className="p-2.5 rounded-xl border border-gray-100 hover:border-gray-200 bg-gray-50/50 hover:bg-white cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-bold text-gray-900 truncate">
                      {lead.customer_name}
                    </div>
                    <div className="text-[11px] text-gray-500 truncate">{lead.enquiry}</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                    Today
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Campaigns */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
              <Megaphone className="w-4 h-4 text-[#0F4C3A]" />
              Recent Campaigns
            </h4>
            <Link to="/campaigns" className="text-xs font-semibold text-[#0F4C3A] hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-2">
            {lists.recentCampaigns.map((camp: any) => (
              <div
                key={camp.id}
                onClick={() => navigate('/campaigns')}
                className="p-2.5 rounded-xl border border-gray-100 hover:border-gray-200 bg-gray-50/50 hover:bg-white cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="min-w-0 pr-2">
                  <div className="text-xs font-bold text-gray-900 truncate">{camp.name}</div>
                  <div className="text-[11px] text-gray-500">
                    {camp.stats?.sent || 0} messages • {camp.stats?.delivered_pct || 96}% delivered
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                  {camp.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Conversations */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              Recent Conversations
            </h4>
            <Link to="/chatbot" className="text-xs font-semibold text-[#0F4C3A] hover:underline">
              Open Inbox
            </Link>
          </div>
          <div className="space-y-2">
            {lists.recentConversations.map((conv: any) => (
              <div
                key={conv.id}
                onClick={() => navigate('/chatbot')}
                className="p-2.5 rounded-xl border border-gray-100 hover:border-gray-200 bg-gray-50/50 hover:bg-white cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="min-w-0 pr-2">
                  <div className="text-xs font-bold text-gray-900 truncate">
                    {conv.customer_name}
                  </div>
                  <div className="text-[11px] text-gray-500 truncate">{conv.last_message}</div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700 shrink-0 capitalize">
                  {conv.channel}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
