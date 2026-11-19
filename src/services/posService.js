import { USE_MOCKS, apiClient } from './apiClient.js';
import { mockStorage, delay } from '../mocks/mockStorage.js';

export const posService = {
  async getInvoices(filters = {}) {
    if (USE_MOCKS) {
      await delay(120);
      let invoices = mockStorage.getInvoices();

      if (filters.branchId && filters.branchId !== 'ALL') {
        invoices = invoices.filter(inv => inv.branch === filters.branchId);
      }
      if (filters.status && filters.status !== 'ALL') {
        invoices = invoices.filter(inv => inv.status === filters.status);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        invoices = invoices.filter(
          inv =>
            inv.invoiceNo.toLowerCase().includes(q) ||
            inv.customerName?.toLowerCase().includes(q) ||
            inv.customerMobile?.includes(q)
        );
      }

      return invoices;
    }

    const params = new URLSearchParams(filters);
    return apiClient(`/pos/invoices?${params.toString()}`);
  },

  async getInvoice(id) {
    if (USE_MOCKS) {
      await delay(80);
      const invoice = mockStorage.getInvoices().find(inv => inv.id === id || inv.invoiceNo === id);
      if (!invoice) throw new Error('Invoice not found');
      return invoice;
    }
    return apiClient(`/pos/invoices/${id}`);
  },

  async checkoutSale(saleData) {
    if (USE_MOCKS) {
      await delay(250);
      return mockStorage.createInvoice(saleData);
    }

    return apiClient('/pos/checkout', {
      method: 'POST',
      body: JSON.stringify(saleData),
    });
  },
};
