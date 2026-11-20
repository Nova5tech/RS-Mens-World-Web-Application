import React from 'react';
import {
  Download,
  Tag,
  Megaphone,
  X,
  CheckSquare,
  Lock,
} from 'lucide-react';

/**
 * BulkActionBar
 * Floating docked toolbar displayed when one or more customers are selected in the Customer Database.
 * Adheres strictly to RS Men's World Mint Green (#A8F0D0 / #008C83) and Deep Teal (#004F4C) design system.
 */
export default function BulkActionBar({
  selectedCount,
  onDeselectAll,
  onExport,
  onUpdateCategory,
  onAddToCampaign,
  isBranchUser,
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-4xl animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="bg-[#004F4C] text-white rounded-2xl shadow-float border border-[#A8F0D0]/30 px-4 py-3 flex flex-wrap items-center justify-between gap-3 backdrop-blur-md">
        {/* Left: Selected count and Deselect button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
            <CheckSquare className="w-4 h-4 text-[#A8F0D0]" />
            <span className="text-xs font-bold tracking-wide">
              {selectedCount} {selectedCount === 1 ? 'Customer' : 'Customers'} Selected
            </span>
          </div>

          <button
            type="button"
            onClick={onDeselectAll}
            className="text-xs text-slate-200 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title="Clear all selections"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Deselect All</span>
          </button>
        </div>

        {/* Right: Bulk Action Buttons Group */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* 1. Export Selected CSV (Available for both Super Admin and Branch Users) */}
          <button
            type="button"
            onClick={onExport}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-semibold rounded-xl border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Export selected customers to CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#A8F0D0]" />
            <span>Export CSV</span>
          </button>

          {/* 2. Update Category (VIP, Regular, Repeat) */}
          <button
            type="button"
            onClick={onUpdateCategory}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-semibold rounded-xl border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Batch update category for selected customers"
          >
            <Tag className="w-3.5 h-3.5 text-[#A8F0D0]" />
            <span>Update Category</span>
          </button>

          {/* 3. Add to WhatsApp Campaign Audience (Super Admin Only + DPDP Consent) */}
          {isBranchUser ? (
            <div
              className="px-3 py-1.5 bg-white/5 text-white/40 text-xs font-semibold rounded-xl border border-white/10 flex items-center gap-1.5 cursor-not-allowed select-none"
              title="Restricted: Only Super Admin can manage WhatsApp Campaign audiences"
            >
              <Lock className="w-3.5 h-3.5 text-white/40" />
              <span>Add to Campaign (Admin Only)</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={onAddToCampaign}
              className="px-3.5 py-1.5 bg-[#A8F0D0] hover:bg-[#8ee9c2] text-[#004F4C] text-xs font-bold rounded-xl transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Add eligible opted-in customers to a WhatsApp marketing campaign audience"
            >
              <Megaphone className="w-3.5 h-3.5 text-[#004F4C]" />
              <span>Add to Campaign</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
