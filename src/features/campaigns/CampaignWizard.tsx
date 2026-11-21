import React, { useState, useEffect } from 'react';
import {
  X,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Send,
  Clock,
  Loader2,
  Check,
} from 'lucide-react';
import {
  Branch,
  MessageTemplate,
  MediaAsset,
  Segment,
  CampaignType,
} from '@/types/models';
import { getBranches } from '@/services/branches';
import { getTemplates, getMedia, getSegments } from '@/services/content';
import {
  createCampaign,
  sendCampaign,
  previewCampaignAudience,
} from '@/services/campaigns';
import { Button } from '@/components/ui/Button';
import { Pill } from '@/components/ui/Pill';
import { Toggle } from '@/components/ui/Toggle';
import { cn } from '@/lib/utils';

export interface CampaignWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isBranchUser?: boolean;
  currentUserBranchId?: string | null;
}

type WizardStep = 1 | 2 | 3 | 4;

export const CampaignWizard: React.FC<CampaignWizardProps> = ({
  isOpen,
  onClose,
  onSuccess,
  isBranchUser,
  currentUserBranchId,
}) => {
  const [step, setStep] = useState<WizardStep>(1);

  // Reference data
  const [branches, setBranches] = useState<Branch[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [mediaList, setMediaList] = useState<MediaAsset[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);

  // Form State
  const [campaignName, setCampaignName] = useState('');
  const [campaignType, setCampaignType] = useState<CampaignType>('Promotional');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  // Branch Selection & Audience
  const [branchSelection, setBranchSelection] = useState<Record<string, boolean>>({});
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>('');

  const [audiencePreview, setAudiencePreview] = useState<{
    branchCounts: Record<string, number>;
    totalAudience: number;
    excludedNoConsent: number;
    excludedOptedOut: number;
    excludedInvalid: number;
  }>({
    branchCounts: {},
    totalAudience: 0,
    excludedNoConsent: 0,
    excludedOptedOut: 0,
    excludedInvalid: 0,
  });

  // Content State
  const [selectedMediaUrl, setSelectedMediaUrl] = useState('');
  const [variables, setVariables] = useState<Record<string, string>>({
    offer_text: 'Flat 20% OFF',
  });
  const [ctaText, setCtaText] = useState('Visit Nearest Store');
  const [ctaUrl, setCtaUrl] = useState('https://rsmensworld.com/stores');

  // Step 4 Review & Action
  const [actionType, setActionType] = useState<'send_now' | 'schedule'>('send_now');
  const [scheduledAt, setScheduledAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Load resources
  useEffect(() => {
    if (isOpen) {
      Promise.all([getBranches(), getTemplates(), getMedia(), getSegments()]).then(
        ([bList, tList, mList, sList]) => {
          const activeBranches = bList.filter((b) => b.is_active);
          setBranches(activeBranches);

          // Initial branch selection: if branch user, lock to theirs, else all ON
          const initialSelection: Record<string, boolean> = {};
          activeBranches.forEach((b) => {
            if (isBranchUser) {
              initialSelection[b.id] = b.id === currentUserBranchId;
            } else {
              initialSelection[b.id] = true;
            }
          });
          setBranchSelection(initialSelection);

          // Only approved templates
          const approved = tList.filter((t) => t.meta_status === 'Approved');
          setTemplates(approved);
          if (approved.length > 0) {
            setSelectedTemplateId(approved[0].id);
            setSelectedMediaUrl(approved[0].header_image_url || '');
            if (approved[0].cta_text) setCtaText(approved[0].cta_text);
            if (approved[0].cta_url) setCtaUrl(approved[0].cta_url);
          }

          setMediaList(mList);
          setSegments(sList);
        }
      );
      setStep(1);
      setCampaignName('');
      setFormError(null);
    }
  }, [isOpen, isBranchUser, currentUserBranchId]);

  // Recalculate audience whenever branchSelection or segment changes
  useEffect(() => {
    if (isOpen && Object.keys(branchSelection).length > 0) {
      previewCampaignAudience(branchSelection, selectedSegmentId || undefined)
        .then((prev) => {
          setAudiencePreview(prev);
        })
        .catch(() => {});
    }
  }, [branchSelection, selectedSegmentId, isOpen]);

  if (!isOpen) return null;

  const currentTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  // Substitute variables in preview
  const liveMessageBody = (currentTemplate?.body || '')
    .replace(/\{\{customer_name\}\}/g, 'Rahul Kumar')
    .replace(/\{\{branch_name\}\}/g, 'Rajahmundry Main Branch')
    .replace(/\{\{offer_text\}\}/g, variables.offer_text || 'Special Festival Offer');

  const handleToggleBranch = (branchId: string, val: boolean) => {
    if (isBranchUser) return;
    setBranchSelection((prev) => ({ ...prev, [branchId]: val }));
  };

  const handleStep1Proceed = () => {
    if (!campaignName.trim()) {
      setFormError('Please enter a campaign name');
      return;
    }
    if (!selectedTemplateId) {
      setFormError('Please select a WhatsApp message template');
      return;
    }
    setFormError(null);
    setStep(2);
  };

  const handleStep2Proceed = () => {
    const enabledCount = Object.values(branchSelection).filter(Boolean).length;
    if (enabledCount === 0) {
      setFormError('Please enable at least one branch for this campaign');
      return;
    }
    setFormError(null);
    setStep(3);
  };

  const handleStep3Proceed = () => {
    setFormError(null);
    setStep(4);
  };

  const handleFinalSubmit = async () => {
    if (actionType === 'schedule' && !scheduledAt) {
      setFormError('Please select a future date and time for scheduled send');
      return;
    }

    const enabledBranchIds = Object.keys(branchSelection).filter((id) => branchSelection[id]);

    setIsSubmitting(true);
    try {
      const created = await createCampaign({
        name: campaignName.trim(),
        type: campaignType,
        template_id: currentTemplate.id,
        template_name: currentTemplate.name,
        media_url: selectedMediaUrl || undefined,
        segment_id: selectedSegmentId || undefined,
        segment_name: segments.find((s) => s.id === selectedSegmentId)?.name,
        branches: enabledBranchIds,
        audience_count: audiencePreview.totalAudience,
        status: actionType === 'schedule' ? 'Scheduled' : 'Draft',
        scheduled_at: actionType === 'schedule' ? scheduledAt : undefined,
        variables,
      });

      if (actionType === 'send_now') {
        await sendCampaign(created.id);
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to launch campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-6 sm:pl-10">
        <div className="bg-white shadow-2xl flex flex-col h-full w-full sm:w-[940px] border-l border-border-card animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-border-card bg-[#F8FAFA]">
            <div>
              <h2 className="text-xl font-bold text-app-text tracking-tight">Create WhatsApp Campaign</h2>
              <p className="text-xs text-app-muted mt-0.5">
                Launch targeted WhatsApp broadcast marketing across retail store branches
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper bar matching 05-campaigns-wizard.png */}
          <div className="px-8 py-3 bg-white border-b border-border-card">
            <div className="flex items-center justify-between text-xs font-semibold max-w-md">
              {[
                { num: 1, label: 'Details' },
                { num: 2, label: 'Audience' },
                { num: 3, label: 'Content' },
                { num: 4, label: 'Review' },
              ].map((s) => (
                <div key={s.num} className="flex items-center gap-2">
                  <span
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                      step === s.num
                        ? 'bg-primary-brand text-white shadow-xs'
                        : step > s.num
                        ? 'bg-accent-brand text-[#0B3B2E]'
                        : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    {step > s.num ? '✓' : s.num}
                  </span>
                  <span className={step >= s.num ? 'text-app-text' : 'text-slate-400'}>
                    {s.label}
                  </span>
                  {s.num < 4 && <div className="w-8 h-0.5 bg-slate-200 ml-2" />}
                </div>
              ))}
            </div>
          </div>

          {/* Main 2-column layout: Left Form + Right Live Phone Preview */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Stepper forms (7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                {formError && (
                  <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* STEP 1: Details */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-app-text mb-1.5">
                        Campaign Name *
                      </label>
                      <input
                        type="text"
                        value={campaignName}
                        onChange={(e) => setCampaignName(e.target.value)}
                        placeholder="e.g. Winter Collection Launch"
                        className="w-full h-11 px-3.5 text-sm bg-white border border-border-card rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-brand"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-app-text mb-1.5">
                        Campaign Type *
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        {(['Promotional', 'Announcement', 'Loyalty', 'Greeting'] as CampaignType[]).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setCampaignType(t)}
                            className={cn(
                              'h-10 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-left flex items-center justify-between',
                              campaignType === t
                                ? 'border-primary-brand bg-primary-brand/5 text-primary-brand ring-1 ring-primary-brand'
                                : 'border-border-card bg-white text-slate-700 hover:bg-slate-50'
                            )}
                          >
                            <span>{t}</span>
                            {campaignType === t && <Check className="w-4 h-4 text-primary-brand" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-app-text mb-1.5">
                        Message Template * (Meta Approved)
                      </label>
                      <select
                        value={selectedTemplateId}
                        onChange={(e) => {
                          setSelectedTemplateId(e.target.value);
                          const t = templates.find((item) => item.id === e.target.value);
                          if (t) {
                            if (t.header_image_url) setSelectedMediaUrl(t.header_image_url);
                            if (t.cta_text) setCtaText(t.cta_text);
                            if (t.cta_url) setCtaUrl(t.cta_url);
                          }
                        }}
                        className="w-full h-11 px-3 text-sm bg-white border border-border-card rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-brand"
                      >
                        {templates.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.category})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* STEP 2: Audience (Independent ON/OFF per Branch) */}
                {step === 2 && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-semibold text-app-text mb-1.5">
                        Target Audience Segment (Optional)
                      </label>
                      <select
                        value={selectedSegmentId}
                        onChange={(e) => setSelectedSegmentId(e.target.value)}
                        className="w-full h-10 px-3 text-xs bg-white border border-border-card rounded-xl"
                      >
                        <option value="">All Opted-in Customers (No Segment Filter)</option>
                        {segments.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-bold text-app-text uppercase tracking-wider">
                          Select Branches (Independent ON/OFF)
                        </label>
                        <span className="text-[11px] text-app-muted">
                          Switched OFF branches receive 0 messages
                        </span>
                      </div>

                      {/* Branch rows with toggles matching screenshot */}
                      <div className="space-y-2.5">
                        {branches.map((b) => {
                          const isEnabled = Boolean(branchSelection[b.id]);
                          const count = audiencePreview.branchCounts[b.id] || 0;
                          return (
                            <div
                              key={b.id}
                              className={cn(
                                'flex items-center justify-between p-3.5 rounded-2xl border transition-all',
                                isEnabled
                                  ? 'bg-[#E6F7EF]/40 border-emerald-300'
                                  : 'bg-slate-50/60 border-border-card opacity-60'
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <Toggle
                                  checked={isEnabled}
                                  onChange={(val) => handleToggleBranch(b.id, val)}
                                />
                                <div>
                                  <span className="text-xs font-bold text-app-text block">
                                    {b.code} – {b.name}
                                  </span>
                                  <span className="text-[11px] text-app-muted">{b.city}</span>
                                </div>
                              </div>

                              <div className="text-right">
                                <span className="font-mono font-bold text-sm text-primary-brand block">
                                  {isEnabled ? count.toLocaleString() : '0'}
                                </span>
                                <span className="text-[10px] text-slate-500 uppercase font-semibold">
                                  Audience
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Exclusions Summary */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-border-card text-xs text-slate-600 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-slate-400" />
                        <span>Excluded from audience:</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] font-mono">
                        <span>No consent: <strong>{audiencePreview.excludedNoConsent}</strong></span>
                        <span>Opted-out: <strong>{audiencePreview.excludedOptedOut}</strong></span>
                        <span>Invalid: <strong>{audiencePreview.excludedInvalid}</strong></span>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Content */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-app-text mb-1.5">
                        Header Poster Image
                      </label>
                      <div className="grid grid-cols-3 gap-2.5 mb-2">
                        {mediaList.slice(0, 3).map((m) => (
                          <div
                            key={m.id}
                            onClick={() => setSelectedMediaUrl(m.storage_path)}
                            className={cn(
                              'relative h-20 rounded-xl overflow-hidden border-2 cursor-pointer transition-all',
                              selectedMediaUrl === m.storage_path
                                ? 'border-primary-brand ring-2 ring-primary-brand/20'
                                : 'border-transparent hover:border-slate-300'
                            )}
                          >
                            <img src={m.storage_path} alt={m.title} className="w-full h-full object-cover" />
                            {selectedMediaUrl === m.storage_path && (
                              <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary-brand text-white flex items-center justify-center">
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      <input
                        type="text"
                        value={selectedMediaUrl}
                        onChange={(e) => setSelectedMediaUrl(e.target.value)}
                        placeholder="Or paste custom image URL..."
                        className="w-full h-10 px-3 text-xs bg-white border border-border-card rounded-xl font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-app-text mb-1.5">
                        Offer Text / Dynamic Variable ({"{{offer_text}}"})
                      </label>
                      <input
                        type="text"
                        value={variables.offer_text || ''}
                        onChange={(e) => setVariables({ ...variables, offer_text: e.target.value })}
                        placeholder="e.g. Flat 20% OFF on Winter Jackets"
                        className="w-full h-10 px-3 text-sm bg-white border border-border-card rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-brand"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-app-text mb-1">
                          Call To Action (CTA) Button
                        </label>
                        <input
                          type="text"
                          value={ctaText}
                          onChange={(e) => setCtaText(e.target.value)}
                          placeholder="e.g. Visit Nearest Store"
                          className="w-full h-10 px-3 text-xs bg-white border border-border-card rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-app-text mb-1">
                          Destination URL
                        </label>
                        <input
                          type="text"
                          value={ctaUrl}
                          onChange={(e) => setCtaUrl(e.target.value)}
                          placeholder="https://rsmensworld.com/..."
                          className="w-full h-10 px-3 text-xs bg-white border border-border-card rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: Review */}
                {step === 4 && (
                  <div className="space-y-5">
                    {/* Summary Card */}
                    <div className="p-5 rounded-2xl bg-[#E6F7EF] border border-[#C6EED9] space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-primary-brand">{campaignName}</h4>
                        <Pill variant="green">{campaignType}</Pill>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-emerald-200/60 text-xs">
                        <div>
                          <span className="text-slate-600 block">Total Target Audience:</span>
                          <span className="text-xl font-black text-primary-brand mt-0.5 block">
                            {audiencePreview.totalAudience.toLocaleString()} customers
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600 block">Active Branches:</span>
                          <span className="font-mono font-bold text-slate-800 text-sm mt-1 block">
                            {branches
                              .filter((b) => branchSelection[b.id])
                              .map((b) => b.code)
                              .join(', ')}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 text-[11px] text-slate-600 italic">
                        Messaging charges billed by Meta (~₹0.78 per promotional conversation in India).
                      </div>
                    </div>

                    {/* Send Timing Toggle */}
                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-app-text uppercase tracking-wider">
                        Send Timing
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setActionType('send_now')}
                          className={cn(
                            'p-3.5 rounded-2xl border text-left cursor-pointer transition-all',
                            actionType === 'send_now'
                              ? 'border-primary-brand bg-primary-brand/5 ring-1 ring-primary-brand'
                              : 'border-border-card bg-white hover:bg-slate-50'
                          )}
                        >
                          <div className="flex items-center gap-2 font-bold text-xs text-app-text">
                            <Send className="w-4 h-4 text-primary-brand" />
                            <span>Send Immediately</span>
                          </div>
                          <span className="text-[11px] text-app-muted mt-1 block">
                            Broadcast to all enabled branches now
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActionType('schedule')}
                          className={cn(
                            'p-3.5 rounded-2xl border text-left cursor-pointer transition-all',
                            actionType === 'schedule'
                              ? 'border-primary-brand bg-primary-brand/5 ring-1 ring-primary-brand'
                              : 'border-border-card bg-white hover:bg-slate-50'
                          )}
                        >
                          <div className="flex items-center gap-2 font-bold text-xs text-app-text">
                            <Clock className="w-4 h-4 text-amber-600" />
                            <span>Schedule for Later</span>
                          </div>
                          <span className="text-[11px] text-app-muted mt-1 block">
                            Choose date and time for automatic release
                          </span>
                        </button>
                      </div>

                      {actionType === 'schedule' && (
                        <div className="p-4 rounded-xl bg-slate-50 border border-border-card animate-in fade-in">
                          <label className="block text-xs font-semibold text-app-text mb-1">
                            Schedule Date &amp; Time
                          </label>
                          <input
                            type="datetime-local"
                            value={scheduledAt}
                            onChange={(e) => setScheduledAt(e.target.value)}
                            className="w-full h-10 px-3 text-xs bg-white border border-border-card rounded-xl"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Live Phone Preview matching 05-campaigns-wizard.png (5 cols) */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Message Preview
                </span>

                {/* Mobile mockup */}
                <div className="w-[300px] rounded-[36px] bg-[#111B21] p-3 shadow-2xl border-[4px] border-slate-700 text-slate-800">
                  <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2" />

                  {/* Top Bar */}
                  <div className="bg-[#0B3B2E] text-white px-3 py-2 rounded-t-2xl flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-accent-brand flex items-center justify-center text-[#0B3B2E] font-bold text-xs flex-shrink-0">
                      RS
                    </div>
                    <div className="truncate flex-1">
                      <div className="text-xs font-bold leading-tight truncate">RS Mens World</div>
                      <div className="text-[10px] text-accent-brand leading-none">Verified Business</div>
                    </div>
                  </div>

                  {/* Chat Message Canvas */}
                  <div className="bg-[#EFEAE2] min-h-[380px] p-2.5 rounded-b-2xl flex flex-col justify-end">
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden text-xs max-w-[260px] border border-slate-100">
                      {selectedMediaUrl && (
                        <div className="h-32 bg-slate-100 overflow-hidden">
                          <img
                            src={selectedMediaUrl}
                            alt="Header"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      <div className="p-3 space-y-2">
                        <p className="text-slate-800 text-[11px] leading-relaxed whitespace-pre-wrap">
                          {liveMessageBody}
                        </p>

                        <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400">
                          <span>10:30 AM</span>
                          <span className="text-accent-brand font-bold">✓✓</span>
                        </div>
                      </div>

                      {ctaText && (
                        <div className="border-t border-slate-100 px-3 py-2 bg-slate-50/50 text-center">
                          <span className="text-xs font-semibold text-primary-brand flex items-center justify-center gap-1.5">
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>{ctaText}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="px-8 py-4 border-t border-border-card bg-slate-50/80 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => {
                if (step === 1) onClose();
                else setStep((prev) => (prev - 1) as WizardStep);
              }}
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </Button>

            <div className="flex items-center gap-2">
              {step === 1 && (
                <Button variant="primary" onClick={handleStep1Proceed} className="bg-primary-brand gap-1.5">
                  <span>Next: Audience</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
              {step === 2 && (
                <Button variant="primary" onClick={handleStep2Proceed} className="bg-primary-brand gap-1.5">
                  <span>Next: Content</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
              {step === 3 && (
                <Button variant="primary" onClick={handleStep3Proceed} className="bg-primary-brand gap-1.5">
                  <span>Next: Review</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
              {step === 4 && (
                <Button
                  variant="primary"
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="bg-primary-brand gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{actionType === 'send_now' ? 'Send Campaign Now' : 'Schedule Campaign'}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
