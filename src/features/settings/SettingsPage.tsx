import React, { useState, useEffect } from 'react';
import {
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  Clock,
  ShieldCheck,
  Bot,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  History,
  Save,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { settingsService } from '@/services/settings';
import { PlatformSettings } from '@/types/models';
import { useNavigate } from 'react-router-dom';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const s = await settingsService.getSettings();
    setSettings(s);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    try {
      await settingsService.updateSettings(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDemoData = async () => {
    setIsResetting(true);
    try {
      await settingsService.resetDemoData();
      setShowResetConfirm(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
      setIsResetting(false);
    }
  };

  if (!settings) return null;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Platform Settings & Integrations
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Configure business identity, WhatsApp Cloud API connection, AI guardrails, and campaign dispatch rules
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/settings/audit')}
            className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl h-10 px-3.5 text-xs font-semibold shadow-2xs"
          >
            <History className="w-4 h-4 mr-1.5 text-gray-500" />
            Audit Log
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#0F4C3A] hover:bg-[#0B3B2E] text-white rounded-xl h-10 px-4 text-xs font-semibold shadow-2xs"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm font-semibold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          Platform settings successfully saved and applied.
        </div>
      )}

      {/* Row 1: Connection & AI Provider Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* WhatsApp Connection Status Card */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">WhatsApp Business Cloud API</h3>
                <p className="text-xs text-gray-500">Official Meta Verified Connection</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Connected
            </span>
          </div>

          <div className="bg-gray-50 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Phone Number:</span>
              <span className="font-mono font-semibold text-gray-900">
                {settings.whatsapp_connection.phone_number}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Display Name:</span>
              <span className="font-semibold text-gray-900">
                {settings.whatsapp_connection.display_name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Messaging Limit:</span>
              <span className="font-semibold text-emerald-800">
                {settings.whatsapp_connection.tier}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Business Verification:</span>
              <span className="font-semibold text-gray-900">Verified by Meta</span>
            </div>
          </div>
        </div>

        {/* AI Provider Status Card */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">AI Chat & Lead Classification</h3>
                <p className="text-xs text-gray-500">Dual Model Engine with Knowledge Grounding</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              Active
            </span>
          </div>

          <div className="bg-gray-50 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Language Model:</span>
              <span className="font-semibold text-gray-900">
                {settings.ai_provider.model_name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Knowledge Guardrail:</span>
              <span className="font-semibold text-emerald-800">Strict (No Hallucinations)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Stock & Price Rules:</span>
              <span className="font-semibold text-gray-900">Never promise stock or price</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Knowledge Base:</span>
              <button
                type="button"
                onClick={() => navigate('/chatbot')}
                className="text-[#0F4C3A] font-bold hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                Manage KB Articles
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Business Profile Form */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <Building2 className="w-4 h-4 text-[#0F4C3A]" />
          <h2 className="text-base font-bold text-gray-900">Business Profile & Identity</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Business Legal Name
            </label>
            <input
              type="text"
              value={settings.business_profile.name}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  business_profile: { ...settings.business_profile, name: e.target.value },
                })
              }
              className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0F4C3A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Brand Tagline</label>
            <input
              type="text"
              value={settings.business_profile.tagline}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  business_profile: { ...settings.business_profile, tagline: e.target.value },
                })
              }
              className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0F4C3A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Support Phone</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={settings.business_profile.support_phone}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    business_profile: {
                      ...settings.business_profile,
                      support_phone: e.target.value,
                    },
                  })
                }
                className="w-full h-10 pl-9 pr-3.5 rounded-xl border border-gray-200 text-xs font-mono font-medium text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0F4C3A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Support Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                value={settings.business_profile.support_email}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    business_profile: {
                      ...settings.business_profile,
                      support_email: e.target.value,
                    },
                  })
                }
                className="w-full h-10 pl-9 pr-3.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0F4C3A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Official Website
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={settings.business_profile.website}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    business_profile: { ...settings.business_profile, website: e.target.value },
                  })
                }
                className="w-full h-10 pl-9 pr-3.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0F4C3A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Head Office Address
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={settings.business_profile.address}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    business_profile: { ...settings.business_profile, address: e.target.value },
                  })
                }
                className="w-full h-10 pl-9 pr-3.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0F4C3A]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Settings Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <Clock className="w-4 h-4 text-[#0F4C3A]" />
          <h2 className="text-base font-bold text-gray-900">Campaign Dispatch & Compliance Rules</h2>
        </div>

        <div className="space-y-4">
          {/* Branch Campaign Authorisation Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <div className="text-xs font-bold text-gray-900">
                Allow Branch Users to Create Campaigns
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                When disabled, only Super Admins can compose and broadcast WhatsApp campaigns.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.campaign_settings.allow_branch_campaigns}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    campaign_settings: {
                      ...settings.campaign_settings,
                      allow_branch_campaigns: e.target.checked,
                    },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F4C3A]"></div>
            </label>
          </div>

          {/* Quiet Hours */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-gray-900">Enforce Quiet Hours (TRAI / DND)</div>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Block promotional marketing broadcasts during night hours to protect brand reputation
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.campaign_settings.quiet_hours_enabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      campaign_settings: {
                        ...settings.campaign_settings,
                        quiet_hours_enabled: e.target.checked,
                      },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F4C3A]"></div>
              </label>
            </div>

            {settings.campaign_settings.quiet_hours_enabled && (
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200/60">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Quiet Hours Start
                  </label>
                  <input
                    type="time"
                    value={settings.campaign_settings.quiet_hours_start}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        campaign_settings: {
                          ...settings.campaign_settings,
                          quiet_hours_start: e.target.value,
                        },
                      })
                    }
                    className="w-full h-9 px-3 rounded-xl border border-gray-200 text-xs text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Quiet Hours End
                  </label>
                  <input
                    type="time"
                    value={settings.campaign_settings.quiet_hours_end}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        campaign_settings: {
                          ...settings.campaign_settings,
                          quiet_hours_end: e.target.value,
                        },
                      })
                    }
                    className="w-full h-9 px-3 rounded-xl border border-gray-200 text-xs text-gray-900 bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Default Consent Source */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Default Opt-in Source
            </label>
            <select
              value={settings.campaign_settings.default_consent_source}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  campaign_settings: {
                    ...settings.campaign_settings,
                    default_consent_source: e.target.value,
                  },
                })
              }
              className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-[#0F4C3A]"
            >
              <option value="petpooja_pos">Petpooja POS Billing Checkout</option>
              <option value="in_store_walkin">In-Store Walk-in Registration</option>
              <option value="website_chat_widget">Website Assistant Opt-in</option>
              <option value="qr_loyalty_scan">Branch QR Loyalty Sign-up</option>
            </select>
          </div>
        </div>
      </div>

      {/* Danger Zone: Demo Reset */}
      <div className="bg-rose-50/50 rounded-2xl border border-rose-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-600" />
          <h2 className="text-base font-bold text-rose-900">Demo Environment & Factory Reset</h2>
        </div>
        <p className="text-xs text-rose-700 leading-relaxed">
          Restore the initial mock state with fresh customer records, campaign statistics, leads, and
          conversations across the 4 retail branches. All temporary localStorage changes will be
          reset to initial seed data.
        </p>

        <Button
          type="button"
          variant="outline"
          onClick={() => setShowResetConfirm(true)}
          className="border-rose-300 text-rose-700 hover:bg-rose-100 hover:text-rose-900 rounded-xl h-10 px-4 text-xs font-semibold cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 mr-1.5" />
          Reset Demo Data to Factory State
        </Button>
      </div>

      {/* Confirm Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-gray-900">Reset Demo Data?</h3>
              <p className="text-xs text-gray-500">
                This will clear local storage and re-seed 200 customers, 60 leads, 12 campaigns, and 15
                conversations for demo testing.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResetConfirm(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleResetDemoData}
                disabled={isResetting}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold"
              >
                {isResetting ? 'Resetting...' : 'Yes, Reset Demo Data'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
