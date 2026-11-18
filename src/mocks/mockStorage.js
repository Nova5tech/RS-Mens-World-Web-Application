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
  INIT_FLAG: 'rs_initialized_v1',
};

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

  // Reset
  resetSeedData: () => {
    initLocalStorage(true);
  },
};
