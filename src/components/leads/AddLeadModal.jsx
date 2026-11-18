import React, { useState } from 'react';
import { X, UserPlus, Store } from 'lucide-react';
import { useBranch } from '../../context/BranchContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { isValidIndianMobile } from '../../utils/formatters.js';

export default function AddLeadModal({ isOpen, onClose, onCreateLead }) {
  if (!isOpen) return null;

  const { branches } = useBranch();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [enquiry, setEnquiry] = useState('');
  const [preferredBranchId, setPreferredBranchId] = useState('B1');
  const [consentToContact, setConsentToContact] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Customer name is required');
      return;
    }

    if (!isValidIndianMobile(mobile)) {
      setError('Please provide a valid 10-digit Indian mobile number');
      return;
    }

    if (!enquiry.trim()) {
      setError('Enquiry description is required');
      return;
    }

    try {
      setLoading(true);
      await onCreateLead({
        name,
        mobile,
        email: email || null,
        enquiry,
        preferredBranchId,
        assignedBranchId: preferredBranchId,
        source: 'Manual Walk-in',
        consentToContact,
      });

      showToast('New lead created successfully', 'success');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-[#062b24]/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-float border border-[#D9E9E8] max-w-md w-full overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-[#D9E9E8] bg-[#f8fbfb] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#e6f7f2] flex items-center justify-center text-[#008C83]">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Add New Client Lead</h3>
              <p className="text-xs text-slate-500 mt-0.5">Capture walk-in customer enquiry details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-sans">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="text-slate-700 font-semibold block mb-1.5 text-xs">Customer Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Suresh Varma"
              className="w-full p-2.5 bg-[#f8fbfb] border border-slate-200 rounded-xl outline-none focus:border-[#0f766e] focus:bg-white text-slate-800 text-xs transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-semibold block mb-1.5 text-xs">Mobile Number *</label>
              <input
                type="tel"
                required
                value={mobile}
                onChange={e => setMobile(e.target.value)}
                placeholder="10 digits"
                className="w-full p-2.5 bg-[#f8fbfb] border border-slate-200 rounded-xl outline-none font-mono focus:border-[#0f766e] focus:bg-white text-slate-800 text-xs transition-all"
              />
            </div>
            <div>
              <label className="text-slate-700 font-semibold block mb-1.5 text-xs">Assigned Store *</label>
              <select
                value={preferredBranchId}
                onChange={e => setPreferredBranchId(e.target.value)}
                className="w-full p-2.5 bg-[#f8fbfb] border border-slate-200 rounded-xl outline-none text-slate-700 text-xs font-medium cursor-pointer"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-700 font-semibold block mb-1.5 text-xs">Email Address (Optional)</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="client@example.com"
              className="w-full p-2.5 bg-[#f8fbfb] border border-slate-200 rounded-xl outline-none focus:border-[#0f766e] focus:bg-white text-slate-800 text-xs transition-all"
            />
          </div>

          <div>
            <label className="text-slate-700 font-semibold block mb-1.5 text-xs">Enquiry Details & Notes *</label>
            <textarea
              rows={3}
              required
              value={enquiry}
              onChange={e => setEnquiry(e.target.value)}
              placeholder="Garment preferences, trial dates, custom measurements, festive wear..."
              className="w-full p-3 bg-[#f8fbfb] border border-slate-200 rounded-xl outline-none leading-relaxed focus:border-[#0f766e] focus:bg-white text-slate-800 text-xs transition-all"
            />
          </div>

          <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={consentToContact}
              onChange={e => setConsentToContact(e.target.checked)}
              className="rounded border-slate-300 text-[#0f766e] focus:ring-[#0f766e]/20 mt-0.5"
            />
            <span className="text-[11px] text-slate-600 leading-normal">
              Customer gave explicit verbal consent to receive WhatsApp messages & consultations.
            </span>
          </label>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200/90 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-[#0f766e] hover:bg-[#0d655f] text-white rounded-xl font-semibold text-xs transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Recording...' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
