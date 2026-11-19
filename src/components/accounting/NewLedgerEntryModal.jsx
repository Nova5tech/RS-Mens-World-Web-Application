import React, { useState } from 'react';
import { X, PlusCircle, Check, DollarSign } from 'lucide-react';
import { accountingService } from '../../services/accountingService.js';
import { useBranch } from '../../context/BranchContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function NewLedgerEntryModal({ isOpen, onClose, onEntryAdded }) {
  if (!isOpen) return null;

  const { branches, activeBranchId } = useBranch();
  const { currentUser, isBranchUser } = useAuth();
  const { showToast } = useToast();

  const [branch, setBranch] = useState(
    isBranchUser ? currentUser.assignedBranchId : (activeBranchId !== 'ALL' ? activeBranchId : 'B1')
  );
  const [type, setType] = useState('Expense'); // 'Income' | 'Expense'
  const [category, setCategory] = useState('Store Utilities');
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('Cash');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const incomeCategories = [
    'Store Sales (POS)',
    'Tailoring & Alteration Charges',
    'Customer Advance Booking',
    'Scrap & Packing Material Sale',
    'Other Operating Income',
  ];

  const expenseCategories = [
    'Store Utilities (Power, Water)',
    'Packaging Materials (Bags, Covers)',
    'Staff Refreshments & Food',
    'Tailor Master Daily Wage',
    'Store Maintenance & Repairs',
    'Local Delivery Logistics',
    'Miscellaneous Petty Cash',
  ];

  const handleSubmit = async e => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      showToast('Enter a valid amount', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await accountingService.addEntry({
        branch,
        type,
        category,
        amount: Number(amount),
        mode,
        reference: reference || `VOUCH-${Date.now().toString().slice(-4)}`,
        notes,
      });

      showToast(`Financial ${type.toLowerCase()} entry recorded successfully`, 'success');
      onEntryAdded?.();
      onClose();
    } catch (err) {
      showToast('Failed to record entry: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-[#062b24]/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-float border border-[#D9E9E8] max-w-md w-full overflow-hidden z-10 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#D9E9E8] bg-[#f8fbfb] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#e6f7f2] flex items-center justify-center text-[#008C83]">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Record General Ledger Entry</h3>
              <p className="text-xs text-slate-500 mt-0.5">Operating income or store petty cash expense</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Type Toggle: Income or Expense */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setType('Income');
                setCategory(incomeCategories[0]);
              }}
              className={`p-2.5 rounded-xl font-bold transition-all cursor-pointer text-center ${
                type === 'Income'
                  ? 'bg-emerald-50 border border-emerald-300 text-emerald-800 shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              + Income / Revenue
            </button>
            <button
              type="button"
              onClick={() => {
                setType('Expense');
                setCategory(expenseCategories[0]);
              }}
              className={`p-2.5 rounded-xl font-bold transition-all cursor-pointer text-center ${
                type === 'Expense'
                  ? 'bg-rose-50 border border-rose-300 text-rose-800 shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              - Store Expense
            </button>
          </div>

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

          {/* Category */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">Transaction Category *</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full p-2.5 bg-[#f8fbfb] border border-slate-200 rounded-xl outline-none focus:border-[#008C83] text-slate-800 cursor-pointer"
            >
              {(type === 'Income' ? incomeCategories : expenseCategories).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Amount & Mode */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">Amount (₹) *</label>
              <input
                type="number"
                min="1"
                required
                placeholder="e.g. 1500"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full p-2.5 bg-[#f8fbfb] border border-slate-200 rounded-xl outline-none focus:border-[#008C83] text-slate-900 font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">Payment Mode *</label>
              <select
                value={mode}
                onChange={e => setMode(e.target.value)}
                className="w-full p-2.5 bg-[#f8fbfb] border border-slate-200 rounded-xl outline-none focus:border-[#008C83] text-slate-800 cursor-pointer"
              >
                <option value="Cash">Cash (Register)</option>
                <option value="UPI">UPI / QR Code</option>
                <option value="Bank transfer">Bank Transfer (NEFT/IMPS)</option>
                <option value="Card">Debit / Credit Card</option>
              </select>
            </div>
          </div>

          {/* Voucher Reference */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">Reference / Voucher No</label>
            <input
              type="text"
              placeholder="e.g. V-108 or UPI-Ref-9923"
              value={reference}
              onChange={e => setReference(e.target.value)}
              className="w-full p-2.5 bg-[#f8fbfb] border border-slate-200 rounded-xl outline-none focus:border-[#008C83] text-slate-800 font-mono text-[11px]"
            />
          </div>

          {/* Remarks */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">Remarks / Notes</label>
            <input
              type="text"
              placeholder="e.g. Monthly tailoring thread and button purchase"
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
              <Check className="w-4 h-4" />
              <span>Record Entry</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
