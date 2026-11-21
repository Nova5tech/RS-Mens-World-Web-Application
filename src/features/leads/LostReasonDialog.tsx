import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Lead } from '@/types/models';

interface LostReasonDialogProps {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
  onConfirm: (reason: Lead['lost_reason'], notes?: string) => void;
}

export const LostReasonDialog: React.FC<LostReasonDialogProps> = ({
  isOpen,
  lead,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState<Lead['lost_reason']>('not_interested');
  const [notes, setNotes] = useState('');

  if (!isOpen || !lead) return null;

  const reasons: Array<{ id: NonNullable<Lead['lost_reason']>; label: string }> = [
    { id: 'not_interested', label: 'Not interested / Cancelled requirement' },
    { id: 'price', label: 'Price / Budget mismatch' },
    { id: 'out_of_stock', label: 'Out of stock / Timeline unavailable' },
    { id: 'no_response', label: 'Unreachable / No response to follow-ups' },
    { id: 'other', label: 'Other reason' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-rose-50/50">
          <div className="flex items-center gap-2 text-rose-800">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <h3 className="font-semibold text-base">Mark Lead as Lost</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Please select a reason for marking <strong className="text-gray-900">{lead.customer_name}</strong> as lost.
          </p>

          <div className="space-y-2">
            {reasons.map((r) => (
              <label
                key={r.id}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  reason === r.id
                    ? 'border-rose-500 bg-rose-50/40 text-rose-900 font-semibold'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="lostReason"
                  checked={reason === r.id}
                  onChange={() => setReason(r.id)}
                  className="text-rose-600 focus:ring-rose-500 h-4 w-4"
                />
                <span className="text-xs">{r.label}</span>
              </label>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Additional Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Customer bought from competitor, delivery was needed within 2 hours..."
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 bg-gray-50 border-t border-gray-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onConfirm(reason, notes)}
          >
            Mark as Lost
          </Button>
        </div>
      </div>
    </div>
  );
};
