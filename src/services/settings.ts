import { PlatformSettings } from '@/types/models';
import { auditService } from './audit';

const SETTINGS_STORAGE_KEY = 'rs_platform_settings';

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  business_profile: {
    name: 'RS Mens World',
    tagline: 'Multi-Branch Retail & Premium Menswear',
    support_phone: '+91 98490 12345',
    support_email: 'care@rsmensworld.com',
    website: 'https://rsmensworld.com',
    address: 'Main Road, Danavaipeta, Rajahmundry, Andhra Pradesh 533103',
    logo_url: '/images/logo-hanger.svg',
  },
  campaign_settings: {
    allow_branch_campaigns: false,
    quiet_hours_enabled: true,
    quiet_hours_start: '21:00',
    quiet_hours_end: '09:00',
    default_consent_source: 'petpooja_pos',
  },
  chat_settings: {
    ai_enabled: true,
    online_status: 'online',
    welcome_message: 'Hello! Welcome to RS Mens World. How can we help you today with our menswear collections?',
    offline_message: 'Our retail branches are currently closed. Our store hours are 10:00 AM to 9:30 PM.',
    handover_message: 'I am connecting you with our store styling specialist right away.',
    disclaimer_text: 'AI Assistant cannot confirm real-time floor stock or custom discount promises.',
  },
  whatsapp_connection: {
    status: 'connected',
    phone_number: '+91 98490 12345',
    display_name: 'RS Mens World Official',
    verified: true,
    tier: 'Tier 2 (50k msgs/day)',
    last_synced_at: new Date().toISOString(),
  },
  ai_provider: {
    status: 'connected',
    provider_name: 'Anthropic Claude / Google Gemini',
    model_name: 'Gemini 1.5 Pro & Claude 3.5 Sonnet Hybrid',
    guardrail_strictness: 'high',
    temperature: 0.2,
    max_tokens: 500,
    last_ping: new Date().toISOString(),
  },
};

export const settingsService = {
  getSettings: async (): Promise<PlatformSettings> => {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_PLATFORM_SETTINGS));
      return DEFAULT_PLATFORM_SETTINGS;
    }
    try {
      return JSON.parse(raw) as PlatformSettings;
    } catch {
      return DEFAULT_PLATFORM_SETTINGS;
    }
  },

  updateSettings: async (updates: Partial<PlatformSettings>): Promise<PlatformSettings> => {
    const current = await settingsService.getSettings();
    const updated: PlatformSettings = {
      ...current,
      ...updates,
      business_profile: {
        ...current.business_profile,
        ...(updates.business_profile || {}),
      },
      campaign_settings: {
        ...current.campaign_settings,
        ...(updates.campaign_settings || {}),
      },
      chat_settings: {
        ...current.chat_settings,
        ...(updates.chat_settings || {}),
      },
    };

    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    await auditService.logAction(
      'settings_update',
      'settings',
      'Updated platform configuration, business profile and campaign rules'
    );
    return updated;
  },

  resetDemoData: async (): Promise<void> => {
    // Collect and remove all app localStorage keys
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith('rs_') ||
          key.startsWith('rs_mock_') ||
          key === 'auth_token' ||
          key === 'rs_current_user')
      ) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((k) => localStorage.removeItem(k));

    // Audit the reset
    localStorage.setItem(
      'rs_audit_logs',
      JSON.stringify([
        {
          id: 'AUD-RESET',
          user_id: 'sys',
          user_name: 'System Admin',
          user_role: 'super_admin',
          action: 'demo_reset',
          entity: 'settings',
          branch_id: 'all',
          branch_name: 'All Branches',
          details: 'Demo data factory reset triggered by administrator',
          created_at: new Date().toISOString(),
        },
      ])
    );
  },
};
