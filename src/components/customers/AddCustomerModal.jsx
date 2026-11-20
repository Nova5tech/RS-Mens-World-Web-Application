import React, { useState, useEffect } from 'react';
import { X, UserPlus, Store, Tag, ShieldCheck, Edit3, Lock } from 'lucide-react';
import { useBranch } from '../../context/BranchContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { getBranchDisplayName } from '../../config/branchConfig.js';
import { isValidIndianMobile } from '../../utils/formatters.js';

export default function AddCustomerModal({ isOpen, onClose, onCustomerAdded, onCustomerUpdated, customerToEdit }) {
  if (!isOpen) return null;

  const { branches } = useBranch();
  const { isBranchUser, currentUser } = useAuth();
  const { showToast } = useToast();

  const isEditMode = Boolean(customerToEdit);

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [branchId, setBranchId] = useState(
    isBranchUser ? (currentUser?.assignedBranchId || 'B1') : 'B1'
  );
  const [customerType, setCustomerType] = useState('Regular');
  const [marketingOptIn, setMarketingOptIn] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customerToEdit) {
      setName(customerToEdit.name || '');
      const rawMobile = customerToEdit.phone || customerToEdit.mobile || '';
      setMobile(rawMobile.replace(/\D/g, '').slice(-10));
      setEmail(customerToEdit.email || '');
      setBranchId(
        isBranchUser
          ? (currentUser?.assignedBranchId || 'B1')
          : customerToEdit.branchId || (customerToEdit.branch === 'Branch 2' ? 'B2' : customerToEdit.branch === 'Branch 3' ? 'B3' : customerToEdit.branch === 'Branch 4' ? 'B4' : 'B1')
      );
      setCustomerType(customerToEdit.customerType || 'Regular');
      setMarketingOptIn(customerToEdit.consent ?? true);
    } else {
      setName('');
      setMobile('');
      setEmail('');
      setBranchId(isBranchUser ? (currentUser?.assignedBranchId || 'B1') : 'B1');
      setCustomerType('Regular');
      setMarketingOptIn(true);
    }
  }, [customerToEdit, isOpen, isBranchUser, currentUser]);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Customer name is required');
      return;
    }

    if (!isValidIndianMobile(mobile)) {
      setError('Please provide a valid 10-digit mobile number');
      return;
    }

    try {
      setLoading(true);
      const effectiveBranchId = isBranchUser ? (currentUser?.assignedBranchId || 'B1') : branchId;

      if (isEditMode && onCustomerUpdated) {
        const updated = {
          ...customerToEdit,
          name: name.trim(),
          phone: `+91 ${mobile.trim()}`,
          mobile: mobile.trim(),
          email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
          branchId: effectiveBranchId,
          branch: effectiveBranchId === 'B2' ? 'Branch 2' : effectiveBranchId === 'B3' ? 'Branch 3' : effectiveBranchId === 'B4' ? 'Branch 4' : 'Branch 1',
          branchDetail: getBranchDisplayName(effectiveBranchId),
          customerType,
          consent: marketingOptIn,
          marketingOptIn,
          status: customerToEdit.status || 'Active',
        };
        onCustomerUpdated(updated);
        showToast('Customer profile updated successfully', 'success');
        onClose();
        return;
      }

      const newCustomer = {
        id: `C-${Math.floor(10000 + Math.random() * 90000)}`,
        name: name.trim(),
        phone: `+91 ${mobile.trim()}`,
        mobile: mobile.trim(),
        email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
        branchId: effectiveBranchId,
        branch: effectiveBranchId === 'B2' ? 'Branch 2' : effectiveBranchId === 'B3' ? 'Branch 3' : effectiveBranchId === 'B4' ? 'Branch 4' : 'Branch 1',
        branchDetail: getBranchDisplayName(effectiveBranchId),
        customerType,
        status: 'New',
        customerSince: 'Today',
        consent: marketingOptIn,
        marketingOptIn,
        consentSource: 'In-Store Staff',
        consentDate: new Date().toISOString().slice(0, 10),
        lastInteraction: 'Today',
        createdAt: new Date().toISOString(),
        purchases: {
          total: '₹0',
          orders: 0,
          avgOrderValue: '₹0',
        },
      };

      if (onCustomerAdded) {
        onCustomerAdded(newCustomer);
      }
      showToast('Customer record created successfully', 'success');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-[#062b24]/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl shadow-float border border-[#D9E9E8] max-w-md w-full overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-[#D9E9E8] bg-[#f8fbfb] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#e6f7f2] flex items-center justify-center text-[#008C83]">
              {isEditMode ? <Edit3 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                {isEditMode ? 'Edit Customer Profile' : 'Add New Customer'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEditMode ? `Update details for ${customerToEdit?.name}` : 'Register customer profile & store assignment'}
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
              <label className="text-slate-700 font-semibold block mb-1.5 text-xs">Store Branch *</label>
              {isBranchUser ? (
                <div className="flex items-center gap-2 p-2.5 bg-slate-100/90 border border-slate-200 rounded-xl text-slate-700 text-xs font-medium cursor-not-allowed select-none">
                  <Store className="w-3.5 h-3.5 text-[#008C83]" />
                  <span className="truncate">{currentUser?.branchName || 'Rajahmandary Main Branch'}</span>
                  <Lock className="w-3 h-3 text-slate-400 ml-auto shrink-0" />
                </div>
              ) : (
                <select
                  value={branchId}
                  onChange={e => setBranchId(e.target.value)}
                  className="w-full p-2.5 bg-[#f8fbfb] border border-slate-200 rounded-xl outline-none text-slate-700 text-xs font-medium cursor-pointer"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-semibold block mb-1.5 text-xs">Customer Classification</label>
              <select
                value={customerType}
                onChange={e => setCustomerType(e.target.value)}
                className="w-full p-2.5 bg-[#f8fbfb] border border-slate-200 rounded-xl outline-none text-slate-700 text-xs font-medium cursor-pointer"
              >
                <option value="Regular">Regular</option>
                <option value="VIP">VIP</option>
                <option value="Repeat">Repeat</option>
              </select>
            </div>
            <div>
              <label className="text-slate-700 font-semibold block mb-1.5 text-xs">Email Address (Optional)</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="client@gmail.com"
                className="w-full p-2.5 bg-[#f8fbfb] border border-slate-200 rounded-xl outline-none focus:border-[#0f766e] focus:bg-white text-slate-800 text-xs transition-all"
              />
            </div>
          </div>

          <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={marketingOptIn}
              onChange={e => setMarketingOptIn(e.target.checked)}
              className="rounded border-slate-300 text-[#004F4C] focus:ring-[#004F4C]/20 mt-0.5"
            />
            <span className="text-[11px] text-slate-600 leading-normal">
              Customer gave verified marketing opt-in consent for WhatsApp promotional broadcasts.
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
              {loading ? 'Saving...' : isEditMode ? 'Save Changes' : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
