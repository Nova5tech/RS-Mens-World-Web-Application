import { USE_MOCKS, apiClient } from './apiClient.js';
import { mockStorage, delay } from '../mocks/mockStorage.js';

export const productService = {
  async getProducts(filters = {}) {
    if (USE_MOCKS) {
      await delay(120);
      let products = mockStorage.getProducts();

      if (filters.category && filters.category !== 'All Categories') {
        products = products.filter(p => p.category === filters.category);
      }

      if (filters.search) {
        const q = filters.search.toLowerCase();
        products = products.filter(
          p =>
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.barcode.includes(q) ||
            p.brand.toLowerCase().includes(q)
        );
      }

      return products;
    }

    const params = new URLSearchParams(filters);
    return apiClient(`/products?${params.toString()}`);
  },

  async getProduct(id) {
    if (USE_MOCKS) {
      await delay(80);
      const product = mockStorage.getProducts().find(p => p.id === id);
      if (!product) throw new Error('Product not found');
      return product;
    }
    return apiClient(`/products/${id}`);
  },

  async createProduct(productData) {
    if (USE_MOCKS) {
      await delay(150);
      return mockStorage.addProduct(productData);
    }
    return apiClient('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  async updateProduct(id, updates) {
    if (USE_MOCKS) {
      await delay(150);
      return mockStorage.updateProduct(id, updates);
    }
    return apiClient(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
};
