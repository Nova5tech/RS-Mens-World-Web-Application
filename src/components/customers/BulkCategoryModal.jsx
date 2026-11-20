import React, { useState } from 'react';
import { X, Tag, Check, AlertCircle } from 'lucide-react';

/**
 * BulkCategoryModal
 * Modal dialog for batch-updating customer classification category (Regular, VIP, Repeat).
 */
export default function BulkCategoryModal({
  isOpen,
  onClose,
  selectedCount,
  onConfirm,
}) {
  const [selectedCategory, setSelectedCategory] = useState('VIP');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const categories = [
    {
      id: 'Regular',
      label: 'Regular Customer',
      desc: 'Standard retail customer with normal shopping frequency',
      badgeClass: 'bg-[#e6f7f2] text-[#008C83] border-[#A8F0D0]',
    },
    {
      id: 'VIP',
      label: 'VIP Customer',
      desc: 'High-value priority customer eligible for exclusive sales & previews',
      badgeClass: 'bg-[#fff8e6] text-[#b45309] border-[#fde68a]',
    },
    {
      id: 'Repeat',
      label: 'Repeat Customer',
      desc: 'Frequent buyer with steady store visits and repeat purchases',
      badgeClass: 'bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]',
    },
  ];

  const handleApply = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(selectedCategory);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 w-full max-w-md overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#004F4C]/10 flex items-center justify-center text-[#004F4C]">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Update Customer Category
              </h3>
              <p className="text-[11px] text-slate-500">
                Updating {selectedCount} selected {selectedCount === 1 ? 'customer' : 'customers'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <p className="text-xs text-slate-600 font-medium">
            Select the new classification category to assign to all selected customer records:
          </p>

          <div className="space-y-2">
            {categories.map(cat => {
              const isChosen = selectedCategory === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    isChosen
                      ? 'border-[#004F4C] bg-[#f0f9f7] ring-1 ring-[#004F4C]'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center shrink-0 ${
                      isChosen
                        ? 'border-[#004F4C] bg-[#004F4C] text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isChosen && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {cat.label}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${cat.badgeClass}`}
                      >
                        {cat.id}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      {cat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 flex items-start gap-2 text-amber-800 text-[11px] mt-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              This will update customer categorization across all linked POS and engagement records for these {selectedCount} selected customers.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleApply}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#004F4C] hover:bg-[#003d3a] transition-colors shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <span>Updating...</span>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Apply to {selectedCount} Records</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
