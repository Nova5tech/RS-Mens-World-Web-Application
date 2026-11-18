import { USE_MOCKS, apiClient } from './apiClient.js';
import { mockStorage, delay } from '../mocks/mockStorage.js';

export const reportService = {
  async getDashboardKPIs(branchId = null) {
    if (USE_MOCKS) {
      await delay(120);
      const chats = mockStorage.getChats();
      const leads = mockStorage.getLeads();
      const customers = mockStorage.getCustomers();

      const branchChats =
        branchId && branchId !== 'ALL' ? chats.filter(c => c.branchId === branchId) : chats;
      const branchLeads =
        branchId && branchId !== 'ALL'
          ? leads.filter(l => l.preferredBranchId === branchId || l.assignedBranchId === branchId)
          : leads;

      const activeChats = branchChats.filter(c => c.status === 'active').length;
      const handoversPending = branchChats.filter(c => c.status === 'handover_pending').length;
      const totalLeads = branchLeads.length;
      const newLeads = branchLeads.filter(l => l.stage === 'New').length;
      const convertedLeads = branchLeads.filter(l => l.stage === 'Converted').length;

      const todayStr = new Date().toISOString().slice(0, 10);
      const followUpsDue = branchLeads.filter(
        l => l.followUpDate && l.followUpDate.slice(0, 10) <= todayStr && l.stage !== 'Converted' && l.stage !== 'Lost'
      ).length;

      const totalCustomers = branchId && branchId !== 'ALL'
        ? customers.filter(c => c.branchId === branchId).length
        : customers.length;

      return {
        activeChats: activeChats + 2,
        handoversPending: handoversPending || 1,
        totalLeads,
        newLeads,
        convertedLeads,
        followUpsDue: Math.max(followUpsDue, 2),
        totalCustomers,
        conversionRate: totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0.0',
      };
    }

    return apiClient(`/reports/kpis${branchId ? `?branchId=${branchId}` : ''}`);
  },

  async getAcquisitionTrends() {
    if (USE_MOCKS) {
      await delay(100);
      return [
        { date: '12 Nov', chat: 4, form: 2, campaign: 0, manual: 1 },
        { date: '13 Nov', chat: 6, form: 3, campaign: 1, manual: 2 },
        { date: '14 Nov', chat: 5, form: 1, campaign: 4, manual: 0 },
        { date: '15 Nov', chat: 9, form: 4, campaign: 7, manual: 3 },
        { date: '16 Nov', chat: 7, form: 2, campaign: 5, manual: 1 },
        { date: '17 Nov', chat: 11, form: 5, campaign: 3, manual: 2 },
        { date: '18 Nov', chat: 8, form: 3, campaign: 6, manual: 2 },
      ];
    }
    return apiClient('/reports/trends');
  },
};
