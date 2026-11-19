import React, { useState, useEffect } from 'react';
import { X, RotateCcw, AlertTriangle, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { returnService } from '../../services/returnService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatCurrency } from '../../utils/formatters.js';

export default function SalesReturnModal({ invoice, isOpen, onClose, onReturnCompleted }) {
  if (!isOpen || !invoice) return null;

  const { showToast } = useToast();
  const { currentUser } = useAuth();

  const [returnItems, setReturnItems] = useState({});
  const [returnReason, setReturnReason] = useState('Size / Fitting Issue');
  const [refundMode, setRefundMode] = useState('Store Credit Note'); // 'Store Credit Note' | 'Cash' | 'UPI'
  const [restock, setRestock] = useState(true);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Default: select first item with qty 1
    if (invoice.items?.length > 0) {
      setReturnItems({
        [invoice.items[0].productId]: 1,
      });
    }
  }, [invoice]);

  const toggleItem = (productId, maxQty) => {
    if (returnItems[productId]) {
      const next = { ...returnItems };
      delete next[productId];
      setReturnItems(next);
    } else {
      setReturnItems({
        ...returnItems,
        [productId]: 1,
      });
    }
  };

  const updateItemQty = (productId, qty, maxQty) => {
    const val = Math.max(1, Math.min(maxQty, Number(qty)));
    setReturnItems({
      ...returnItems,
      [productId]: val,
    });
  };

  // Calculate refund amount
  const selectedItemsList = Object.keys(returnItems).map(productId => {
    const original = invoice.items.find(i => i.productId === productId);
    return {
      productId,
      name: original?.name || 'Garment Item',
      sku: original?.sku || '',
      price: original?.price || 0,
      qty: returnItems[productId],
    };
  });

  const totalRefundAmount = selectedItemsList.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const handleSubmit = async e => {
    e.preventDefault();
    if (selectedItemsList.length === 0) {
      showToast('Select at least one item to return', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await returnService.processReturn({
        invoiceId: invoice.id,
        invoiceNo: invoice.invoiceNo,
        branch: invoice.branch,
        customerName: invoice.customerName,
        customerMobile: invoice.customerMobile,
        items: selectedItemsList,
        refundAmount: totalRefundAmount,
        refundMode,
        reason: returnReason,
        restock,
        notes,
        user: currentUser?.name || 'Store Staff',
      });

      showToast(`Sales return processed! Refund of ${formatCurrency(totalRefundAmount)} issued via ${refundMode}`, 'success');
      onReturnCompleted?.();
      onClose();
    } catch (err) {
      showToast('Failed to process return: ' + err.message, 'error');
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
            <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-700">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Process Sales Return</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Invoice <span className="font-mono font-bold text-slate-800">#{invoice.invoiceNo}</span> • Customer: {invoice.customerName}
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
          {/* Select Items to Return */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-700 block">Select Returned Items *</label>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
              {invoice.items?.map(item => {
                const isSelected = Boolean(returnItems[item.productId]);
                const qty = returnItems[item.productId] || 1;

                return (
                  <div
                    key={item.productId}
                    className={`p-3.5 flex items-center justify-between gap-3 transition-colors ${
                      isSelected ? 'bg-purple-50/40' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleItem(item.productId, item.qty)}
                        className="rounded text-[#008C83] focus:ring-[#008C83] cursor-pointer"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">{item.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {item.colour}/{item.size} • Original Qty: {item.qty} • {formatCurrency(item.price)}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">Return Qty:</span>
                        <input
                          type="number"
                          min="1"
                          max={item.qty}
                          value={qty}
                          onChange={e => updateItemQty(item.productId, e.target.value, item.qty)}
                          className="w-14 p-1 text-center bg-white border border-slate-300 rounded-lg text-xs font-bold"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Return Reason */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">Return Reason *</label>
            <select
              value={returnReason}
              onChange={e => setReturnReason(e.target.value)}
              className="w-full p-2.5 bg-[#f8fbfb] border border-slate-200 rounded-xl outline-none focus:border-[#008C83] text-slate-800 cursor-pointer"
            >
              <option value="Size / Fitting Issue">Size / Fitting Issue (Customer needs exchange)</option>
              <option value="Defective / Stitching Flaw">Defective / Fabric Flaw</option>
              <option value="Customer Changed Mind (Within 7 Days)">Customer Changed Mind (Unworn tag attached)</option>
              <option value="Wrong Item Billed at Counter">Wrong Item Billed at Counter</option>
            </select>
          </div>

          {/* Refund Mode */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">Refund Issuance Method *</label>
            <div className="grid grid-cols-3 gap-2">
              {['Store Credit Note', 'Cash', 'UPI'].map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setRefundMode(mode)}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                    refundMode === mode
                      ? 'bg-purple-50 border border-purple-300 text-purple-900 shadow-2xs'
                      : 'bg-[#f8fbfb] border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Restock Toggle */}
          <div className="p-3 bg-[#f8fbfb] rounded-2xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 block text-xs">Replenish Branch Inventory</span>
              <span className="text-[11px] text-slate-500">
                Restock returned garment back into available store stock
              </span>
            </div>
            <input
              type="checkbox"
              checked={restock}
              onChange={e => setRestock(e.target.checked)}
              className="w-4 h-4 rounded text-[#008C83] focus:ring-[#008C83] cursor-pointer"
            />
          </div>

          {/* Total Refund Banner */}
          <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-purple-700 font-bold block">Refund Amount Calculated:</span>
              <span className="text-[11px] text-slate-500">{selectedItemsList.length} items being returned</span>
            </div>
            <span className="text-xl font-black text-purple-900">
              {formatCurrency(totalRefundAmount)}
            </span>
          </div>

          {/* Actions */}
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
              disabled={submitting || selectedItemsList.length === 0}
              className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:bg-slate-200 disabled:text-slate-400"
            >
              <Check className="w-4 h-4" />
              <span>Confirm & Refund</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
