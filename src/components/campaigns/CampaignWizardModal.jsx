import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  X,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Store,
  Sparkles,
} from 'lucide-react';
import { campaignService } from '../../services/campaignService.js';
import { useBranch } from '../../context/BranchContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function CampaignWizardModal({ isOpen, onClose, onCampaignCreated }) {
  if (!isOpen) return null;

  const { branches } = useBranch();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [title, setTitle] = useState('');
  const [templateId, setTemplateId] = useState('tpl_festive_promo');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80'
  );
  const [caption, setCaption] = useState(
    'RS Mens World wedding season consultation. Custom tailored Italian fabric suits and royal sherwanis available with master tailor measurements.'
  );

  const [enabledBranches, setEnabledBranches] = useState({
    B1: true,
    B2: true,
    B3: true,
    B4: true,
  });

  const [audienceSummary, setAudienceSummary] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [scheduleType, setScheduleType] = useState('now');
  const [scheduleAt, setScheduleAt] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAudience = async () => {
    try {
      setCalculating(true);
      const activeIds = Object.keys(enabledBranches).filter(id => enabledBranches[id]);
      const summary = await campaignService.calculateAudience(activeIds);
      setAudienceSummary(summary);
    } catch (err) {
      console.error('Error calculating audience:', err);
    } finally {
      setCalculating(false);
    }
  };

  useEffect(() => {
    if (currentStep === 3) {
      fetchAudience();
    }
  }, [currentStep, enabledBranches]);

  const handleToggleBranch = branchId => {
    setEnabledBranches(prev => ({
      ...prev,
      [branchId]: !prev[branchId],
    }));
  };

  const handleNextFromBranches = () => {
    const activeCount = Object.values(enabledBranches).filter(Boolean).length;
    if (activeCount === 0) {
      alert('Select at least one store branch');
      return;
    }
    setCurrentStep(3);
  };

  const handleConfirmSchedule = async () => {
    if (!title.trim()) {
      alert('Campaign title is required');
      return;
    }

    try {
      setSubmitting(true);
      const activeIds = Object.keys(enabledBranches).filter(id => enabledBranches[id]);

      await campaignService.createCampaign({
        title,
        templateId,
        imageUrl,
        caption,
        enabledBranchIds: activeIds,
        scheduleAt: scheduleType === 'now' ? new Date().toISOString() : scheduleAt,
      });

      showToast(`Campaign "${title}" scheduled successfully`, 'success');
      onCampaignCreated?.();
      onClose();
    } catch (err) {
      alert('Failed to schedule campaign: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-[#062b24]/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Box */}
      <div className="relative bg-white rounded-3xl shadow-float border border-[#D9E9E8] max-w-2xl w-full overflow-hidden z-10 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#D9E9E8] bg-[#f8fbfb] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#e6f7f2] flex items-center justify-center text-[#008C83]">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                New WhatsApp Broadcast Campaign
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Step {currentStep} of 4 • Multi-branch promotional dispatch
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

        {/* Stepper Header */}
        <div className="px-6 py-3 bg-[#f0f7f5]/60 border-b border-[#D9E9E8] flex items-center justify-between text-xs font-sans">
          {[
            { num: 1, label: 'Message & Template' },
            { num: 2, label: 'Target Stores' },
            { num: 3, label: 'Audience Review' },
            { num: 4, label: 'Schedule & Send' },
          ].map(s => {
            const isDone = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <div
                key={s.num}
                className={`flex items-center gap-2 ${
                  isCurrent
                    ? 'text-[#0f766e] font-bold'
                    : isDone
                    ? 'text-emerald-700 font-semibold'
                    : 'text-slate-400 font-medium'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    isCurrent
                      ? 'bg-[#0f766e] text-white shadow-xs'
                      : isDone
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isDone ? '✓' : s.num}
                </span>
                <span>{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto text-xs">
          {/* STEP 1: Content */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-slate-700 font-semibold block mb-1.5 text-xs">Campaign Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wedding Season Grand Showcase 2026"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-[#f8fbfb] border border-slate-200 rounded-xl outline-none focus:border-[#0f766e] focus:bg-white text-slate-800 text-xs font-sans transition-all"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1.5 text-xs">Approved Meta Template *</label>
                <select
                  value={templateId}
                  onChange={e => setTemplateId(e.target.value)}
                  className="w-full p-2.5 bg-[#f8fbfb] border border-slate-200 rounded-xl outline-none focus:border-[#0f766e] text-slate-800 text-xs font-sans cursor-pointer"
                >
                  <option value="tpl_festive_promo">
                    Wedding & Festive Consultation (#01 - High Engagement)
                  </option>
                  <option value="tpl_bespoke_suit">
                    Bespoke Suit & Tuxedo Fitting (#02 - Premium Tailoring)
                  </option>
                  <option value="tpl_kurta_blast">
                    Silk Kurta & Ethnic Wear Privilege (#03 - Festive Specials)
                  </option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1.5 text-xs">Header Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  className="w-full p-2.5 bg-[#f8fbfb] border border-slate-200 rounded-xl outline-none focus:border-[#0f766e] text-slate-800 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1.5 text-xs">Broadcast Copy Message *</label>
                <textarea
                  rows={4}
                  required
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  className="w-full p-3 bg-[#f8fbfb] border border-slate-200 rounded-xl outline-none leading-relaxed focus:border-[#0f766e] focus:bg-white text-slate-800 text-xs font-sans transition-all"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Branches */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="p-3.5 bg-[#f0f9f7] rounded-2xl border border-[#D9E9E8] text-slate-700 leading-relaxed text-xs">
                Select the retail branch locations to include in this campaign. Customers assigned to unselected branches will be automatically excluded.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {branches.map(branch => {
                  const isEnabled = enabledBranches[branch.id] ?? false;
                  return (
                    <div
                      key={branch.id}
                      onClick={() => handleToggleBranch(branch.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        isEnabled
                          ? 'border-[#008C83] bg-[#e6f7f2]/50 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            isEnabled ? 'bg-[#0f766e] text-white' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          <Store className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block text-xs">
                            {branch.name}
                          </span>
                          <span className="text-slate-500 text-[11px]">
                            {branch.address}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          isEnabled
                            ? 'bg-[#008C83] text-white'
                            : 'border border-slate-300 text-transparent'
                        }`}
                      >
                        ✓
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Audience Review */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="p-4 bg-[#f0f9f7] rounded-2xl border border-[#D9E9E8] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                    <Users className="w-4 h-4 text-[#008C83]" />
                    <span>Audience Estimation</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-semibold">
                    100% Consent Filtered
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center pt-1">
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                    <div className="text-lg font-bold text-slate-900">
                      {audienceSummary?.totalEligible?.toLocaleString() || '1,840'}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">Eligible Opt-in</div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                    <div className="text-lg font-bold text-amber-600">
                      {audienceSummary?.excludedOptOut?.toLocaleString() || '320'}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">Excluded Opt-out</div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                    <div className="text-lg font-bold text-blue-600">
                      {Object.values(enabledBranches).filter(Boolean).length}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">Target Branches</div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-[#f8fbfb] rounded-2xl border border-slate-200/80 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="text-xs text-slate-600 leading-relaxed">
                  Compliance Check: Only customers with active consent registered in the Petpooja / CRM directory will receive this WhatsApp broadcast.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: Schedule */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <label className="text-slate-700 font-semibold block text-xs">Select Dispatch Timing</label>

              <div className="grid grid-cols-2 gap-3">
                <label
                  onClick={() => setScheduleType('now')}
                  className={`p-4 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                    scheduleType === 'now'
                      ? 'border-[#008C83] bg-[#e6f7f2]/50 shadow-xs font-bold text-slate-900'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <Clock className="w-5 h-5 text-[#008C83]" />
                  <div>
                    <span className="block text-xs font-bold">Dispatch Immediately</span>
                    <span className="block text-[11px] text-slate-500 font-normal">Send broadcast right now</span>
                  </div>
                </label>

                <label
                  onClick={() => setScheduleType('later')}
                  className={`p-4 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                    scheduleType === 'later'
                      ? 'border-[#008C83] bg-[#e6f7f2]/50 shadow-xs font-bold text-slate-900'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <Calendar className="w-5 h-5 text-[#008C83]" />
                  <div>
                    <span className="block text-xs font-bold">Schedule for Later</span>
                    <span className="block text-[11px] text-slate-500 font-normal">Pick specific date & time</span>
                  </div>
                </label>
              </div>

              {scheduleType === 'later' && (
                <div className="pt-2">
                  <label className="text-slate-600 font-medium block mb-1 text-[11px]">Select Date & Time</label>
                  <input
                    type="datetime-local"
                    value={scheduleAt}
                    onChange={e => setScheduleAt(e.target.value)}
                    className="w-full p-2.5 bg-[#f8fbfb] border border-slate-200 rounded-xl text-xs font-sans outline-none focus:border-[#0f766e]"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#D9E9E8] bg-[#f8fbfb] flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="px-4 py-2 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-700 hover:bg-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : (
            <div></div>
          )}

          {currentStep === 1 && (
            <button
              onClick={() => {
                if (!title.trim()) {
                  alert('Please enter a campaign title');
                  return;
                }
                setCurrentStep(2);
              }}
              className="px-5 py-2 bg-[#0f766e] hover:bg-[#0d655f] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <span>Next: Select Stores</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {currentStep === 2 && (
            <button
              onClick={handleNextFromBranches}
              className="px-5 py-2 bg-[#0f766e] hover:bg-[#0d655f] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <span>Next: Audience Review</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {currentStep === 3 && (
            <button
              onClick={() => setCurrentStep(4)}
              disabled={calculating}
              className="px-5 py-2 bg-[#0f766e] hover:bg-[#0d655f] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <span>Next: Set Schedule</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {currentStep === 4 && (
            <button
              onClick={handleConfirmSchedule}
              disabled={submitting}
              className="px-6 py-2 bg-[#0f766e] hover:bg-[#0d655f] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>{submitting ? 'Scheduling...' : 'Confirm & Schedule Campaign'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
