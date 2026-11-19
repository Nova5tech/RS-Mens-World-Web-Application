import { USE_MOCKS, apiClient } from './apiClient.js';
import { mockStorage, delay } from '../mocks/mockStorage.js';

export const accountingService = {
  async getLedger(filters = {}) {
    if (USE_MOCKS) {
      await delay(120);
      let ledger = mockStorage.getLedger();
      if (filters.branchId && filters.branchId !== 'ALL') {
        ledger = ledger.filter(l => l.branch === filters.branchId);
      }
      if (filters.type && filters.type !== 'ALL') {
        ledger = ledger.filter(l => l.type === filters.type);
      }
      return ledger;
    }
    const params = new URLSearchParams(filters);
    return apiClient(`/accounting/ledger?${params.toString()}`);
  },

  async addEntry(entryData) {
    if (USE_MOCKS) {
      await delay(150);
      return mockStorage.addLedgerEntry(entryData);
    }
    return apiClient('/accounting/ledger', {
      method: 'POST',
      body: JSON.stringify(entryData),
    });
  },

  async getClosings(branchId = 'ALL') {
    if (USE_MOCKS) {
      await delay(100);
      let closings = mockStorage.getClosings();
      if (branchId && branchId !== 'ALL') {
        closings = closings.filter(c => c.branch === branchId);
      }
      return closings;
    }
    return apiClient(`/accounting/closings${branchId ? `?branchId=${branchId}` : ''}`);
  },

  async recordClosing(closingData) {
    if (USE_MOCKS) {
      await delay(200);
      return mockStorage.recordClosing(closingData);
    }
    return apiClient('/accounting/closings', {
      method: 'POST',
      body: JSON.stringify(closingData),
    });
  },

  async getFinancialSummary(branchId = 'ALL') {
    if (USE_MOCKS) {
      await delay(120);
      const ledger = mockStorage.getLedger();
      const filtered = branchId && branchId !== 'ALL'
        ? ledger.filter(l => l.branch === branchId)
        : ledger;

      const totalIncome = filtered
        .filter(l => l.type === 'Income')
        .reduce((sum, l) => sum + (Number(l.amount) || 0), 0);

      const totalExpense = filtered
        .filter(l => l.type === 'Expense')
        .reduce((sum, l) => sum + (Number(l.amount) || 0), 0);

      const invoices = mockStorage.getInvoices();
      const branchInvoices = branchId && branchId !== 'ALL'
        ? invoices.filter(inv => inv.branch === branchId)
        : invoices;

      const customerOutstanding = branchInvoices
        .filter(inv => inv.status === 'Credit')
        .reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);

      return {
        totalIncome,
        totalExpense,
        netProfit: totalIncome - totalExpense,
        customerOutstanding,
      };
    }
    return apiClient(`/accounting/summary${branchId ? `?branchId=${branchId}` : ''}`);
  },
};
