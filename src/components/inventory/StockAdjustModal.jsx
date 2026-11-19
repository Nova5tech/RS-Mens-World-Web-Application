import React, { useState } from 'react';
import { X, Sliders, AlertTriangle, Check, ArrowRight } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import { useBranch } from '../../context/BranchContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function StockAdjustModal({ isOpen, onClose, product, currentQty = 0, onAdjust }) {
  if (!isOpen || !product) return null;

  const { branches, activeBranchId } = useBranch();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [targetBranch, setTargetBranch] = useState(
    activeBranchId !== 'ALL' ? activeBranchId : 'B1'
  );
  const [adjustmentType, setAdjustmentType] = useState('ADD'); // 'ADD' | 'REMOVE'
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('Stock Count Reconciliation');
  const [notes, setNotes] = useState('');

  const targetBranchObj = branches.find(b => b.id === targetBranch);

  const handleSubmit = e => {
    e.preventDefault();
    const delta = adjustmentType === 'ADD' ? Number(quantity) : -Number(quantity);

    if (adjustmentType === 'REMOVE' && Number(quantity) > currentQty) {
      if (!confirm(`Warning: Deducting ${quantity} will result in 0 or negative balance. Proceed?`)) {
        return;
      }
    }

    const fullReason = `${reason}${notes ? ` - ${notes}` : ''}`;
    onAdjust(targetBranch, product.id, delta, fullReason, currentUser?.name || 'Store Staff');
    showToast(
      `Stock for ${product.name} adjusted by ${delta > 0 ? `+${delta}` : delta} units at ${targetBranchObj?.name || targetBranch}`,
      'success'
    );
    onClose();
  };

  const newBalance = adjustmentType === 'ADD'
    ? currentQty + Number(quantity || 0)
    : Math.max(0, currentQty - Number(quantity || 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-[#062b24]/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-float border border-[#D9E9E8] max-w-md w-full overflow-hidden z-10 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#D9E9E8] bg-[#f8fbfb] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#e6f7f2] flex items-center justify-center text-[#008C83]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Stock Adjustment</h3>
              <p className="text-xs text-slate-500 mt-0.5">Physical count reconciliation & write-off</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Target Product Summary Box */}
          <div className="p-3.5 bg-[#f8fbfb] rounded-2xl border border-slate-200/80 space-y-1">
            <div className="font-bold text-slate-900 text-sm">{product.name}</div>
            <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
              <span>SKU: {product.sku}</span>
              <span>•</span>
              <span>Size: {product.size}</span>
              <span>•</span>
              <span>Colour: {product.colour}</span>
            </div>
          </div>

          {/* Branch Picker */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">Target Branch</label>
            <select
              value={targetBranch}
              onChange={e => setTargetBranch(e.target.value)}
              className="w-full p-2.5 bg-[#f8fbfb] border border-slate-200 rounded-xl outline-none focus:border-[#008C83] text-slate-800 cursor-pointer font-semibold"
            >
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Type Toggle: Add or Deduct */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAdjustmentType('ADD')}
              className={`p-2.5 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                adjustmentType === 'ADD'
                  ? 'bg-emerald-50 border border-emerald-300 text-emerald-800 shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>+ Add Stock</span>
            </button>
            <button
              type="button"
              onClick={() => setAdjustmentType('REMOVE')}
              className={`p-2.5 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                adjustmentType === 'REMOVE'
                  ? 'bg-rose-50 border border-rose-300 text-rose-800 shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>- Deduct / Write-Off</span>
            </button>
          </div>

          {/* Quantity & Balance Preview */}
          <div className="grid grid-cols-2 gap-3 items-center">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">Adjustment Quantity</label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-full p-2.5 bg-[#f8fbfb] border border-slate-200 rounded-xl outline-none focus:border-[#008C83] text-slate-900 font-bold text-sm"
              />
            </div>

            <div className="p-3 bg-[#e6f7f2]/50 border border-[#A8F0D0] rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-[#008C83] block">New Branch Balance</span>
              <span className="text-base font-extrabold text-[#004F4C]">
                {currentQty} <ArrowRight className="inline w-3 h-3 text-slate-400 mx-1" /> {newBalance} units
              </span>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">Adjustment Reason *</label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full p-2.5 bg-[#f8fbfb] border border-slate-200 rounded-xl outline-none focus:border-[#008C83] text-slate-800 cursor-pointer"
            >
              <option value="Stock Count Reconciliation">Physical Count Cycle Reconciliation</option>
              <option value="Damaged / Fabric Flaw Write-off">Damaged / Fabric Flaw Write-off</option>
              <option value="Opening Balance Correction">Opening Balance Correction</option>
              <option value="Supplier Replacement Receipt">Supplier Replacement Receipt</option>
              <option value="Store Mannequin Display Use">Store Mannequin Display Use</option>
            </select>
          </div>

          {/* Remarks */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">Remarks / Reference (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Verified by Store Manager audit"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full p-2.5 bg-[#f8fbfb] border border-slate-200 rounded-xl outline-none focus:border-[#008C83] text-slate-800"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0f766e] hover:bg-[#0d655f] text-white rounded-xl font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Confirm Adjustment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
