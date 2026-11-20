import React, { useState, useMemo } from 'react';
import {
  X,
  Megaphone,
  CheckCircle2,
  AlertTriangle,
  Users,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { mockStorage } from '../../mocks/mockStorage.js';

/**
 * AddToAudienceModal
 * Enables Super Admin to add selected customers to a WhatsApp Campaign Audience,
 * enforcing Digital Personal Data Protection (DPDP) marketing consent rules.
 */
export default function AddToAudienceModal({
  isOpen,
  onClose,
  selectedCustomers,
  onConfirm,
}) {
  const [targetType, setTargetType] = useState('existing'); // 'existing' | 'new'
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [newCampaignName, setNewCampaignName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load active / draft / scheduled campaigns
  const campaigns = useMemo(() => {
    try {
      const all = mockStorage.getCampaigns();
      return all.filter(c => c.status !== 'Completed');
    } catch (e) {
      return [];
    }
  }, [isOpen]);

  // Set default campaign selection
  React.useEffect(() => {
    if (campaigns.length > 0 && !selectedCampaignId) {
      setSelectedCampaignId(campaigns[0].id);
    }
  }, [campaigns, selectedCampaignId]);

  // DPDP Consent Analysis
  const { consented, unconsented } = useMemo(() => {
    const consentedList = [];
    const unconsentedList = [];
    selectedCustomers.forEach(c => {
      if (c.consent) {
        consentedList.push(c);
      } else {
        unconsentedList.push(c);
      }
    });
    return { consented: consentedList, unconsented: unconsentedList };
  }, [selectedCustomers]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (consented.length === 0) return;
    setIsSubmitting(true);
    try {
      await onConfirm({
        consentedCustomers: consented,
        unconsentedCount: unconsented.length,
        mode: targetType,
        campaignId: targetType === 'existing' ? selectedCampaignId : null,
        newCampaignName: targetType === 'new' ? (newCampaignName || 'Custom Audience Campaign') : null,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 w-full max-w-lg overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-[#004F4C] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[#A8F0D0]">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">
                Add to WhatsApp Campaign Audience
              </h3>
              <p className="text-[11px] text-white/80">
                Audience segmentation with DPDP marketing consent protection
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Summary Breakdown Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#e6f7f2] border border-[#A8F0D0] rounded-xl p-3 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#10b981] text-white flex items-center justify-center font-bold text-xs shrink-0">
                ✓
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                  Eligible (Opted In)
                </p>
                <p className="text-base font-extrabold text-[#004F4C]">
                  {consented.length} <span className="text-xs font-normal text-slate-600">Customers</span>
                </p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                !
              </div>
              <div>
                <p className="text-[10px] text-amber-700 font-semibold uppercase tracking-wider">
                  Excluded (No Consent)
                </p>
                <p className="text-base font-extrabold text-amber-900">
                  {unconsented.length} <span className="text-xs font-normal text-amber-700">Customers</span>
                </p>
              </div>
            </div>
          </div>

          {/* Privacy Consent Warning Banner */}
          {unconsented.length > 0 && (
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3.5 space-y-2">
              <div className="flex items-start gap-2 text-amber-900 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">
                    DPDP Marketing Consent Protection Active
                  </p>
                  <p className="text-[11px] text-amber-800 mt-0.5 leading-snug">
                    {unconsented.length} selected customer(s) have opted out of promotional communications. They have been automatically filtered out and will not receive marketing messages.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 pt-1">
                {unconsented.slice(0, 4).map(u => (
                  <span
                    key={u.id}
                    className="px-2 py-0.5 rounded-md bg-white border border-amber-200 text-amber-900 text-[10px] font-medium"
                  >
                    {u.name} (Opted Out)
                  </span>
                ))}
                {unconsented.length > 4 && (
                  <span className="px-2 py-0.5 rounded-md bg-white border border-amber-200 text-amber-900 text-[10px] font-medium">
                    +{unconsented.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* No Consented Customers Alert */}
          {consented.length === 0 ? (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-center space-y-1">
              <p className="text-xs font-bold text-rose-800">
                No Eligible Opted-In Customers
              </p>
              <p className="text-[11px] text-rose-600">
                None of the selected customers have provided marketing consent. Under DPDP regulations, marketing campaign messages cannot be sent to these contacts.
              </p>
            </div>
          ) : (
            /* Destination Selection */
            <div className="space-y-3 pt-1">
              <label className="text-xs font-bold text-slate-800 block">
                Target Campaign Destination
              </label>

              <div className="space-y-2">
                {/* Existing Campaign Radio */}
                <div
                  onClick={() => setTargetType('existing')}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                    targetType === 'existing'
                      ? 'border-[#004F4C] bg-[#f0f9f7] ring-1 ring-[#004F4C]'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="targetCampaign"
                    checked={targetType === 'existing'}
                    onChange={() => setTargetType('existing')}
                    className="mt-1 text-[#004F4C] focus:ring-[#004F4C]"
                  />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-900">
                      Add to Existing WhatsApp Campaign
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Enrich an active or scheduled campaign audience with these contacts
                    </p>

                    {targetType === 'existing' && (
                      <div className="mt-2.5">
                        <select
                          value={selectedCampaignId}
                          onChange={e => setSelectedCampaignId(e.target.value)}
                          className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#004F4C]"
                        >
                          {campaigns.map(camp => (
                            <option key={camp.id} value={camp.id}>
                              {camp.name} ({camp.status} – {camp.audience?.toLocaleString()} audience)
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* New Campaign Draft Radio */}
                <div
                  onClick={() => setTargetType('new')}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                    targetType === 'new'
                      ? 'border-[#004F4C] bg-[#f0f9f7] ring-1 ring-[#004F4C]'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="targetCampaign"
                    checked={targetType === 'new'}
                    onChange={() => setTargetType('new')}
                    className="mt-1 text-[#004F4C] focus:ring-[#004F4C]"
                  />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-900">
                      Create New Draft Campaign Audience
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Initialize a new promotional campaign specifically for this targeted group
                    </p>

                    {targetType === 'new' && (
                      <div className="mt-2.5">
                        <input
                          type="text"
                          value={newCampaignName}
                          onChange={e => setNewCampaignName(e.target.value)}
                          placeholder="e.g. VIP Winter Offer Special"
                          className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#004F4C]"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>DPDP Consent Verified</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting || consented.length === 0}
              onClick={handleConfirm}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#004F4C] hover:bg-[#003d3a] transition-colors shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <span>Adding...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-[#A8F0D0]" />
                  <span>Confirm Addition ({consented.length})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
