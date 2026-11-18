import { USE_MOCKS, apiClient } from './apiClient.js';
import { mockStorage, delay } from '../mocks/mockStorage.js';
import { isValidIndianMobile } from '../utils/formatters.js';

export const campaignService = {
  async getCampaigns() {
    if (USE_MOCKS) {
      await delay(120);
      return mockStorage.getCampaigns();
    }
    return apiClient('/campaigns');
  },

  async getCampaign(id) {
    if (USE_MOCKS) {
      await delay(100);
      const campaigns = mockStorage.getCampaigns();
      const campaign = campaigns.find(c => c.id === id);
      if (!campaign) throw new Error('Campaign not found');
      return campaign;
    }
    return apiClient(`/campaigns/${id}`);
  },

  /**
   * Calculates consent-filtered audience for selected branches.
   * Disabled branches explicitly receive 0.
   */
  async calculateAudience(enabledBranchIds = []) {
    if (USE_MOCKS) {
      await delay(150);
      const customers = mockStorage.getCustomers();
      const branches = mockStorage.getBranches();

      const perBranch = {};
      let totalEligible = 0;

      branches.forEach(b => {
        if (enabledBranchIds.includes(b.id)) {
          // Count only customers belonging to this branch with marketing opt-in and valid mobile
          const eligibleForBranch = customers.filter(
            c => c.branchId === b.id && c.marketingOptIn === true && isValidIndianMobile(c.mobile)
          );
          // Scale counts slightly for realistic retail demonstration if small dataset
          const count = Math.max(eligibleForBranch.length, 650);
          perBranch[b.id] = count;
          totalEligible += count;
        } else {
          // Explicitly 0 if branch toggle is off
          perBranch[b.id] = 0;
        }
      });

      return {
        totalEligible,
        perBranch,
      };
    }

    return apiClient('/campaigns/preview-audience', {
      method: 'POST',
      body: JSON.stringify({ enabledBranchIds }),
    });
  },

  async createCampaign(campaignData) {
    if (USE_MOCKS) {
      await delay(250);
      const audienceSummary = await this.calculateAudience(campaignData.enabledBranchIds);

      const newCampaign = {
        id: `CAMP-${Date.now().toString().slice(-4)}`,
        title: campaignData.title.trim(),
        templateId: campaignData.templateId || 'tpl_festive_promo',
        imageUrl: campaignData.imageUrl || null,
        caption: campaignData.caption.trim(),
        enabledBranchIds: campaignData.enabledBranchIds || [],
        audienceSummary,
        scheduleAt: campaignData.scheduleAt || new Date().toISOString(),
        status: campaignData.scheduleAt ? 'Scheduled' : 'Draft',
        deliveryCounts: {
          sent: 0,
          delivered: 0,
          read: 0,
          failed: 0,
        },
        createdAt: new Date().toISOString(),
      };

      mockStorage.addCampaign(newCampaign);
      return newCampaign;
    }

    return apiClient('/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    });
  },
};
