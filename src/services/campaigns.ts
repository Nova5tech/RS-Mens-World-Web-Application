import { apiClient } from '@/lib/apiClient';
import { MockStorage } from '@/mocks/mockAdapter';
import { INITIAL_CAMPAIGNS, INITIAL_CAMPAIGN_SETTINGS } from '@/mocks/data/campaigns';
import {
  Campaign,
  CampaignMessage,
  CampaignSettings,
  CampaignStats,
  MessageDeliveryStatus,
} from '@/types/models';
import { customersStorage } from '@/services/customers';
import { branchesStorage } from '@/services/branches';
import { segmentsStorage } from '@/services/content';
import { getCurrentUser } from '@/services/auth';

export const campaignsStorage = new MockStorage<Campaign>('campaigns', INITIAL_CAMPAIGNS);
export const campaignSettingsStorage = new MockStorage<{ id: string; settings: CampaignSettings }>(
  'campaign_settings',
  [{ id: 'default', settings: INITIAL_CAMPAIGN_SETTINGS }]
);
export const campaignMessagesStorage = new MockStorage<CampaignMessage>('campaign_messages', []);

export const isUsingMocks = import.meta.env.VITE_USE_MOCKS !== 'false';

export interface CampaignQueryParams {
  branchId?: string;
  status?: string;
  search?: string;
}

export async function getCampaigns(params: CampaignQueryParams = {}): Promise<Campaign[]> {
  const currentUser = await getCurrentUser();

  if (isUsingMocks) {
    let all = await campaignsStorage.getAll();

    // Branch isolation: branch_user only sees campaigns released to their branch
    if (currentUser?.role === 'branch_user' && currentUser.branch_id) {
      all = all.filter((c) => c.branches.includes(currentUser.branch_id!));
    } else if (params.branchId && params.branchId !== 'all') {
      all = all.filter((c) => c.branches.includes(params.branchId!));
    }

    if (params.status && params.status !== 'all') {
      all = all.filter((c) => c.status.toLowerCase() === params.status?.toLowerCase());
    }

    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      all = all.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
    }

    all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return all;
  }

  const response = await apiClient.get<Campaign[]>('/campaigns', { params });
  return response.data;
}

export async function getCampaignStats(branchId?: string): Promise<CampaignStats> {
  const campaigns = await getCampaigns({ branchId });

  let totalMessagesSent = 0;
  let totalDelivered = 0;
  let totalRead = 0;
  let totalFailed = 0;

  campaigns.forEach((c) => {
    if (c.stats) {
      totalMessagesSent += c.stats.sent;
      totalDelivered += c.stats.delivered;
      totalRead += c.stats.read;
      totalFailed += c.stats.failed;
    }
  });

  return {
    total: campaigns.length,
    sent: totalMessagesSent || 23510,
    delivered: totalMessagesSent > 0 ? Math.round((totalDelivered / totalMessagesSent) * 1000) / 10 : 97.4,
    read: totalDelivered > 0 ? Math.round((totalRead / totalDelivered) * 1000) / 10 : 84.2,
    failed: totalFailed || 210,
  };
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
  if (isUsingMocks) {
    return campaignsStorage.getById(id);
  }
  const response = await apiClient.get<Campaign>(`/campaigns/${id}`);
  return response.data;
}

export async function previewCampaignAudience(
  branchSelection: Record<string, boolean>,
  segmentId?: string
): Promise<{
  branchCounts: Record<string, number>;
  totalAudience: number;
  excludedNoConsent: number;
  excludedOptedOut: number;
  excludedInvalid: number;
}> {
  if (isUsingMocks) {
    const allCustomers = await customersStorage.getAll();
    const branches = await branchesStorage.getAll();
    const segment = segmentId ? await segmentsStorage.getById(segmentId) : null;

    const branchCounts: Record<string, number> = {};
    branches.forEach((b) => {
      branchCounts[b.id] = 0;
    });

    let totalAudience = 0;
    let excludedNoConsent = 0;
    let excludedOptedOut = 0;
    let excludedInvalid = 0;

    allCustomers.forEach((c) => {
      const isBranchEnabled = Boolean(branchSelection[c.branch_id]);
      if (!isBranchEnabled) return;

      if (!c.phone || c.phone.length < 10) {
        excludedInvalid++;
        return;
      }
      if (c.opted_out_at) {
        excludedOptedOut++;
        return;
      }
      if (!c.consent) {
        excludedNoConsent++;
        return;
      }

      // Check segment rules if segment was chosen
      if (segment) {
        const rules = segment.rules_json;
        if (rules.branch_id && rules.branch_id !== 'all' && c.branch_id !== rules.branch_id) return;
        if (rules.customer_type && rules.customer_type !== 'all' && c.customer_type !== rules.customer_type) return;
        if (rules.customer_status && rules.customer_status !== 'all' && c.status !== rules.customer_status) return;
        if (rules.birthday_month) {
          if (!c.birthday) return;
          const m = new Date(c.birthday).getMonth() + 1;
          if (m !== rules.birthday_month) return;
        }
      }

      branchCounts[c.branch_id] = (branchCounts[c.branch_id] || 0) + 1;
      totalAudience++;
    });

    return {
      branchCounts,
      totalAudience,
      excludedNoConsent,
      excludedOptedOut,
      excludedInvalid,
    };
  }

  const response = await apiClient.post('/campaigns/audience-preview', {
    branchSelection,
    segmentId,
  });
  return response.data;
}

export async function createCampaign(data: Partial<Campaign>): Promise<Campaign> {
  const branches = await branchesStorage.getAll();
  const enabledBranches = branches.filter((b) => data.branches?.includes(b.id));
  const idNum = Math.floor(100 + Math.random() * 900);

  const newCampaign: Campaign = {
    id: `cmp_${idNum}`,
    code: `CMP-${idNum}`,
    name: data.name || 'Untitled Campaign',
    type: data.type || 'Promotional',
    template_id: data.template_id || '',
    template_name: data.template_name,
    media_id: data.media_id,
    media_url: data.media_url,
    segment_id: data.segment_id,
    segment_name: data.segment_name,
    branches: data.branches || [],
    branch_codes: enabledBranches.map((b) => b.code),
    audience_count: data.audience_count || 0,
    status: data.status || 'Draft',
    scheduled_at: data.scheduled_at,
    created_at: new Date().toISOString(),
    created_by: 'Super Admin',
    variables: data.variables,
  };

  if (isUsingMocks) {
    return campaignsStorage.insert(newCampaign);
  }

  const response = await apiClient.post<Campaign>('/campaigns', newCampaign);
  return response.data;
}

export async function sendCampaign(id: string): Promise<Campaign | null> {
  if (isUsingMocks) {
    const campaign = await campaignsStorage.getById(id);
    if (!campaign) throw new Error('Campaign not found');

    const allCustomers = await customersStorage.getAll();
    const branches = await branchesStorage.getAll();

    // Eligible recipients from switched ON branches with consent and no opt-out
    const recipients = allCustomers.filter(
      (c) =>
        campaign.branches.includes(c.branch_id) &&
        c.consent &&
        !c.opted_out_at &&
        c.phone
    );

    const messages: CampaignMessage[] = recipients.map((r, i) => {
      const bObj = branches.find((b) => b.id === r.branch_id);
      return {
        id: `msg_${campaign.id}_${i}`,
        campaign_id: campaign.id,
        customer_id: r.id,
        customer_name: r.name,
        phone: r.phone,
        branch_id: r.branch_id,
        branch_code: bObj?.code || 'B1',
        status: 'queued',
      };
    });

    for (const msg of messages) {
      await campaignMessagesStorage.insert(msg);
    }

    // Set sending status
    await campaignsStorage.update(id, {
      status: 'Sending',
      sent_at: new Date().toISOString(),
      audience_count: recipients.length,
      stats: {
        total: recipients.length,
        sent: recipients.length,
        delivered: 0,
        read: 0,
        failed: 0,
      },
    });

    // Simulate sending progression asynchronously (10 seconds)
    setTimeout(async () => {
      const allMsgs = await campaignMessagesStorage.getAll();
      const thisCampaignMsgs = allMsgs.filter((m) => m.campaign_id === id);

      let delivered = 0;
      let read = 0;
      let failed = 0;

      for (let i = 0; i < thisCampaignMsgs.length; i++) {
        const isFailed = i % 25 === 0; // ~4% failed
        const newStatus: MessageDeliveryStatus = isFailed ? 'failed' : i % 3 === 0 ? 'read' : 'delivered';

        if (isFailed) failed++;
        else {
          delivered++;
          if (newStatus === 'read') read++;
        }

        await campaignMessagesStorage.update(thisCampaignMsgs[i].id, {
          status: newStatus,
          sent_at: new Date(Date.now() - 5000).toISOString(),
          delivered_at: !isFailed ? new Date().toISOString() : undefined,
          read_at: newStatus === 'read' ? new Date().toISOString() : undefined,
          error: isFailed ? 'Number not on WhatsApp' : undefined,
        });
      }

      await campaignsStorage.update(id, {
        status: 'Sent',
        stats: {
          total: recipients.length,
          sent: recipients.length,
          delivered,
          read,
          failed,
        },
      });
    }, 4000);

    return campaignsStorage.getById(id);
  }

  const response = await apiClient.post<Campaign>(`/campaigns/${id}/send`);
  return response.data;
}

export async function scheduleCampaign(id: string, scheduledAt: string): Promise<Campaign | null> {
  if (isUsingMocks) {
    return campaignsStorage.update(id, {
      status: 'Scheduled',
      scheduled_at: scheduledAt,
    });
  }
  const response = await apiClient.post<Campaign>(`/campaigns/${id}/schedule`, { scheduledAt });
  return response.data;
}

export async function cancelCampaign(id: string): Promise<Campaign | null> {
  if (isUsingMocks) {
    return campaignsStorage.update(id, {
      status: 'Draft',
      scheduled_at: null,
    });
  }
  const response = await apiClient.post<Campaign>(`/campaigns/${id}/cancel`);
  return response.data;
}

export async function deleteCampaign(id: string): Promise<boolean> {
  if (isUsingMocks) {
    return campaignsStorage.delete(id);
  }
  await apiClient.delete(`/campaigns/${id}`);
  return true;
}

export async function getCampaignMessages(
  campaignId: string,
  statusFilter?: string
): Promise<CampaignMessage[]> {
  if (isUsingMocks) {
    const all = await campaignMessagesStorage.getAll();
    let msgs = all.filter((m) => m.campaign_id === campaignId);
    if (statusFilter && statusFilter !== 'all') {
      msgs = msgs.filter((m) => m.status === statusFilter);
    }
    return msgs;
  }
  const response = await apiClient.get<CampaignMessage[]>(`/campaigns/${campaignId}/messages`, {
    params: { status: statusFilter },
  });
  return response.data;
}

export async function retryFailedCampaign(campaignId: string): Promise<void> {
  if (isUsingMocks) {
    const all = await campaignMessagesStorage.getAll();
    const failed = all.filter((m) => m.campaign_id === campaignId && m.status === 'failed');
    for (const msg of failed) {
      await campaignMessagesStorage.update(msg.id, {
        status: 'delivered',
        error: undefined,
        delivered_at: new Date().toISOString(),
      });
    }
    const camp = await campaignsStorage.getById(campaignId);
    if (camp && camp.stats) {
      await campaignsStorage.update(campaignId, {
        stats: {
          ...camp.stats,
          delivered: camp.stats.delivered + failed.length,
          failed: Math.max(0, camp.stats.failed - failed.length),
        },
      });
    }
    return;
  }
  await apiClient.post(`/campaigns/${campaignId}/retry-failed`);
}

export async function getCampaignSettings(): Promise<CampaignSettings> {
  if (isUsingMocks) {
    const record = await campaignSettingsStorage.getById('default');
    return record?.settings || INITIAL_CAMPAIGN_SETTINGS;
  }
  const response = await apiClient.get<CampaignSettings>('/settings/campaigns');
  return response.data;
}

export async function updateCampaignSettings(settings: CampaignSettings): Promise<CampaignSettings> {
  if (isUsingMocks) {
    await campaignSettingsStorage.update('default', { settings });
    return settings;
  }
  const response = await apiClient.patch<CampaignSettings>('/settings/campaigns', settings);
  return response.data;
}
