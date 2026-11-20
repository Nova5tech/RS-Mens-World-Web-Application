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
      await delay(80);
      const branchBaseCounts = {
        B1: 7850,
        B2: 6920,
        B3: 6760,
        B4: 3030,
      };

      const perBranch = {};
      let totalEligible = 0;

      ['B1', 'B2', 'B3', 'B4'].forEach(bId => {
        if (enabledBranchIds.includes(bId)) {
          const count = branchBaseCounts[bId] || 5000;
          perBranch[bId] = count;
          totalEligible += count;
        } else {
          perBranch[bId] = 0;
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
      await delay(200);
      const audienceSummary = await this.calculateAudience(campaignData.enabledBranchIds || campaignData.branches);
      const branchList = campaignData.branches || campaignData.enabledBranchIds || ['B1'];
      const branchDisplay = branchList.sort().join(', ');

      const perBranchDelivery = {};
      branchList.forEach(bId => {
        const bAud = audienceSummary.perBranch[bId] || 0;
        perBranchDelivery[bId] = {
          sent: campaignData.status === 'Sent' ? bAud : 0,
          delivered: campaignData.status === 'Sent' ? Math.round(bAud * 0.98) : 0,
          read: campaignData.status === 'Sent' ? Math.round(bAud * 0.84) : 0,
          failed: campaignData.status === 'Sent' ? Math.round(bAud * 0.02) : 0,
        };
      });

      const newCampaign = {
        id: `CAMP-${Date.now().toString().slice(-3)}`,
        name: campaignData.name || campaignData.title || 'Untitled Campaign',
        title: campaignData.name || campaignData.title || 'Untitled Campaign',
        type: campaignData.type || 'Promotional',
        branches: branchList,
        branchesDisplay: branchDisplay,
        audience: audienceSummary.totalEligible || 21530,
        branchAudience: audienceSummary.perBranch || {},
        status: campaignData.status || (campaignData.scheduleAt ? 'Scheduled' : 'Draft'),
        date: campaignData.status === 'Draft' ? '—' : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        template: campaignData.template || 'Product Announcement',
        imageUrl: campaignData.imageUrl || 'https://images.unsplash.com/photo-1620012253295-c15c429f66bf?auto=format&fit=crop&w=300&q=80',
        caption: campaignData.caption || '👕 New Winter Collection! Discover our latest range of formal shirts starting from ₹1,299.',
        deliveryCounts: {
          sent: campaignData.status === 'Sent' ? audienceSummary.totalEligible : 0,
          delivered: campaignData.status === 'Sent' ? Math.round(audienceSummary.totalEligible * 0.98) : 0,
          read: campaignData.status === 'Sent' ? Math.round(audienceSummary.totalEligible * 0.84) : 0,
          failed: campaignData.status === 'Sent' ? Math.round(audienceSummary.totalEligible * 0.02) : 0,
        },
        branchDelivery: perBranchDelivery,
        deliveryRate: campaignData.status === 'Sent' ? '98.2%' : 'Pending',
        readRate: campaignData.status === 'Sent' ? '84.6%' : 'Pending',
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
