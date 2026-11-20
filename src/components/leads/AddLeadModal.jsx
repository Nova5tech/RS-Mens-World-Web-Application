import React, { useState, useEffect } from 'react';
import { X, UserPlus, Store, Edit3, Lock } from 'lucide-react';
import { useBranch } from '../../context/BranchContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getBranchDisplayName } from '../../config/branchConfig.js';
import { useToast } from '../../context/ToastContext.jsx';
import { isValidIndianMobile } from '../../utils/formatters.js';

export default function AddLeadModal({ isOpen, onClose, onCreateLead, onUpdateLead, leadToEdit }) {
  if (!isOpen) return null;

  const { branches, activeBranchId } = useBranch();
  const { currentUser, isBranchUser } = useAuth();
  const { showToast } = useToast();

  const isEditMode = Boolean(leadToEdit);

  // Check if current user is restricted to their assigned branch
  const isLockedToBranch = Boolean(isBranchUser || currentUser?.assignedBranchId);
  const userAssignedBranchId = currentUser?.assignedBranchId || (isBranchUser ? 'B1' : null);

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [enquiry, setEnquiry] = useState('');
  const [preferredBranchId, setPreferredBranchId] = useState(
    isLockedToBranch ? userAssignedBranchId : 'B1'
  );
  const [consentToContact, setConsentToContact] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (leadToEdit) {
      setName(leadToEdit.name || '');
      const rawMobile = leadToEdit.mobile || '';
      setMobile(rawMobile.replace(/\D/g, '').slice(-10));
      setEmail(leadToEdit.email || '');
      setEnquiry(leadToEdit.enquiry || leadToEdit.aiSummary || '');
      // Enforce assigned branch for branch users, otherwise preserve existing lead branch
      setPreferredBranchId(
        isLockedToBranch ? userAssignedBranchId : leadToEdit.preferredBranchId || 'B1'
      );
      setConsentToContact(leadToEdit.consentToContact ?? true);
    } else {
      setName('');
      setMobile('');
      setEmail('');
      setEnquiry('');
      // Enforce assigned branch for branch users, otherwise default to active branch or B1
      setPreferredBranchId(
        isLockedToBranch
          ? userAssignedBranchId
          : activeBranchId && activeBranchId !== 'ALL'
          ? activeBranchId
          : 'B1'
      );
      setConsentToContact(true);
    }
  }, [leadToEdit, isOpen, isLockedToBranch, userAssignedBranchId, activeBranchId]);

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

    // Strictly enforce assigned branch for branch users
    const finalBranchId = isLockedToBranch ? userAssignedBranchId : (preferredBranchId || 'B1');

    try {
      setLoading(true);

      if (isEditMode && onUpdateLead) {
        await onUpdateLead(leadToEdit.id, {
          name: name.trim(),
          mobile: `+91 ${mobile.trim()}`,
          email: email.trim() || null,
          enquiry: enquiry.trim(),
          preferredBranchId: finalBranchId,
          assignedBranchId: finalBranchId,
        });
        showToast('Lead details updated successfully', 'success');
        onClose();
        return;
      }

      await onCreateLead({
        name: name.trim(),
        mobile: `+91 ${mobile.trim()}`,
        email: email ? email.trim() : null,
        enquiry: enquiry.trim(),
        preferredBranchId: finalBranchId,
        assignedBranchId: finalBranchId,
        source: 'Manual Walk-in',
        consentToContact,
      });

      showToast('New lead created successfully', 'success');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to process lead');
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
              {isEditMode ? <Edit3 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                {isEditMode ? 'Edit Client Lead' : 'Add New Client Lead'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEditMode ? `Updating lead details for ${leadToEdit?.name}` : 'Capture walk-in customer enquiry details'}
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
              placeholder="e.g. Rahul Kumar"
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-700 font-semibold text-xs flex items-center gap-1">
                  <span>Store Branch</span>
                  <span className="text-red-500">*</span>
                </label>
                {isLockedToBranch && (
                  <span className="text-[10px] font-bold text-[#004F4C] bg-[#e6f7f2] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                    <Lock className="w-2.5 h-2.5 text-[#004F4C]" />
                    <span>Locked to your branch</span>
                  </span>
                )}
              </div>

              {isLockedToBranch ? (
                <div className="relative">
                  <select
                    disabled
                    value={userAssignedBranchId || 'B1'}
                    className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-800 text-xs font-bold cursor-not-allowed select-none appearance-none pr-9 shadow-2xs opacity-90"
                    aria-readonly="true"
                    title="Store branch is locked to your logged-in branch account"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>
                        {getBranchDisplayName(b.id, b.name)}
                      </option>
                    ))}
                  </select>
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              ) : (
                <select
                  required
                  value={preferredBranchId}
                  onChange={e => setPreferredBranchId(e.target.value)}
                  className="w-full p-2.5 bg-[#f8fbfb] border border-slate-200 rounded-xl outline-none text-slate-700 text-xs font-medium cursor-pointer focus:border-[#004F4C] focus:bg-white transition-colors"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>
                      {getBranchDisplayName(b.id, b.name)}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div>
            <label className="text-slate-700 font-semibold block mb-1.5 text-xs">Email Address (Optional)</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="customer@gmail.com"
              className="w-full p-2.5 bg-[#f8fbfb] border border-slate-200 rounded-xl outline-none focus:border-[#0f766e] focus:bg-white text-slate-800 text-xs transition-all"
            />
          </div>

          <div>
            <label className="text-slate-700 font-semibold block mb-1.5 text-xs">Customer Enquiry *</label>
            <textarea
              required
              rows={3}
              value={enquiry}
              onChange={e => setEnquiry(e.target.value)}
              placeholder="Garment preferences, trial dates, custom measurements, festive wear..."
              className="w-full p-2.5 bg-[#f8fbfb] border border-slate-200 rounded-xl outline-none focus:border-[#0f766e] focus:bg-white text-slate-800 text-xs transition-all leading-relaxed"
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
              className="px-5 py-2 bg-[#004F4C] hover:bg-[#003d3a] text-white rounded-xl font-semibold text-xs transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
