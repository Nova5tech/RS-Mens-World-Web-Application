import { USE_MOCKS, apiClient } from './apiClient.js';
import { mockStorage, delay } from '../mocks/mockStorage.js';
import { classifyLeadEnquiry } from '../utils/aiClassifier.js';

export const leadService = {
  async getLeads(filters = {}) {
    if (USE_MOCKS) {
      await delay(150);
      let leads = mockStorage.getLeads();

      if (filters.branchId && filters.branchId !== 'ALL') {
        leads = leads.filter(
          l => l.preferredBranchId === filters.branchId || l.assignedBranchId === filters.branchId
        );
      }

      if (filters.stage && filters.stage !== 'ALL') {
        leads = leads.filter(l => l.stage === filters.stage);
      }

      if (filters.priority && filters.priority !== 'ALL') {
        leads = leads.filter(l => l.priority === filters.priority);
      }

      if (filters.search) {
        const q = filters.search.toLowerCase();
        leads = leads.filter(
          l =>
            l.name.toLowerCase().includes(q) ||
            l.mobile.includes(q) ||
            l.enquiry.toLowerCase().includes(q)
        );
      }

      return leads;
    }

    const params = new URLSearchParams(filters);
    return apiClient(`/leads?${params.toString()}`);
  },

  async getLead(id) {
    if (USE_MOCKS) {
      await delay(100);
      const leads = mockStorage.getLeads();
      const lead = leads.find(l => l.id === id);
      if (!lead) throw new Error('Lead not found');
      return lead;
    }
    return apiClient(`/leads/${id}`);
  },

  async createLead(leadData) {
    if (USE_MOCKS) {
      await delay(200);
      const aiAnalysis = classifyLeadEnquiry(leadData.enquiry || '');

      const newLead = {
        id: `LEAD-${Date.now().toString().slice(-4)}`,
        name: leadData.name.trim(),
        mobile: leadData.mobile.trim(),
        email: leadData.email ? leadData.email.trim() : null,
        enquiry: leadData.enquiry.trim(),
        source: leadData.source || 'AI Chat',
        preferredBranchId: leadData.preferredBranchId || 'B1',
        assignedBranchId: leadData.assignedBranchId || leadData.preferredBranchId || 'B1',
        consentToContact: leadData.consentToContact ?? true,
        aiSummary: aiAnalysis.summary,
        aiCategory: aiAnalysis.category,
        aiPriority: aiAnalysis.priority,
        priority: leadData.priority || aiAnalysis.priority,
        stage: leadData.stage || 'New',
        assignedTo: leadData.assignedTo || 'Unassigned',
        followUpDate: leadData.followUpDate || null,
        notes: [
          {
            id: `note-${Date.now()}`,
            text: `Lead created via ${leadData.source || 'AI Chat'}. Initial AI category: ${aiAnalysis.category}, priority: ${aiAnalysis.priority}.`,
            author: 'System',
            timestamp: new Date().toISOString(),
          },
        ],
        isManualOverride: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockStorage.addLead(newLead);
      return newLead;
    }

    return apiClient('/leads', {
      method: 'POST',
      body: JSON.stringify(leadData),
    });
  },

  async updateLead(id, updates, author = 'Staff') {
    if (USE_MOCKS) {
      await delay(150);
      const lead = await this.getLead(id);

      let isManualOverride = lead.isManualOverride;
      const notes = [...lead.notes];

      // Check if priority or category is manually changed
      if (
        (updates.priority && updates.priority !== lead.priority) ||
        (updates.aiCategory && updates.aiCategory !== lead.aiCategory)
      ) {
        isManualOverride = true;
        notes.push({
          id: `note-${Date.now()}`,
          text: `Manual override: Priority set to ${updates.priority || lead.priority}, Category set to ${updates.category || lead.aiCategory}.`,
          author,
          timestamp: new Date().toISOString(),
        });
      }

      // Check stage change
      if (updates.stage && updates.stage !== lead.stage) {
        notes.push({
          id: `note-${Date.now()}-stage`,
          text: `Stage changed from "${lead.stage}" to "${updates.stage}".`,
          author,
          timestamp: new Date().toISOString(),
        });
      }

      return mockStorage.updateLead(id, {
        ...updates,
        isManualOverride,
        notes,
      });
    }

    return apiClient(`/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async addNote(id, noteText, author = 'Staff') {
    if (USE_MOCKS) {
      await delay(120);
      const lead = await this.getLead(id);
      const newNote = {
        id: `note-${Date.now()}`,
        text: noteText,
        author,
        timestamp: new Date().toISOString(),
      };
      return mockStorage.updateLead(id, {
        notes: [newNote, ...lead.notes],
      });
    }

    return apiClient(`/leads/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ text: noteText, author }),
    });
  },
};
