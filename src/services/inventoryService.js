import { USE_MOCKS, apiClient } from './apiClient.js';
import { mockStorage, delay } from '../mocks/mockStorage.js';

export const inventoryService = {
  async getStock(branchId = 'ALL') {
    if (USE_MOCKS) {
      await delay(120);
      let stock = mockStorage.getStock();
      if (branchId && branchId !== 'ALL') {
        stock = stock.filter(s => s.branch === branchId);
      }
      return stock;
    }
    return apiClient(`/inventory/stock${branchId ? `?branchId=${branchId}` : ''}`);
  },

  async adjustStock(branch, productId, delta, reason = 'Adjustment', user = 'Staff') {
    if (USE_MOCKS) {
      await delay(150);
      return mockStorage.adjustStock(branch, productId, delta, reason, user);
    }
    return apiClient('/inventory/adjust', {
      method: 'POST',
      body: JSON.stringify({ branch, productId, delta, reason, user }),
    });
  },

  async getMovements(filters = {}) {
    if (USE_MOCKS) {
      await delay(120);
      let movements = mockStorage.getMovements();
      if (filters.branchId && filters.branchId !== 'ALL') {
        movements = movements.filter(m => m.branch === filters.branchId);
      }
      if (filters.type && filters.type !== 'ALL') {
        movements = movements.filter(m => m.type === filters.type);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        movements = movements.filter(
          m =>
            m.productName.toLowerCase().includes(q) ||
            m.reference.toLowerCase().includes(q) ||
            m.user.toLowerCase().includes(q)
        );
      }
      return movements;
    }
    const params = new URLSearchParams(filters);
    return apiClient(`/inventory/movements?${params.toString()}`);
  },

  async getInventorySummary(branchId = 'ALL') {
    if (USE_MOCKS) {
      await delay(100);
      const products = mockStorage.getProducts();
      let stock = mockStorage.getStock();
      if (branchId && branchId !== 'ALL') {
        stock = stock.filter(s => s.branch === branchId);
      }

      const totalItems = stock.reduce((sum, s) => sum + (s.qty || 0), 0);
      const lowStockCount = stock.filter(s => (s.qty || 0) <= (s.min || 5)).length;

      // Calculate total value at cost
      let totalCostValue = 0;
      stock.forEach(s => {
        const p = products.find(prod => prod.id === s.productId);
        if (p) {
          totalCostValue += (s.qty || 0) * (p.cost || 0);
        }
      });

      return {
        totalSkus: products.length,
        totalUnits: totalItems,
        totalCostValue,
        lowStockCount,
      };
    }
    return apiClient(`/inventory/summary${branchId ? `?branchId=${branchId}` : ''}`);
  },
};
