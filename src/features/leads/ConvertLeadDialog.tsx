import React, { useState } from 'react';
import { X, UserCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Lead } from '@/types/models';

interface ConvertLeadDialogProps {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
  onConfirm: (addToCustomers: boolean) => void;
}

export const ConvertLeadDialog: React.FC<ConvertLeadDialogProps> = ({
  isOpen,
  lead,
  onClose,
  onConfirm,
}) => {
  const [addToCustomers, setAddToCustomers] = useState(true);

  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-emerald-50/50">
          <div className="flex items-center gap-2 text-emerald-800">
            <UserCheck className="w-5 h-5 text-emerald-700" />
            <h3 className="font-semibold text-base">Convert Lead to Customer</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            Are you sure you want to convert <strong className="text-gray-900">{lead.customer_name}</strong> ({lead.id}) to <strong>Converted</strong> status?
          </p>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={addToCustomers}
                onChange={(e) => setAddToCustomers(e.target.checked)}
                className="mt-0.5 rounded border-gray-300 text-[#0F4C3A] focus:ring-[#0F4C3A] h-4 w-4"
              />
              <div className="text-xs">
                <span className="font-semibold text-gray-900 block">Add to Customer Database</span>
                <span className="text-gray-500 block mt-0.5 leading-normal">
                  Creates an active customer profile in the assigned store branch with WhatsApp consent copied. If an existing profile with phone {lead.phone} exists, it will link without duplicates.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 bg-gray-50 border-t border-gray-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onConfirm(addToCustomers)}
            className="bg-emerald-700 hover:bg-emerald-800 text-white"
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            Confirm Conversion
          </Button>
        </div>
      </div>
    </div>
  );
};
