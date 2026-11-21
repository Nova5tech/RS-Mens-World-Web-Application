import React, { useState } from 'react';
import { X, UserPlus, Phone, User, Store, Tag, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LeadPriority, LeadSource } from '@/types/models';
import { useAuth } from '@/features/auth/useAuth';
import { normalizePhone } from '@/lib/phone';

interface AddLeadDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    customer_name: string;
    phone: string;
    enquiry: string;
    preferred_branch_id?: string;
    interest_tags: string[];
    source: LeadSource;
    priority: LeadPriority;
    follow_up_date?: string;
    consent_whatsapp: boolean;
  }) => Promise<void>;
}

export const AddLeadDrawer: React.FC<AddLeadDrawerProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { user } = useAuth();
  const isBranchUser = user?.role === 'branch_user';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [enquiry, setEnquiry] = useState('');
  const [branch, setBranch] = useState(isBranchUser ? (user?.branch_id || 'branch_1') : 'branch_1');
  const [source, setSource] = useState<LeadSource>('walk_in');
  const [priority, setPriority] = useState<LeadPriority>('medium');
  const [tagsInput, setTagsInput] = useState('');
  const [followUpDate, setFollowUpDate] = useState(new Date().toISOString().slice(0, 10));
  const [consent, setConsent] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Customer name is required');
      return;
    }

    const clean = phone.replace(/\D/g, '');
    if (clean.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    const norm = normalizePhone(phone);
    const normalizedPhone = norm.isValid ? norm.e164 : phone;

    if (!enquiry.trim()) {
      setError('Enquiry description is required');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      setIsSubmitting(true);
      await onSubmit({
        customer_name: name.trim(),
        phone: normalizedPhone,
        enquiry: enquiry.trim(),
        preferred_branch_id: (isBranchUser ? user?.branch_id : branch) || 'branch_1',
        interest_tags: tags.length > 0 ? tags : ['General Enquiry'],
        source,
        priority,
        follow_up_date: followUpDate || undefined,
        consent_whatsapp: consent,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-gray-200 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-[#0F4C3A]" />
          <h3 className="font-semibold text-gray-900 text-base">Add New Lead</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Customer Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Customer Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Varma"
              className="w-full h-10 pl-9 pr-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F4C3A] focus:bg-white"
            />
          </div>
        </div>

        {/* Mobile Phone */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Contact Number <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full h-10 pl-9 pr-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F4C3A] focus:bg-white"
            />
          </div>
        </div>

        {/* Enquiry Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Enquiry Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={enquiry}
            onChange={(e) => setEnquiry(e.target.value)}
            placeholder="e.g. Looking for groom wedding suit options and tailoring consultation..."
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F4C3A] focus:bg-white resize-none"
          />
        </div>

        {/* Store Branch */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Assigned Store Branch
          </label>
          <div className="relative">
            <Store className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <select
              value={isBranchUser ? (user?.branch_id || 'branch_1') : branch}
              disabled={isBranchUser}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F4C3A] focus:bg-white disabled:opacity-60"
            >
              <option value="branch_1">Branch 1 (Rajahmundry Main)</option>
              <option value="branch_2">Branch 2 (Kakinada)</option>
              <option value="branch_3">Branch 3 (Vijayawada)</option>
              <option value="branch_4">Branch 4 (Guntur)</option>
            </select>
          </div>
        </div>

        {/* Interest Tags */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Interest Tags (Comma separated)
          </label>
          <div className="relative">
            <Tag className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. Wedding Suit, Blazers, Raymond Fabric"
              className="w-full h-10 pl-9 pr-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F4C3A] focus:bg-white"
            />
          </div>
        </div>

        {/* Source & Priority */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Source
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as LeadSource)}
              className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F4C3A] focus:bg-white"
            >
              <option value="walk_in">Walk-in</option>
              <option value="website_chat">Website Chat</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="instagram">Instagram</option>
              <option value="referral">Referral</option>
              <option value="phone_call">Phone Call</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as LeadPriority)}
              className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F4C3A] focus:bg-white"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Follow-up Date */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Follow-up Date
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full h-10 pl-9 pr-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F4C3A] focus:bg-white"
            />
          </div>
        </div>

        {/* Consent Checkbox */}
        <div className="pt-2">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 rounded border-gray-300 text-[#0F4C3A] focus:ring-[#0F4C3A] h-4 w-4"
            />
            <span className="text-xs text-gray-700 leading-normal">
              Customer agreed to be contacted via WhatsApp for follow-ups and offer updates.
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isSubmitting}
            className="bg-[#0F4C3A] hover:bg-[#0B3B2E] text-white"
          >
            Create Lead
          </Button>
        </div>
      </form>
    </div>
  );
};
