import React, { useState } from 'react';
import { X, RotateCcw, Check } from 'lucide-react';
import { LeadFilterOptions } from '@/types/models';
import { useAuth } from '@/features/auth/useAuth';
import { Button } from '@/components/ui/Button';

interface FilterLeadsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  filters: LeadFilterOptions;
  onApply: (newFilters: LeadFilterOptions) => void;
  onReset: () => void;
}

export const FilterLeadsPopover: React.FC<FilterLeadsPopoverProps> = ({
  isOpen,
  onClose,
  filters,
  onApply,
  onReset,
}) => {
  const { user } = useAuth();
  const isBranchUser = user?.role === 'branch_user';

  const [branch, setBranch] = useState(filters.branch_id || 'all');
  const [priority, setPriority] = useState<string>(filters.priority || 'all');
  const [source, setSource] = useState<string>(filters.source || 'all');
  const [followUp, setFollowUp] = useState<string>(filters.follow_up || 'all');

  if (!isOpen) return null;

  const handleApply = () => {
    onApply({
      ...filters,
      branch_id: (isBranchUser ? user?.branch_id : branch) || 'all',
      priority: priority as any,
      source: source as any,
      follow_up: followUp as any,
    });
    onClose();
  };

  const handleClear = () => {
    setBranch(isBranchUser ? user?.branch_id || 'all' : 'all');
    setPriority('all');
    setSource('all');
    setFollowUp('all');
    onReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 text-lg">Filter Leads</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Store Branch */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Store Branch
            </label>
            <select
              value={isBranchUser ? (user?.branch_id || 'all') : branch}
              disabled={isBranchUser}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full h-11 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F4C3A] focus:bg-white disabled:opacity-60"
            >
              <option value="all">All Branches</option>
              <option value="branch_1">Branch 1 (Rajahmundry Main)</option>
              <option value="branch_2">Branch 2 (Kakinada)</option>
              <option value="branch_3">Branch 3 (Vijayawada)</option>
              <option value="branch_4">Branch 4 (Guntur)</option>
            </select>
          </div>

          {/* Priority Segmented Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <div className="grid grid-cols-4 gap-1 p-1 bg-gray-100 rounded-xl border border-gray-200/60">
              {(['all', 'high', 'medium', 'low'] as const).map((p) => {
                const isActive = priority === p;
                const label = p === 'all' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                      isActive
                        ? 'bg-[#0F4C3A] text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Enquiry Source */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enquiry Source
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full h-11 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F4C3A] focus:bg-white"
            >
              <option value="all">All Sources</option>
              <option value="website_chat">Website Chat</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="walk_in">Walk-in</option>
              <option value="instagram">Instagram</option>
              <option value="referral">Referral</option>
              <option value="phone_call">Phone Call</option>
            </select>
          </div>

          {/* Follow-up Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Follow-up Date
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'all', label: 'All' },
                { id: 'overdue', label: 'Overdue' },
                { id: 'today', label: 'Today' },
                { id: 'this_week', label: 'This Week' },
              ].map((item) => {
                const isSel = followUp === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFollowUp(item.id)}
                    className={`py-2 px-1 text-xs font-medium rounded-xl border text-center transition-all ${
                      isSel
                        ? 'border-[#0F4C3A] bg-[#E6F7EF] text-[#0F4C3A] font-semibold'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Clear
          </button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleApply} className="bg-[#0F4C3A] hover:bg-[#0B3B2E] text-white">
              <Check className="w-4 h-4 mr-1.5" />
              Apply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
