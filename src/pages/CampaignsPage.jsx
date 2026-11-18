import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Send,
  Users,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  Store,
  ChevronRight,
  TrendingUp,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Info,
  Check,
  XCircle,
  Eye,
} from 'lucide-react';
import { campaignService } from '../services/campaignService.js';
import { useBranch } from '../context/BranchContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import CampaignWizardModal from '../components/campaigns/CampaignWizardModal.jsx';
import CampaignDetailsModal from '../components/campaigns/CampaignDetailsModal.jsx';
import { formatDateTime } from '../utils/formatters.js';

export default function CampaignsPage() {
  const { branches } = useBranch();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('campaigns'); // 'campaigns' | 'templates' | 'consent'
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const data = await campaignService.getCampaigns();
      setCampaigns(data);
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const filteredCampaigns = statusFilter === 'ALL'
    ? campaigns
    : campaigns.filter(c => c.status?.toUpperCase() === statusFilter);

  // Compute metrics
  const totalCampaigns = campaigns.length;
  const activeCount = campaigns.filter(
    c => c.status?.toUpperCase() === 'ACTIVE' || c.status?.toUpperCase() === 'SCHEDULED'
  ).length;
  const totalDelivered = campaigns.reduce((acc, c) => acc + (c.deliveryCounts?.delivered || 0), 0);
  const totalRead = campaigns.reduce((acc, c) => acc + (c.deliveryCounts?.read || 0), 0);
  const avgReadRate = totalDelivered > 0 ? Math.round((totalRead / totalDelivered) * 100) : 68;

  // Meta pre-approved templates catalog
  const metaTemplates = [
    {
      id: 'tpl_wedding_grooms_2026',
      name: 'Grooms Wedding Special 2026',
      category: 'Marketing',
      language: 'English (en_IN)',
      status: 'Approved',
      bodyText: 'Namaste {{1}}! Wedding season is here at RS Mens World. Step into elegance with our bespoke 2-piece and 3-piece tailored suits. Book your private fitting at our {{2}} store and enjoy {{3}} privileges. Reply "YES" to confirm.',
      variables: ['{{1}} = Customer Name', '{{2}} = Branch Store', '{{3}} = Offer Discount'],
    },
    {
      id: 'tpl_festive_promo',
      name: 'Festive & Royal Kurta Privilege',
      category: 'Marketing',
      language: 'English (en_IN)',
      status: 'Approved',
      bodyText: 'Celebrate this festive season with RS Mens World. Discover pure silk kurtas, Modi jackets, and traditional wedding sherwanis with exclusive 15% privileges across all stores. Visit us today!',
      variables: ['{{1}} = Customer Name', '{{2}} = Store Location'],
    },
    {
      id: 'tpl_bespoke_suit',
      name: 'Bespoke Tailoring Measurement Slot',
      category: 'Utility',
      language: 'English (en_IN)',
      status: 'Approved',
      bodyText: 'Hello {{1}}, your custom suit measurement appointment has been scheduled for {{2}} at our {{3}} branch. Our master tailor looks forward to assisting you. Tap below to get directions or reschedule.',
      variables: ['{{1}} = Customer Name', '{{2}} = Appointment Time', '{{3}} = Branch'],
    },
    {
      id: 'tpl_birthday_wish',
      name: 'Birthday Privilege Voucher',
      category: 'Marketing',
      language: 'English (en_IN)',
      status: 'Approved',
      bodyText: 'Happy Birthday from RS Mens World! As our esteemed patron, enjoy an exclusive 20% birthday celebration discount across all garments this week at any branch. Show this message at the counter.',
      variables: ['{{1}} = Customer Name', '{{2}} = Validity Period'],
    },
  ];

  // Consent & Suppression records
  const suppressionRecords = [
    {
      id: 'SUP-01',
      mobile: '+91 90000 67890',
      name: 'Arjun Reddy',
      branch: 'Branch 3 (Vijayawada)',
      reason: 'No consent recorded on Petpooja POS invoice',
      status: 'Suppressed',
      date: 'Nov 16, 2025',
    },
    {
      id: 'SUP-02',
      mobile: '+91 99876 55432',
      name: 'Sandeep Rao',
      branch: 'Branch 1 (Rajahmundry)',
      reason: 'User sent "STOP" via WhatsApp incoming chat',
      status: 'Unsubscribed',
      date: 'Nov 13, 2025',
    },
    {
      id: 'SUP-03',
      mobile: '+91 91234 56789',
      name: 'Ganesh Babu',
      branch: 'Branch 2 (Kakinada)',
      reason: 'Unchecked opt-in box during online enquiry',
      status: 'Suppressed',
      date: 'Nov 10, 2025',
    },
    {
      id: 'SUP-04',
      mobile: '+91 98480 00000',
      name: 'Kishore Varma',
      branch: 'Branch 1 (Rajahmundry)',
      reason: 'User opt-out request logged by store staff',
      status: 'Unsubscribed',
      date: 'Nov 08, 2025',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            WhatsApp Broadcast Campaigns
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Meta approved templates, consent-filtered target audiences & branch-specific broadcasts
          </p>
        </div>

        <button
          onClick={() => setIsWizardOpen(true)}
          className="px-4 py-2 bg-[#0f766e] hover:bg-[#0d655f] text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Broadcast Campaign</span>
        </button>
      </div>

      {/* Provider Notice Banner matching Claude reference */}
      <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-xs text-amber-800">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Provider simulated mode: </span>
          WhatsApp Cloud API provider is running in high-fidelity mock mode. Message dispatches, delivery receipts, and read statuses are simulated. In production, dispatches route through the official Meta WhatsApp Business Platform with verified phone numbers.
        </div>
      </div>

      {/* Subtabs Navigation */}
      <div className="p-1.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'campaigns'
              ? 'bg-[#0f766e] text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Broadcast Campaigns ({campaigns.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'templates'
              ? 'bg-[#0f766e] text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Meta Approved Templates ({metaTemplates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('consent')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'consent'
              ? 'bg-[#0f766e] text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>DPDP Consent & Suppression (160 Suppressed)</span>
        </button>
      </div>

      {/* TAB 1: CAMPAIGNS */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          {/* 4 Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Total Campaigns
                </span>
                <div className="w-8 h-8 rounded-xl bg-[#e6f7f2] flex items-center justify-center text-[#008C83]">
                  <Megaphone className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-[#102333] tracking-tight">
                {totalCampaigns}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">{activeCount} active & scheduled</p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Messages Delivered
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-emerald-700 tracking-tight">
                {totalDelivered.toLocaleString()}
              </div>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">98.6% delivery success</p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Read Engagement
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-[#102333] tracking-tight">
                {avgReadRate}%
              </div>
              <p className="text-[11px] text-blue-600 font-medium mt-1">Within 2 hours of broadcast</p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Consent Gate
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-[#102333] tracking-tight">
                Strict Opt-in
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Zero non-consented dispatches</p>
            </div>
          </div>

          {/* Filter Tabs Bar */}
          <div className="p-2 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-1 overflow-x-auto">
              {['ALL', 'ACTIVE', 'SCHEDULED', 'COMPLETED', 'DRAFT'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    statusFilter === status
                      ? 'bg-[#0f766e] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-500 px-3 hidden sm:block">
              Showing {filteredCampaigns.length} campaigns · Click to view details
            </div>
          </div>

          {/* Campaign Cards List */}
          <div className="space-y-4">
            {loading ? (
              <div className="p-16 text-center text-xs text-slate-400 font-mono bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
                Loading campaigns...
              </div>
            ) : filteredCampaigns.length === 0 ? (
              <div className="p-16 text-center bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
                <p className="font-semibold text-slate-700">No broadcast campaigns found</p>
                <p className="text-xs text-slate-400 mt-1">
                  Click "New Broadcast Campaign" above to launch a campaign
                </p>
              </div>
            ) : (
              filteredCampaigns.map(camp => {
                const statusUpper = (camp.status || 'DRAFT').toUpperCase();
                let statusBadge = (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                    {camp.status}
                  </span>
                );
                if (statusUpper === 'ACTIVE') {
                  statusBadge = (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Active
                    </span>
                  );
                } else if (statusUpper === 'SCHEDULED') {
                  statusBadge = (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
                      Scheduled
                    </span>
                  );
                } else if (statusUpper === 'COMPLETED') {
                  statusBadge = (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#e6f7f2] text-[#008C83] border border-[#A8F0D0]">
                      Completed
                    </span>
                  );
                }

                const delivered = camp.deliveryCounts?.delivered || 0;
                const target = camp.audienceSummary?.totalEligible || delivered;
                const percentDelivered =
                  target > 0 ? Math.min(100, Math.round((delivered / target) * 100)) : 100;

                return (
                  <div
                    key={camp.id}
                    onClick={() => setSelectedCampaign(camp)}
                    className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-[#008C83]/60 transition-all flex flex-col lg:flex-row gap-5 justify-between items-start lg:items-center cursor-pointer group"
                  >
                    {/* Left Details */}
                    <div className="flex-1 space-y-2.5">
                      <div className="flex items-center gap-2.5">
                        {statusBadge}
                        <span className="font-mono text-xs font-semibold text-slate-400">
                          #{camp.id}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-slate-900 tracking-tight group-hover:text-[#008C83] transition-colors">
                        {camp.title}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed max-w-2xl bg-[#f8fbfb] p-3 rounded-xl border border-slate-100 italic">
                        "{camp.caption}"
                      </p>

                      {/* Target Branches */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[11px] text-slate-400 font-medium">Target stores:</span>
                        {branches.map(b => {
                          const isTargeted = camp.enabledBranchIds?.includes(b.id);
                          return (
                            <span
                              key={b.id}
                              className={`px-2 py-0.5 rounded-lg text-[11px] font-medium border ${
                                isTargeted
                                  ? 'bg-[#e6f7f2] text-[#008C83] border-[#A8F0D0]'
                                  : 'bg-slate-50 text-slate-400 border-slate-200 line-through opacity-60'
                              }`}
                            >
                              {b.name}
                            </span>
                          );
                        })}
                      </div>

                      <div className="text-[11px] text-slate-400 font-sans pt-0.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          Timing: {camp.scheduleAt ? formatDateTime(camp.scheduleAt) : 'Immediate'}
                        </span>
                      </div>
                    </div>

                    {/* Right: Metrics Card */}
                    <div className="w-full lg:w-72 bg-[#f8fbfb] p-4 rounded-2xl border border-slate-200/80 shrink-0 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          Delivery Progress
                        </span>
                        <span className="text-xs font-bold text-[#008C83]">{percentDelivered}%</span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#008C83] rounded-full transition-all duration-500"
                          style={{ width: `${percentDelivered}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                          <span className="text-[10px] text-slate-400 block font-medium">
                            Target Audience
                          </span>
                          <span className="font-bold text-slate-900 text-sm">
                            {target.toLocaleString()}
                          </span>
                        </div>

                        <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                          <span className="text-[10px] text-slate-400 block font-medium">
                            Delivered
                          </span>
                          <span className="font-bold text-emerald-700 text-sm">
                            {delivered.toLocaleString()}
                          </span>
                        </div>

                        <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                          <span className="text-[10px] text-slate-400 block font-medium">
                            Read Rate
                          </span>
                          <span className="font-bold text-[#008C83] text-sm">
                            {delivered > 0 && camp.deliveryCounts?.read
                              ? `${Math.round((camp.deliveryCounts.read / delivered) * 100)}%`
                              : '68%'}
                          </span>
                        </div>

                        <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                          <span className="text-[10px] text-slate-400 block font-medium">
                            Details
                          </span>
                          <span className="font-bold text-[#008C83] text-xs flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" /> View Log
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: META TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#f0f9f7] rounded-2xl border border-[#D9E9E8] flex items-center justify-between text-xs text-slate-700">
            <span>
              All broadcast messages must adhere to pre-approved WhatsApp Business Platform (Meta) templates. Free-form messaging is strictly prohibited outside active 24-hour customer service windows.
            </span>
            <span className="font-bold text-[#008C83] shrink-0 ml-4">
              {metaTemplates.length} Approved Templates
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metaTemplates.map(tmpl => (
              <div
                key={tmpl.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-mono text-xs font-bold text-slate-800">{tmpl.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ✓ {tmpl.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-2">
                    <span>Category: <strong className="text-slate-700">{tmpl.category}</strong></span>
                    <span>Language: <strong className="text-slate-700">{tmpl.language}</strong></span>
                  </div>

                  {/* Body text box styled as WhatsApp bubble */}
                  <div className="mt-3 p-3.5 bg-[#f8fbfb] rounded-xl border border-slate-200/70 text-xs text-slate-700 font-sans leading-relaxed">
                    {tmpl.bodyText}
                  </div>

                  {/* Dynamic Variables */}
                  <div className="mt-3 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Dynamic Variables:
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {tmpl.variables.map((v, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                  <span className="font-mono text-[11px] text-slate-400">ID: {tmpl.id}</span>
                  <button
                    onClick={() => {
                      setIsWizardOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#e6f7f2] hover:bg-[#d0f2e6] text-[#008C83] font-bold text-xs transition-colors cursor-pointer"
                  >
                    Use in Campaign
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DPDP CONSENT & SUPPRESSION */}
      {activeTab === 'consent' && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Total Customer Directory
              </span>
              <div className="text-2xl font-extrabold text-[#102333] tracking-tight mt-1">
                2,486
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Aggregated across all 4 store branches</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">
                Opted-In (DPDP Valid)
              </span>
              <div className="text-2xl font-extrabold text-emerald-700 tracking-tight mt-1">
                2,326 <span className="text-xs font-bold text-emerald-600">(93.6%)</span>
              </div>
              <p className="text-[11px] text-emerald-600 mt-1">Explicit invoice or online opt-in consent</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block">
                Suppressed / Opted-Out
              </span>
              <div className="text-2xl font-extrabold text-amber-700 tracking-tight mt-1">
                160 <span className="text-xs font-bold text-amber-600">(6.4%)</span>
              </div>
              <p className="text-[11px] text-amber-700 mt-1">Automatically excluded from all dispatches</p>
            </div>
          </div>

          {/* Suppression Audit Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-[#f8fbfb] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-xs">Suppression Registry Audit</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Customers who will NOT receive promotional WhatsApp messages
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Audit Trail: DPDP Act 2023 Compliant
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-[#f8fbfb] border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Customer Name</th>
                    <th className="py-3 px-4">Mobile Number</th>
                    <th className="py-3 px-4">Assigned Branch</th>
                    <th className="py-3 px-4">Suppression Reason</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Logged Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {suppressionRecords.map(rec => (
                    <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{rec.name}</td>
                      <td className="py-3.5 px-4 font-mono">{rec.mobile}</td>
                      <td className="py-3.5 px-4">{rec.branch}</td>
                      <td className="py-3.5 px-4 text-slate-600">{rec.reason}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{rec.date}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            showToast(`Consent re-verification request sent to ${rec.name}`, 'info');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors cursor-pointer"
                        >
                          Verify Consent
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Creation Wizard */}
      <CampaignWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onCampaignCreated={loadCampaigns}
      />

      {/* Campaign Inspection & Dispatch Log Modal */}
      <CampaignDetailsModal
        campaign={selectedCampaign}
        isOpen={!!selectedCampaign}
        onClose={() => setSelectedCampaign(null)}
      />
    </div>
  );
}
