import {
  INITIAL_BRANCHES,
  INITIAL_CUSTOMERS,
  INITIAL_LEADS,
  INITIAL_CHATS,
  INITIAL_CAMPAIGNS,
  APPROVED_KNOWLEDGE_BASE,
} from './seedData.js';
import {
  INITIAL_PRODUCTS,
  generateInitialStock,
  INITIAL_INVOICES,
  INITIAL_MOVEMENTS,
  INITIAL_TRANSFERS,
  INITIAL_LEDGER,
  INITIAL_CLOSINGS,
} from './retailSeedData.js';

const STORAGE_KEYS = {
  BRANCHES: 'rs_branches',
  CUSTOMERS: 'rs_customers',
  LEADS: 'rs_leads',
  CHATS: 'rs_chats',
  CAMPAIGNS: 'rs_campaigns',
  KNOWLEDGE_BASE: 'rs_knowledge_base',
  AUDIT_LOGS: 'rs_audit_logs',
  PRODUCTS: 'rs_products',
  STOCK: 'rs_stock',
  INVOICES: 'rs_invoices',
  MOVEMENTS: 'rs_movements',
  TRANSFERS: 'rs_transfers',
  RETURNS: 'rs_returns',
  LEDGER: 'rs_ledger',
  CLOSINGS: 'rs_closings',
  INIT_FLAG: 'rs_initialized_v3',
};

export const INITIAL_AUDIT_LOGS = [
  {
    id: 'aud-101',
    date: '2026-11-18T10:30:00Z',
    user: 'Super Admin',
    branch: 'ALL',
    action: 'Campaign Scheduled',
    detail: 'Scheduled "Grooms Wedding Season Special" for B1, B2 (2,840 recipients)',
  },
  {
    id: 'aud-102',
    date: '2026-11-18T09:45:00Z',
    user: 'Branch 1 User',
    branch: 'B1',
    action: 'Lead Created',
    detail: 'Captured new lead Rohit Verma (Wedding Wear) from WhatsApp chat',
  },
  {
    id: 'aud-103',
    date: '2026-11-18T09:15:00Z',
    user: 'Super Admin',
    branch: 'B1',
    action: 'Petpooja Import',
    detail: 'Imported customer records from Petpooja POS invoice report with DPDP consent validation',
  },
  {
    id: 'aud-104',
    date: '2026-11-18T08:30:00Z',
    user: 'Super Admin',
    branch: 'ALL',
    action: 'Knowledge Base Updated',
    detail: 'Added alteration policy and wedding suit custom measurement FAQ entries',
  },
  {
    id: 'aud-105',
    date: '2026-11-17T18:00:00Z',
    user: 'Branch 2 User',
    branch: 'B2',
    action: 'Lead Converted',
    detail: 'Marked lead Priya Sharma as Converted after in-store festive purchase',
  },
  {
    id: 'aud-106',
    date: '2026-11-17T10:00:00Z',
    user: 'Super Admin',
    branch: 'ALL',
    action: 'User Sign In',
    detail: 'Super Administrator authenticated from Head Office console',
  },
];

export function initLocalStorage(force = false) {
  if (typeof window === 'undefined') return;

  const initialized = localStorage.getItem(STORAGE_KEYS.INIT_FLAG);
  if (!initialized || force) {
    localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(INITIAL_BRANCHES));
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(INITIAL_LEADS));
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(INITIAL_CHATS));
    localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(INITIAL_CAMPAIGNS));
    localStorage.setItem(STORAGE_KEYS.KNOWLEDGE_BASE, JSON.stringify(APPROVED_KNOWLEDGE_BASE));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.STOCK, JSON.stringify(generateInitialStock()));
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(INITIAL_INVOICES));
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(INITIAL_MOVEMENTS));
    localStorage.setItem(STORAGE_KEYS.TRANSFERS, JSON.stringify(INITIAL_TRANSFERS));
    localStorage.setItem(STORAGE_KEYS.RETURNS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify(INITIAL_LEDGER));
    localStorage.setItem(STORAGE_KEYS.CLOSINGS, JSON.stringify(INITIAL_CLOSINGS));
    localStorage.setItem(STORAGE_KEYS.INIT_FLAG, 'true');
  }
}

export const delay = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms));

export const mockStorage = {
  // Branches
  getBranches: () => {
    initLocalStorage();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.BRANCHES) || '[]');
  },
  saveBranches: branches => {
    localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(branches));
  },

  // Customers
  getCustomers: () => {
    initLocalStorage();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS) || '[]');
  },
  saveCustomers: customers => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  },
  addCustomer: customer => {
    const list = mockStorage.getCustomers();
    const updated = [customer, ...list];
    mockStorage.saveCustomers(updated);
    return customer;
  },

  // Leads
  getLeads: () => {
    initLocalStorage();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADS) || '[]');
  },
  saveLeads: leads => {
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
  },
  addLead: lead => {
    const list = mockStorage.getLeads();
    const updated = [lead, ...list];
    mockStorage.saveLeads(updated);
    return lead;
  },
  updateLead: (id, updates) => {
    const list = mockStorage.getLeads();
    const updated = list.map(l => (l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l));
    mockStorage.saveLeads(updated);
    return updated.find(l => l.id === id);
  },

  // Chats
  getChats: () => {
    initLocalStorage();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CHATS) || '[]');
  },
  saveChats: chats => {
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
  },
  addChat: chat => {
    const list = mockStorage.getChats();
    const updated = [chat, ...list];
    mockStorage.saveChats(updated);
    return chat;
  },
  updateChat: (id, updates) => {
    const list = mockStorage.getChats();
    const updated = list.map(c => (c.id === id ? { ...c, ...updates } : c));
    mockStorage.saveChats(updated);
    return updated.find(c => c.id === id);
  },

  // Campaigns
  getCampaigns: () => {
    initLocalStorage();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CAMPAIGNS) || '[]');
  },
  saveCampaigns: campaigns => {
    localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(campaigns));
  },
  addCampaign: campaign => {
    const list = mockStorage.getCampaigns();
    const updated = [campaign, ...list];
    mockStorage.saveCampaigns(updated);
    return campaign;
  },

  // Knowledge Base
  getKnowledgeBase: () => {
    initLocalStorage();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.KNOWLEDGE_BASE) || '[]');
  },
  saveKnowledgeBase: kb => {
    localStorage.setItem(STORAGE_KEYS.KNOWLEDGE_BASE, JSON.stringify(kb));
  },

  // Audit Logs
  getAuditLogs: () => {
    initLocalStorage();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS) || '[]');
  },
  saveAuditLogs: logs => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
  },
  addAuditLog: entry => {
    const list = mockStorage.getAuditLogs();
    const newEntry = {
      id: `aud-${Date.now()}`,
      date: new Date().toISOString(),
      ...entry,
    };
    mockStorage.saveAuditLogs([newEntry, ...list]);
    return newEntry;
  },

  // Products
  getProducts: () => {
    initLocalStorage();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
  },
  saveProducts: products => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },
  addProduct: product => {
    const list = mockStorage.getProducts();
    const newProduct = {
      id: `p_${Date.now().toString().slice(-4)}`,
      active: true,
      ...product,
    };
    mockStorage.saveProducts([newProduct, ...list]);
    // Create initial stock entries for this new product across all branches
    const stockList = mockStorage.getStock();
    const branches = mockStorage.getBranches();
    const newStockEntries = branches.map(b => ({
      id: `${b.id}__${newProduct.id}`,
      branch: b.id,
      productId: newProduct.id,
      qty: Number(product.openingStock) || 0,
      damaged: 0,
      min: product.minStock || 5,
      inTransit: 0,
    }));
    mockStorage.saveStock([...stockList, ...newStockEntries]);
    return newProduct;
  },
  updateProduct: (id, updates) => {
    const list = mockStorage.getProducts();
    const updated = list.map(p => (p.id === id ? { ...p, ...updates } : p));
    mockStorage.saveProducts(updated);
    return updated.find(p => p.id === id);
  },

  // Stock
  getStock: () => {
    initLocalStorage();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.STOCK) || '[]');
  },
  saveStock: stock => {
    localStorage.setItem(STORAGE_KEYS.STOCK, JSON.stringify(stock));
  },
  adjustStock: (branch, productId, delta, reason = 'Adjustment', user = 'Staff') => {
    const stockList = mockStorage.getStock();
    const targetIdx = stockList.findIndex(s => s.branch === branch && s.productId === productId);
    let newQty = delta;
    if (targetIdx !== -1) {
      newQty = Math.max(0, (stockList[targetIdx].qty || 0) + delta);
      stockList[targetIdx].qty = newQty;
    } else {
      stockList.push({
        id: `${branch}__${productId}`,
        branch,
        productId,
        qty: Math.max(0, delta),
        damaged: 0,
        min: 5,
        inTransit: 0,
      });
    }
    mockStorage.saveStock(stockList);

    // Record movement
    const product = mockStorage.getProducts().find(p => p.id === productId);
    mockStorage.addMovement({
      branch,
      productId,
      productName: product ? `${product.name} (${product.colour} / ${product.size})` : productId,
      type: delta >= 0 ? (reason.includes('Return') ? 'Return' : 'Adjustment') : 'Adjustment',
      qty: delta,
      balance: newQty,
      reference: reason,
      user,
    });
    return newQty;
  },

  // Invoices & POS
  getInvoices: () => {
    initLocalStorage();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.INVOICES) || '[]');
  },
  saveInvoices: invoices => {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  },
  createInvoice: invoiceData => {
    const invoices = mockStorage.getInvoices();
    const invoiceNo = `${invoiceData.branch}-${new Date().getFullYear()}-${String(invoices.length + 844).padStart(4, '0')}`;
    const newInvoice = {
      id: `inv_${Date.now()}`,
      invoiceNo,
      date: new Date().toISOString(),
      status: invoiceData.payments?.some(p => p.mode === 'Credit') ? 'Credit' : 'Paid',
      ...invoiceData,
    };

    // 1. Save invoice
    mockStorage.saveInvoices([newInvoice, ...invoices]);

    // 2. Deduct branch stock & record movement for each item sold
    invoiceData.items.forEach(item => {
      mockStorage.adjustStock(
        invoiceData.branch,
        item.productId,
        -Number(item.qty),
        `Invoice ${invoiceNo}`,
        invoiceData.cashier || 'Store Staff'
      );
    });

    // 3. Record income in general ledger
    mockStorage.addLedgerEntry({
      branch: invoiceData.branch,
      type: 'Income',
      category: 'Store Sales (POS)',
      amount: invoiceData.total,
      mode: invoiceData.payments?.map(p => p.mode).join(' + ') || 'Cash',
      reference: `Invoice ${invoiceNo}`,
      notes: `POS sale to ${invoiceData.customerName || 'Walk-in Customer'}`,
    });

    return newInvoice;
  },

  // Stock Movements / Ledger
  getMovements: () => {
    initLocalStorage();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MOVEMENTS) || '[]');
  },
  saveMovements: movements => {
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
  },
  addMovement: movement => {
    const list = mockStorage.getMovements();
    const newMovement = {
      id: `mov_${Date.now()}`,
      date: new Date().toISOString(),
      ...movement,
    };
    mockStorage.saveMovements([newMovement, ...list]);
    return newMovement;
  },

  // Stock Transfers
  getTransfers: () => {
    initLocalStorage();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSFERS) || '[]');
  },
  saveTransfers: transfers => {
    localStorage.setItem(STORAGE_KEYS.TRANSFERS, JSON.stringify(transfers));
  },
  createTransfer: transferData => {
    const transfers = mockStorage.getTransfers();
    const branches = mockStorage.getBranches();
    const fromBranch = branches.find(b => b.id === transferData.from);
    const toBranch = branches.find(b => b.id === transferData.to);

    const newTransfer = {
      id: `TRF-${new Date().getFullYear()}-${String(transfers.length + 3).padStart(3, '0')}`,
      createdDate: new Date().toISOString(),
      fromName: fromBranch?.name || transferData.from,
      toName: toBranch?.name || transferData.to,
      status: 'Requested',
      ...transferData,
    };
    mockStorage.saveTransfers([newTransfer, ...transfers]);
    return newTransfer;
  },
  updateTransferStatus: (id, newStatus, extra = {}) => {
    const transfers = mockStorage.getTransfers();
    const transfer = transfers.find(t => t.id === id);
    if (!transfer) throw new Error('Transfer not found');

    const updated = transfers.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: newStatus,
          ...extra,
        };
      }
      return t;
    });
    mockStorage.saveTransfers(updated);

    // Reactive inventory update upon dispatch or receipt:
    if (newStatus === 'Dispatched') {
      transfer.items.forEach(item => {
        mockStorage.adjustStock(
          transfer.from,
          item.productId,
          -Number(item.qty),
          `Transfer Dispatch ${transfer.id} to ${transfer.to}`,
          extra.user || 'Logistics'
        );
      });
    } else if (newStatus === 'Received') {
      transfer.items.forEach(item => {
        const receivedQty = Number(extra.receivedQtys?.[item.productId] ?? item.qty);
        mockStorage.adjustStock(
          transfer.to,
          item.productId,
          receivedQty,
          `Transfer Received ${transfer.id} from ${transfer.from}`,
          extra.user || 'Store Staff'
        );
      });
    }

    return updated.find(t => t.id === id);
  },

  // Sales Returns
  getReturns: () => {
    initLocalStorage();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.RETURNS) || '[]');
  },
  saveReturns: returns => {
    localStorage.setItem(STORAGE_KEYS.RETURNS, JSON.stringify(returns));
  },
  processReturn: returnData => {
    const returns = mockStorage.getReturns();
    const newReturn = {
      id: `RET-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString(),
      ...returnData,
    };
    mockStorage.saveReturns([newReturn, ...returns]);

    // Update invoice status
    const invoices = mockStorage.getInvoices();
    const updatedInvoices = invoices.map(inv =>
      inv.id === returnData.invoiceId || inv.invoiceNo === returnData.invoiceNo
        ? { ...inv, status: 'Returned' }
        : inv
    );
    mockStorage.saveInvoices(updatedInvoices);

    // If restock is true, replenish stock and record movement
    if (returnData.restock) {
      returnData.items.forEach(item => {
        mockStorage.adjustStock(
          returnData.branch,
          item.productId,
          Number(item.qty),
          `Sales Return on ${returnData.invoiceNo} (${returnData.reason})`,
          returnData.user || 'Store Staff'
        );
      });
    }

    // Record refund expense in ledger
    mockStorage.addLedgerEntry({
      branch: returnData.branch,
      type: 'Expense',
      category: 'Sales Return Refund',
      amount: returnData.refundAmount,
      mode: returnData.refundMode,
      reference: `Return on ${returnData.invoiceNo}`,
      notes: `Reason: ${returnData.reason}`,
    });

    return newReturn;
  },

  // Accounting Ledger
  getLedger: () => {
    initLocalStorage();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.LEDGER) || '[]');
  },
  saveLedger: ledger => {
    localStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify(ledger));
  },
  addLedgerEntry: entry => {
    const list = mockStorage.getLedger();
    const newEntry = {
      id: `led_${Date.now()}`,
      date: new Date().toISOString(),
      ...entry,
    };
    mockStorage.saveLedger([newEntry, ...list]);
    return newEntry;
  },

  // Day-End Closings
  getClosings: () => {
    initLocalStorage();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CLOSINGS) || '[]');
  },
  saveClosings: closings => {
    localStorage.setItem(STORAGE_KEYS.CLOSINGS, JSON.stringify(closings));
  },
  recordClosing: closingData => {
    const list = mockStorage.getClosings();
    const newClosing = {
      id: `cls_${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      ...closingData,
    };
    mockStorage.saveClosings([newClosing, ...list]);
    return newClosing;
  },

  // Reset
  resetSeedData: () => {
    initLocalStorage(true);
  },
};
