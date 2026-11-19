import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, Calculator, DollarSign, Store } from 'lucide-react';
import { accountingService } from '../../services/accountingService.js';
import { posService } from '../../services/posService.js';
import { useBranch } from '../../context/BranchContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { formatCurrency } from '../../utils/formatters.js';

export default function DayEndClosingModal({ isOpen, onClose, onClosingRecorded }) {
  if (!isOpen) return null;

  const { branches, activeBranchId } = useBranch();
  const { currentUser, isBranchUser } = useAuth();
  const { showToast } = useToast();

  const [branch, setBranch] = useState(
    isBranchUser ? currentUser.assignedBranchId : (activeBranchId !== 'ALL' ? activeBranchId : 'B1')
  );
  const [openingCash, setOpeningCash] = useState(5000);
  const [cashSales, setCashSales] = useState(12400);
  const [cardSales, setCardSales] = useState(16500);
  const [upiSales, setUpiSales] = useState(21000);
  const [creditSales, setCreditSales] = useState(3198);
  const [expenses, setExpenses] = useState(1450);
  const [physicalCashCounted, setPhysicalCashCounted] = useState(15950);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Expected cash = Opening Cash + Cash Sales - Cash Expenses
  const expectedCash = Number(openingCash || 0) + Number(cashSales || 0) - Number(expenses || 0);
  const variance = Number(physicalCashCounted || 0) - expectedCash;

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await accountingService.recordClosing({
        branch,
        openingCash: Number(openingCash),
        cashSales: Number(cashSales),
        cardSales: Number(cardSales),
        upiSales: Number(upiSales),
        creditSales: Number(creditSales),
        expenses: Number(expenses),
        expectedCash,
        closingCash: Number(physicalCashCounted),
        variance,
        closedBy: currentUser?.name || 'Store Staff',
        notes: notes || 'Daily cash register closed & verified against terminal receipts',
      });

      showToast(`Day-end closing completed for branch ${branch}! Variance: ${formatCurrency(variance)}`, 'success');
      onClosingRecorded?.();
      onClose();
    } catch (err) {
      showToast('Failed to record day-end closing: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-[#062b24]/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-float border border-[#D9E9E8] max-w-lg w-full overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#D9E9E8] bg-[#f8fbfb] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#e6f7f2] flex items-center justify-center text-[#008C83]">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Day-End Cash Register Closing</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Terminal reconciliation, drawer audit & cash variance verification
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

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 p-6 overflow-y-auto space-y-4 text-xs">
          {/* Branch Picker */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">Store Branch *</label>
            <select
              value={branch}
              disabled={isBranchUser}
              onChange={e => setBranch(e.target.value)}
              className="w-full p-2.5 bg-[#f8fbfb] border border-slate-200 rounded-xl outline-none focus:border-[#008C83] text-slate-800 cursor-pointer font-semibold"
            >
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Cash Summary Breakdown */}
          <div className="p-4 bg-[#f8fbfb] rounded-2xl border border-slate-200/80 space-y-2.5">
            <span className="font-bold text-slate-800 text-xs block">
              Physical Cash Flow Breakdown
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-slate-500 block">Opening Cash Drawer (₹)</span>
                <input
                  type="number"
                  min="0"
                  value={openingCash}
                  onChange={e => setOpeningCash(Number(e.target.value))}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                />
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block">Today's Cash Sales (₹)</span>
                <input
                  type="number"
                  min="0"
                  value={cashSales}
                  onChange={e => setCashSales(Number(e.target.value))}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-emerald-700"
                />
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block">Cash Petty Expenses (₹)</span>
                <input
                  type="number"
                  min="0"
                  value={expenses}
                  onChange={e => setExpenses(Number(e.target.value))}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-rose-600"
                />
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block font-semibold text-[#008C83]">
                  Expected Drawer Cash
                </span>
                <div className="p-1.5 bg-[#e6f7f2] border border-[#A8F0D0] rounded-lg text-xs font-black text-[#004F4C]">
                  {formatCurrency(expectedCash)}
                </div>
              </div>
            </div>
          </div>

          {/* Physical Cash Counted & Variance */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-bold text-slate-900 block text-xs">
                  Physical Cash Counted in Drawer *
                </label>
                <span className="text-[11px] text-slate-400">Total counted currency notes + coins</span>
              </div>
              <input
                type="number"
                min="0"
                required
                value={physicalCashCounted}
                onChange={e => setPhysicalCashCounted(Number(e.target.value))}
                className="w-32 p-2 bg-[#f8fbfb] border border-slate-300 rounded-xl text-right font-black text-sm text-[#004F4C]"
              />
            </div>

            {/* Variance indicator */}
            <div className={`p-3 rounded-xl border flex items-center justify-between font-bold text-xs ${
              variance === 0
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : variance > 0
                ? 'bg-blue-50 border-blue-200 text-blue-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <div className="flex items-center gap-1.5">
                {variance === 0 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                )}
                <span>Register Reconciliation:</span>
              </div>
              <span>
                {variance === 0
                  ? 'Balanced (₹0 Variance)'
                  : variance > 0
                  ? `+${formatCurrency(variance)} (Surplus)`
                  : `${formatCurrency(variance)} (Shortage)`}
              </span>
            </div>
          </div>

          {/* Digital Sales Summary (Audit) */}
          <div className="p-3 bg-[#f8fbfb] rounded-2xl border border-slate-200/80 space-y-1.5 text-[11px]">
            <span className="font-bold text-slate-700 block">Digital Collections & Credit Notes (Audit Only)</span>
            <div className="flex justify-between text-slate-600">
              <span>UPI / QR Collections:</span>
              <span className="font-mono font-bold text-slate-900">{formatCurrency(upiSales)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Card Machine Swipes:</span>
              <span className="font-mono font-bold text-slate-900">{formatCurrency(cardSales)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Credit Sales Outstanding:</span>
              <span className="font-mono font-bold text-amber-700">{formatCurrency(creditSales)}</span>
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">Manager Closing Notes</label>
            <input
              type="text"
              placeholder="e.g. All terminal receipts reconciled with physical register drawer"
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
              disabled={submitting}
              className="px-5 py-2 bg-[#0f766e] hover:bg-[#0d655f] text-white rounded-xl font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit Day Closing</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
