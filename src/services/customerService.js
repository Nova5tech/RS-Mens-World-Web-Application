import { USE_MOCKS, apiClient } from './apiClient.js';
import { mockStorage, delay } from '../mocks/mockStorage.js';
import { isValidIndianMobile, normalizeMobile } from '../utils/formatters.js';

export const customerService = {
  async getCustomers(filters = {}) {
    if (USE_MOCKS) {
      await delay(150);
      let customers = mockStorage.getCustomers();

      if (filters.branchId && filters.branchId !== 'ALL') {
        customers = customers.filter(c => c.branchId === filters.branchId);
      }

      if (filters.consentOnly) {
        customers = customers.filter(c => c.marketingOptIn === true);
      }

      if (filters.search) {
        const q = filters.search.toLowerCase();
        customers = customers.filter(
          c =>
            c.name.toLowerCase().includes(q) ||
            c.mobile.includes(q) ||
            (c.email && c.email.toLowerCase().includes(q))
        );
      }

      return customers;
    }

    const params = new URLSearchParams(filters);
    return apiClient(`/customers?${params.toString()}`);
  },

  async getCustomer(id) {
    if (USE_MOCKS) {
      await delay(100);
      const customers = mockStorage.getCustomers();
      const customer = customers.find(c => c.id === id);
      if (!customer) throw new Error('Customer not found');
      return customer;
    }
    return apiClient(`/customers/${id}`);
  },

  /**
   * Pre-import validation engine for Petpooja CSV / Excel uploads
   */
  async validateImportRows(rows, fieldMapping, defaultBranchId = 'B1') {
    if (USE_MOCKS) {
      await delay(250);
      const existingCustomers = mockStorage.getCustomers();
      const existingMobiles = new Set(existingCustomers.map(c => normalizeMobile(c.mobile)));

      const validRecords = [];
      const invalidRecords = [];
      const duplicateRecords = [];
      const seenFileMobiles = new Set();

      rows.forEach((row, index) => {
        const rawName = row[fieldMapping.name]?.toString().trim() || '';
        const rawMobile = row[fieldMapping.mobile]?.toString().trim() || '';
        const rawBranch = row[fieldMapping.branch]?.toString().trim() || defaultBranchId;
        const rawEmail = row[fieldMapping.email]?.toString().trim() || null;
        const rawBirthday = row[fieldMapping.birthday]?.toString().trim() || null;
        const rawConsent = row[fieldMapping.consent];

        const cleanMobile = normalizeMobile(rawMobile);

        // Validation 1: Name and mobile present
        if (!rawName) {
          invalidRecords.push({
            rowIndex: index + 1,
            row,
            reason: 'Missing customer name',
          });
          return;
        }

        // Validation 2: Valid 10-digit mobile
        if (!isValidIndianMobile(cleanMobile)) {
          invalidRecords.push({
            rowIndex: index + 1,
            row,
            reason: `Invalid 10-digit mobile format: "${rawMobile}"`,
          });
          return;
        }

        // Validation 3: Duplicate detection
        const isDuplicateInDb = existingMobiles.has(cleanMobile);
        const isDuplicateInFile = seenFileMobiles.has(cleanMobile);

        if (isDuplicateInDb || isDuplicateInFile) {
          duplicateRecords.push({
            rowIndex: index + 1,
            name: rawName,
            mobile: cleanMobile,
            branchId: rawBranch,
            reason: isDuplicateInFile ? 'Duplicate inside upload file' : 'Mobile already exists in database',
          });
          return;
        }

        seenFileMobiles.add(cleanMobile);

        // Validation 4: Consent parsing
        const marketingOptIn =
          rawConsent === true ||
          String(rawConsent).toLowerCase() === 'true' ||
          String(rawConsent).toLowerCase() === 'yes' ||
          String(rawConsent).toLowerCase() === '1' ||
          String(rawConsent).toLowerCase() === 'opted_in';

        validRecords.push({
          id: `CUST-IMP-${Date.now()}-${index}`,
          name: rawName,
          mobile: cleanMobile,
          email: rawEmail,
          birthday: rawBirthday,
          branchId: rawBranch.startsWith('B') ? rawBranch : defaultBranchId,
          marketingOptIn,
          consentSource: 'Petpooja Import',
          consentDate: new Date().toISOString().slice(0, 10),
          source: 'Petpooja Import',
          createdAt: new Date().toISOString(),
        });
      });

      return {
        totalRows: rows.length,
        validCount: validRecords.length,
        invalidCount: invalidRecords.length,
        duplicateCount: duplicateRecords.length,
        validRecords,
        invalidRecords,
        duplicateRecords,
      };
    }

    return apiClient('/customers/import/preview', {
      method: 'POST',
      body: JSON.stringify({ rows, fieldMapping, defaultBranchId }),
    });
  },

  async confirmImport(validRecords) {
    if (USE_MOCKS) {
      await delay(300);
      const current = mockStorage.getCustomers();
      const updated = [...validRecords, ...current];
      mockStorage.saveCustomers(updated);
      return {
        success: true,
        importedCount: validRecords.length,
        totalCustomers: updated.length,
      };
    }

    return apiClient('/customers/import/confirm', {
      method: 'POST',
      body: JSON.stringify({ records: validRecords }),
    });
  },
};
