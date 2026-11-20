import React, { useState, useEffect } from 'react';
import {
  X,
  SlidersHorizontal,
  FileText,
  Calendar,
  Store,
  Tag,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { CANONICAL_BRANCHES } from '../../config/branchConfig.js';

export default function CampaignFiltersDrawer({
  isOpen,
  onClose,
  filters,
  onApply,
  onReset,
  isBranchUser,
  userBranchName,
  templates = [],
}) {
  if (!isOpen) return null;

  // Local pending filter state inside drawer
  const [localStatus, setLocalStatus] = useState(filters.status || 'ALL');
  const [localType, setLocalType] = useState(filters.type || 'ALL');
  const [localDateRange, setLocalDateRange] = useState(filters.dateRange || 'ALL');
  const [localTemplate, setLocalTemplate] = useState(filters.template || 'ALL');
  const [localBranch, setLocalBranch] = useState(filters.branch || 'ALL');

  useEffect(() => {
    setLocalStatus(filters.status || 'ALL');
    setLocalType(filters.type || 'ALL');
    setLocalDateRange(filters.dateRange || 'ALL');
    setLocalTemplate(filters.template || 'ALL');
    setLocalBranch(filters.branch || 'ALL');
  }, [filters, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleApply = () => {
    onApply({
      status: localStatus,
      type: localType,
      dateRange: localDateRange,
      template: localTemplate,
      branch: isBranchUser ? 'ALL' : localBranch,
    });
    onClose();
  };

  const handleClear = () => {
    setLocalStatus('ALL');
    setLocalType('ALL');
    setLocalDateRange('ALL');
    setLocalTemplate('ALL');
    setLocalBranch('ALL');
    onReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#062b24]/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer / Popover Card */}
      <div className="relative bg-white rounded-3xl shadow-float border border-[#D9E9E8] max-w-lg w-full overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] font-sans">
        {/* Header */}
        <div className="p-5 border-b border-[#D9E9E8] bg-[#f8fbfb] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#e6f7f2] flex items-center justify-center text-[#008C83]">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Filter WhatsApp Campaigns</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Refine campaigns by status, category, date, and store branch
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            aria-label="Close filters"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Controls Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* 1. Campaign Status */}
          <div>
            <label className="text-slate-700 font-semibold block mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#008C83]" />
              <span>Campaign Status</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'ALL', label: 'All Status' },
                { id: 'SENT', label: 'Sent' },
                { id: 'SCHEDULED', label: 'Scheduled' },
                { id: 'DRAFT', label: 'Draft' },
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setLocalStatus(opt.id)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer ${
                    localStatus === opt.id
                      ? 'bg-[#004F4C] text-white shadow-xs'
                      : 'bg-[#f8fbfb] border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Campaign Type */}
          <div>
            <label className="text-slate-700 font-semibold block mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#008C83]" />
              <span>Campaign Type</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'ALL', label: 'All Types' },
                { id: 'Promotional', label: 'Promotional' },
                { id: 'Announcement', label: 'Announcement' },
                { id: 'Loyalty', label: 'Loyalty' },
                { id: 'Event', label: 'Event' },
                { id: 'Engagement', label: 'Engagement' },
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setLocalType(opt.id)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer ${
                    localType === opt.id
                      ? 'bg-[#004F4C] text-white shadow-xs'
                      : 'bg-[#f8fbfb] border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Date Range */}
          <div>
            <label className="text-slate-700 font-semibold block mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#008C83]" />
              <span>Date Range</span>
            </label>
            <select
              value={localDateRange}
              onChange={e => setLocalDateRange(e.target.value)}
              className="w-full p-2.5 bg-[#f8fbfb] border border-slate-200 rounded-xl outline-none text-slate-700 text-xs font-medium cursor-pointer"
            >
              <option value="ALL">All Dates</option>
              <option value="TODAY">Today</option>
              <option value="THIS_WEEK">This Week</option>
              <option value="THIS_MONTH">This Month (November 2025)</option>
              <option value="LAST_30_DAYS">Last 30 Days</option>
            </select>
          </div>

          {/* 4. Message Template */}
          <div>
            <label className="text-slate-700 font-semibold block mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#008C83]" />
              <span>Message Template</span>
            </label>
            <select
              value={localTemplate}
              onChange={e => setLocalTemplate(e.target.value)}
              className="w-full p-2.5 bg-[#f8fbfb] border border-slate-200 rounded-xl outline-none text-slate-700 text-xs font-medium cursor-pointer"
            >
              <option value="ALL">All Message Templates</option>
              {templates.map(tpl => (
                <option key={tpl.id} value={tpl.name}>
                  {tpl.name} ({tpl.type})
                </option>
              ))}
            </select>
          </div>

          {/* 5. Store Branch (Admin only vs Branch User locked) */}
          <div>
            <label className="text-slate-700 font-semibold block mb-1.5 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-[#008C83]" />
              <span>Store Branch</span>
            </label>
            {isBranchUser ? (
              <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-medium flex items-center justify-between">
                <span>{userBranchName || 'Rajahmandary Main Branch'}</span>
                <span className="text-[10px] text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                  Assigned Store
                </span>
              </div>
            ) : (
              <select
                value={localBranch}
                onChange={e => setLocalBranch(e.target.value)}
                className="w-full p-2.5 bg-[#f8fbfb] border border-slate-200 rounded-xl outline-none text-slate-700 text-xs font-medium cursor-pointer"
              >
                <option value="ALL">All Branches</option>
                {CANONICAL_BRANCHES.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-[#f8fbfb] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-100 text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2 bg-[#004F4C] hover:bg-[#003d3a] text-white rounded-xl font-semibold text-xs transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Apply Filters</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
