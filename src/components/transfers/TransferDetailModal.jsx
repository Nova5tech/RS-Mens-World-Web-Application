import React, { useState } from 'react';
import {
  X,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  Store,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { transferService } from '../../services/transferService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatDateTime } from '../../utils/formatters.js';

export default function TransferDetailModal({ transfer, isOpen, onClose, onStatusUpdated }) {
  if (!isOpen || !transfer) return null;

  const { showToast } = useToast();
  const { currentUser, isAdmin } = useAuth();

  const [receivedQtys, setReceivedQtys] = useState(() => {
    const map = {};
    transfer.items?.forEach(i => {
      map[i.productId] = i.receivedQty > 0 ? i.receivedQty : i.qty;
    });
    return map;
  });

  const [submitting, setSubmitting] = useState(false);

  const handleAction = async nextStatus => {
    try {
      setSubmitting(true);
      const extra = {
        user: currentUser?.name || 'Staff',
      };
      if (nextStatus === 'Approved') {
        extra.approvedBy = currentUser?.name || 'Super Admin';
      } else if (nextStatus === 'Dispatched') {
        extra.dispatchedDate = new Date().toISOString();
      } else if (nextStatus === 'Received') {
        extra.receivedDate = new Date().toISOString();
        extra.receivedQtys = receivedQtys;
      }

      await transferService.updateTransferStatus(transfer.id, nextStatus, extra);
      showToast(`Transfer ${transfer.id} status updated to "${nextStatus}"`, 'success');
      onStatusUpdated?.();
      onClose();
    } catch (err) {
      showToast('Failed to update transfer: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { label: 'Requested', done: true, current: transfer.status === 'Requested' },
    { label: 'Approved', done: ['Approved', 'Dispatched', 'Received'].includes(transfer.status), current: transfer.status === 'Approved' },
    { label: 'Dispatched', done: ['Dispatched', 'Received'].includes(transfer.status), current: transfer.status === 'Dispatched' },
    { label: 'Received', done: transfer.status === 'Received', current: transfer.status === 'Received' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-[#062b24]/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-float border border-[#D9E9E8] max-w-xl w-full overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#D9E9E8] bg-[#f8fbfb] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#e6f7f2] flex items-center justify-center text-[#008C83]">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900">{transfer.id}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e6f7f2] text-[#008C83]">
                  {transfer.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {transfer.fromName || transfer.from} <ArrowRight className="inline w-3 h-3 text-slate-400 mx-1" /> {transfer.toName || transfer.to}
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
        <div className="flex-1 p-6 overflow-y-auto space-y-5 text-xs">
          {/* Stepper Progress Bar */}
          <div className="p-3.5 bg-[#f8fbfb] rounded-2xl border border-slate-200/80">
            <div className="flex items-center justify-between">
              {steps.map((st, i) => (
                <div key={st.label} className="flex items-center gap-1.5">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      st.current
                        ? 'bg-[#0f766e] text-white shadow-xs'
                        : st.done
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {st.done && !st.current ? '✓' : i + 1}
                  </span>
                  <span className={`text-xs ${st.current ? 'font-bold text-[#0f766e]' : st.done ? 'font-semibold text-slate-800' : 'text-slate-400'}`}>
                    {st.label}
                  </span>
                  {i < steps.length - 1 && (
                    <span className="text-slate-300 mx-1">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Transfer Info Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-[#f8fbfb] p-3.5 rounded-2xl border border-slate-200/80">
            <div>
              <span className="text-slate-400 block font-medium text-[11px]">Requested By:</span>
              <span className="font-bold text-slate-900">{transfer.requestedBy || 'Store Staff'}</span>
              <span className="font-mono text-slate-500 block text-[10px]">{formatDateTime(transfer.createdDate)}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium text-[11px]">Approved By:</span>
              <span className="font-bold text-slate-900">{transfer.approvedBy || 'Pending Super Admin'}</span>
            </div>
            {transfer.notes && (
              <div className="col-span-2 pt-1 border-t border-slate-200 text-slate-600 italic">
                "{transfer.notes}"
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="space-y-2">
            <span className="font-bold text-slate-800 block">Dockets & Items List</span>
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f8fbfb] border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Garment Item</th>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3 text-center">Dispatched</th>
                    <th className="py-2.5 px-3 text-center">Received Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transfer.items?.map(item => (
                    <tr key={item.productId} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{item.name}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{item.sku}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-800">{item.qty}</td>
                      <td className="py-2.5 px-3 text-center">
                        {transfer.status === 'Dispatched' ? (
                          <input
                            type="number"
                            min="0"
                            max={item.qty}
                            value={receivedQtys[item.productId] ?? item.qty}
                            onChange={e =>
                              setReceivedQtys({
                                ...receivedQtys,
                                [item.productId]: Math.max(0, Number(e.target.value)),
                              })
                            }
                            className="w-14 p-1 text-center bg-white border border-slate-300 rounded-lg text-xs font-bold"
                          />
                        ) : (
                          <span className="font-bold text-emerald-700">
                            {transfer.status === 'Received' ? (item.receivedQty || item.qty) : '-'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-[#f8fbfb] border-t border-[#D9E9E8] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold cursor-pointer text-xs"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {transfer.status === 'Requested' && (
              <button
                onClick={() => handleAction('Approved')}
                disabled={submitting}
                className="px-4 py-2 bg-[#0f766e] hover:bg-[#0d655f] text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Requisition</span>
              </button>
            )}

            {transfer.status === 'Approved' && (
              <button
                onClick={() => handleAction('Dispatched')}
                disabled={submitting}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Truck className="w-4 h-4" />
                <span>Dispatch Stock Docket</span>
              </button>
            )}

            {transfer.status === 'Dispatched' && (
              <button
                onClick={() => handleAction('Received')}
                disabled={submitting}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <PackageCheck className="w-4 h-4" />
                <span>Confirm Receipt & Stock-In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
