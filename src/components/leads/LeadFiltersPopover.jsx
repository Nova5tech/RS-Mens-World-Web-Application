import React, { useState, useEffect, useRef } from 'react';
import { X, SlidersHorizontal, Check, RotateCcw, Store, Activity, AlertCircle, MessageSquare } from 'lucide-react';

export default function LeadFiltersPopover({
  isOpen,
  onClose,
  initialFilters = {
    branch: 'ALL',
    stage: 'ALL',
    priority: 'ALL',
    source: 'ALL',
  },
  onApplyFilters,
  onClearFilters,
  isBranchUser = false,
}) {
  const [filters, setFilters] = useState(initialFilters);
  const popoverRef = useRef(null);

  // Sync state when opened or initialFilters change
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters, isOpen]);

  // Close on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        onClose();
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleClear = () => {
    const cleared = {
      branch: 'ALL',
      stage: 'ALL',
      priority: 'ALL',
      source: 'ALL',
    };
    setFilters(cleared);
    onClearFilters();
    onClose();
  };

  const hasActiveFilters =
    filters.branch !== 'ALL' ||
    filters.stage !== 'ALL' ||
    filters.priority !== 'ALL' ||
    filters.source !== 'ALL';

  return (
    <div
      ref={popoverRef}
      className="absolute right-0 top-12 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-150 select-none text-slate-800"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#004F4C]" />
          <h3 className="font-extrabold text-sm text-slate-900">Filter Leads</h3>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close filters"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3.5 text-xs">
        {/* Branch Filter (Only for Admins; branch users are automatically locked to their assigned branch) */}
        {!isBranchUser && (
          <div>
            <label className="flex items-center gap-1.5 font-bold text-slate-700 mb-1.5">
              <Store className="w-3.5 h-3.5 text-slate-400" />
              <span>Store Branch</span>
            </label>
            <select
              value={filters.branch}
              onChange={e => setFilters(prev => ({ ...prev, branch: e.target.value }))}
              className="w-full py-2 px-3 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-[#004F4C] focus:bg-white cursor-pointer transition-colors shadow-2xs"
            >
              <option value="ALL">All Branches</option>
              <option value="Branch 1">Branch 1 – Rajahmandary Main Branch</option>
              <option value="Branch 2">Branch 2 – Kakinada Branch</option>
              <option value="Branch 3">Branch 3 – Vijayawada Branch</option>
              <option value="Branch 4">Branch 4 – Guntur Branch</option>
            </select>
          </div>
        )}

        {/* Lead Stage Filter */}
        <div>
          <label className="flex items-center gap-1.5 font-bold text-slate-700 mb-1.5">
            <Activity className="w-3.5 h-3.5 text-slate-400" />
            <span>Lead Stage</span>
          </label>
          <select
            value={filters.stage}
            onChange={e => setFilters(prev => ({ ...prev, stage: e.target.value }))}
            className="w-full py-2 px-3 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-[#004F4C] focus:bg-white cursor-pointer transition-colors shadow-2xs"
          >
            <option value="ALL">All Stages</option>
            <option value="New">New</option>
            <option value="In Progress">In Progress</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Converted">Converted</option>
            <option value="Lost">Lost</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="flex items-center gap-1.5 font-bold text-slate-700 mb-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Priority</span>
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {['ALL', 'High', 'Medium', 'Low'].map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setFilters(prev => ({ ...prev, priority: p }))}
                className={`py-1.5 px-2 text-center rounded-xl font-bold text-[11px] transition-all cursor-pointer ${filters.priority === p
                  ? 'bg-[#004F4C] text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
              >
                {p === 'ALL' ? 'All' : p}
              </button>
            ))}
          </div>
        </div>

        {/* Source Filter */}
        <div>
          <label className="flex items-center gap-1.5 font-bold text-slate-700 mb-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
            <span>Enquiry Source</span>
          </label>
          <select
            value={filters.source}
            onChange={e => setFilters(prev => ({ ...prev, source: e.target.value }))}
            className="w-full py-2 px-3 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-[#004F4C] focus:bg-white cursor-pointer transition-colors shadow-2xs"
          >
            <option value="ALL">All Sources</option>
            <option value="AI Chat">AI Chatbot / WhatsApp</option>
            <option value="Walk-in">Manual Walk-in</option>
            <option value="Website">Website Form</option>
            <option value="Phone Enquiry">Phone Call</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleClear}
          disabled={!hasActiveFilters}
          className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${hasActiveFilters
            ? 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
            : 'text-slate-300 cursor-not-allowed'
            }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="py-2 px-4 rounded-xl bg-[#004F4C] hover:bg-[#003d3a] text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply</span>
          </button>
        </div>
      </div>
    </div>
  );
}
