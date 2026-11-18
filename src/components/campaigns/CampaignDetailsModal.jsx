import React from 'react';
import {
  X,
  Megaphone,
  CheckCircle2,
  Clock,
  Store,
  Users,
  Eye,
  AlertCircle,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatters.js';
import { useBranch } from '../../context/BranchContext.jsx';

export default function CampaignDetailsModal({ campaign, isOpen, onClose }) {
  if (!isOpen || !campaign) return null;

  const { branches } = useBranch();

  const delivered = campaign.deliveryCounts?.delivered || 0;
  const sent = campaign.deliveryCounts?.sent || delivered;
  const read = campaign.deliveryCounts?.read || Math.round(delivered * 0.68);
  const failed = campaign.deliveryCounts?.failed || 0;
  const readRate = delivered > 0 ? Math.round((read / delivered) * 100) : 68;

  const statusUpper = (campaign.status || 'DRAFT').toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#062b24]/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl shadow-float border border-[#D9E9E8] max-w-2xl w-full overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#D9E9E8] bg-[#f8fbfb] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#e6f7f2] flex items-center justify-center text-[#008C83]">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900">{campaign.title}</h3>
                <span className="font-mono text-xs text-slate-400">#{campaign.id}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Template: <span className="font-mono font-medium text-slate-700">{campaign.templateId}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 text-xs">
          {/* Status and KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-[#f8fbfb] rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Target Audience</span>
              <span className="text-lg font-bold text-slate-900">
                {(campaign.audienceSummary?.totalEligible || sent).toLocaleString()}
              </span>
            </div>

            <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <span className="text-[10px] text-emerald-600 block font-semibold uppercase">Delivered</span>
              <span className="text-lg font-bold text-emerald-800">
                {delivered.toLocaleString()}
              </span>
            </div>

            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
              <span className="text-[10px] text-blue-600 block font-semibold uppercase">Read Rate</span>
              <span className="text-lg font-bold text-blue-800">{readRate}%</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Failed / Blocked</span>
              <span className="text-lg font-bold text-slate-600">{failed}</span>
            </div>
          </div>

          {/* WhatsApp Message Preview Bubble */}
          <div>
            <span className="text-xs font-semibold text-slate-700 block mb-2">
              WhatsApp Broadcast Preview
            </span>
            <div className="bg-[#e5ddd5]/40 p-4 rounded-2xl border border-[#d1d7db] max-w-md mx-auto">
              <div className="bg-white rounded-xl p-3 shadow-xs border border-slate-100 text-xs text-slate-800 space-y-2 relative">
                {campaign.imageUrl && (
                  <img
                    src={campaign.imageUrl}
                    alt="Campaign preview"
                    className="w-full h-36 object-cover rounded-lg mb-2"
                  />
                )}
                <p className="leading-relaxed font-sans">{campaign.caption}</p>
                <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 pt-1">
                  <span>10:30 AM</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#008C83]" />
                </div>
              </div>
            </div>
          </div>

          {/* Branch Delivery Matrix */}
          <div>
            <span className="text-xs font-semibold text-slate-700 block mb-2">
              Branch-wise Audience Breakdown
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {branches.map(b => {
                const isEnabled = campaign.enabledBranchIds?.includes(b.id);
                const count = campaign.audienceSummary?.perBranch?.[b.id] || (isEnabled ? 750 : 0);
                return (
                  <div
                    key={b.id}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                      isEnabled
                        ? 'border-[#D9E9E8] bg-[#f8fbfb]'
                        : 'border-slate-100 bg-slate-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Store className={`w-3.5 h-3.5 ${isEnabled ? 'text-[#008C83]' : 'text-slate-400'}`} />
                      <span className="font-semibold text-slate-800">{b.name}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-700">
                      {isEnabled ? `${count.toLocaleString()} recipients` : 'Excluded'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dispatch Log / Audit Trail */}
          <div>
            <span className="text-xs font-semibold text-slate-700 block mb-2">
              Simulated Dispatch Log (Meta Graph API)
            </span>
            <div className="bg-[#f8fbfb] p-3 rounded-xl border border-slate-200/80 space-y-2 text-[11px] font-mono text-slate-600">
              <div className="flex items-center justify-between">
                <span>[INFO] Payload validated against Meta approved template</span>
                <span className="text-emerald-600">OK</span>
              </div>
              <div className="flex items-center justify-between">
                <span>[DPDP] Suppressed 160 non-consented contacts automatically</span>
                <span className="text-emerald-600">PASSED</span>
              </div>
              <div className="flex items-center justify-between">
                <span>[META] Broadcast batch enqueued for delivery</span>
                <span className="text-blue-600">DISPATCHED</span>
              </div>
              <div className="flex items-center justify-between">
                <span>[AUDIT] Created by Super Admin on {formatDateTime(campaign.createdAt)}</span>
                <span className="text-slate-400">LOGGED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f8fbfb] border-t border-[#D9E9E8] flex items-center justify-between">
          <span className="text-xs text-slate-500 font-sans">
            Schedule: {campaign.scheduleAt ? formatDateTime(campaign.scheduleAt) : 'Immediate'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#0f766e] hover:bg-[#0d655f] text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
