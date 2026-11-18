import {
  INITIAL_BRANCHES,
  INITIAL_CUSTOMERS,
  INITIAL_LEADS,
  INITIAL_CHATS,
  INITIAL_CAMPAIGNS,
  APPROVED_KNOWLEDGE_BASE,
} from './seedData.js';

const STORAGE_KEYS = {
  BRANCHES: 'rs_branches',
  CUSTOMERS: 'rs_customers',
  LEADS: 'rs_leads',
  CHATS: 'rs_chats',
  CAMPAIGNS: 'rs_campaigns',
  KNOWLEDGE_BASE: 'rs_knowledge_base',
  AUDIT_LOGS: 'rs_audit_logs',
  INIT_FLAG: 'rs_initialized_v2',
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

  // Reset
  resetSeedData: () => {
    initLocalStorage(true);
  },
};
