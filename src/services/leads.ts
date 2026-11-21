import { Lead, LeadFilterOptions, LeadStage, LeadNote, LeadActivity, LeadAISummary, PaginatedResponse, Customer } from '@/types/models';
import { SEED_LEADS } from '@/mocks/data/leads';
import { getCurrentUser } from './auth';
import { getCustomers, createCustomer } from './customers';

const STORAGE_KEY = 'rs_leads_data';

class LeadsService {
  private getStore(): Lead[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_LEADS));
      return [...SEED_LEADS];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [...SEED_LEADS];
    }
  }

  private saveStore(leads: Lead[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  }

  public async getLeads(filters?: LeadFilterOptions, page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<Lead>> {
    let items = this.getStore();
    const currentUser = await getCurrentUser();

    // Branch isolation: Branch user sees only their own branch's leads
    if (currentUser?.role === 'branch_user' && currentUser.branch_id) {
      items = items.filter(l => l.branch_id === currentUser.branch_id);
    } else if (filters?.branch_id && filters.branch_id !== 'all') {
      items = items.filter(l => l.branch_id === filters.branch_id);
    }

    // Stage filter
    if (filters?.stage && filters.stage !== 'all') {
      items = items.filter(l => l.stage === filters.stage);
    }

    // Priority filter
    if (filters?.priority && filters.priority !== 'all') {
      items = items.filter(l => l.priority === filters.priority);
    }

    // Source filter
    if (filters?.source && filters.source !== 'all') {
      items = items.filter(l => l.source === filters.source);
    }

    // Follow-up date filter
    if (filters?.follow_up && filters.follow_up !== 'all') {
      const today = new Date().toISOString().slice(0, 10);
      const weekAhead = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

      if (filters.follow_up === 'overdue') {
        items = items.filter(l => l.follow_up_date && l.follow_up_date < today && l.stage !== 'converted' && l.stage !== 'lost');
      } else if (filters.follow_up === 'today') {
        items = items.filter(l => l.follow_up_date === today);
      } else if (filters.follow_up === 'this_week') {
        items = items.filter(l => l.follow_up_date && l.follow_up_date >= today && l.follow_up_date <= weekAhead);
      }
    }

    // Search filter
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      items = items.filter(l =>
        l.customer_name.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        l.enquiry.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q) ||
        l.interest_tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Sort by updated_at descending
    items.sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime());

    const total = items.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = items.slice(startIndex, startIndex + pageSize);

    return {
      items: paginatedItems,
      total,
      page,
      pageSize,
      totalPages
    };
  }

  public async getAllLeadsForKanban(filters?: LeadFilterOptions): Promise<Lead[]> {
    let items = this.getStore();
    const currentUser = await getCurrentUser();

    if (currentUser?.role === 'branch_user' && currentUser.branch_id) {
      items = items.filter(l => l.branch_id === currentUser.branch_id);
    } else if (filters?.branch_id && filters.branch_id !== 'all') {
      items = items.filter(l => l.branch_id === filters.branch_id);
    }

    if (filters?.priority && filters.priority !== 'all') {
      items = items.filter(l => l.priority === filters.priority);
    }

    if (filters?.source && filters.source !== 'all') {
      items = items.filter(l => l.source === filters.source);
    }

    if (filters?.follow_up && filters.follow_up !== 'all') {
      const today = new Date().toISOString().slice(0, 10);
      const weekAhead = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

      if (filters.follow_up === 'overdue') {
        items = items.filter(l => l.follow_up_date && l.follow_up_date < today && l.stage !== 'converted' && l.stage !== 'lost');
      } else if (filters.follow_up === 'today') {
        items = items.filter(l => l.follow_up_date === today);
      } else if (filters.follow_up === 'this_week') {
        items = items.filter(l => l.follow_up_date && l.follow_up_date >= today && l.follow_up_date <= weekAhead);
      }
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      items = items.filter(l =>
        l.customer_name.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        l.enquiry.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q)
      );
    }

    return items;
  }

  public async getLeadById(id: string): Promise<Lead | null> {
    const leads = this.getStore();
    return leads.find(l => l.id === id) || null;
  }

  public async getLeadCounts(branchId?: string): Promise<{
    total: number;
    new: number;
    in_progress: number;
    follow_up: number;
    converted: number;
    lost: number;
  }> {
    let items = this.getStore();
    const currentUser = await getCurrentUser();

    if (currentUser?.role === 'branch_user' && currentUser.branch_id) {
      items = items.filter(l => l.branch_id === currentUser.branch_id);
    } else if (branchId && branchId !== 'all') {
      items = items.filter(l => l.branch_id === branchId);
    }

    return {
      total: items.length,
      new: items.filter(l => l.stage === 'new').length,
      in_progress: items.filter(l => l.stage === 'in_progress').length,
      follow_up: items.filter(l => l.stage === 'follow_up').length,
      converted: items.filter(l => l.stage === 'converted').length,
      lost: items.filter(l => l.stage === 'lost').length
    };
  }

  public async createLead(data: {
    customer_name: string;
    phone: string;
    enquiry: string;
    preferred_branch_id?: string;
    interest_tags?: string[];
    source?: Lead['source'];
    priority?: Lead['priority'];
    follow_up_date?: string;
    consent_whatsapp?: boolean;
  }): Promise<Lead> {
    const leads = this.getStore();
    const currentUser = await getCurrentUser();

    // Auto-assign rule:
    // 1) preferred_branch_id if provided
    // 2) branch of an existing customer with that phone
    // 3) branch_1 (Rajahmundry Main)
    let assignedBranch = data.preferred_branch_id;
    if (!assignedBranch) {
      try {
        const existingCustomers = await getCustomers({ search: data.phone });
        const match = existingCustomers.items.find((c: Customer) => c.phone === data.phone || c.phone.replace(/\D/g, '') === data.phone.replace(/\D/g, ''));
        if (match) {
          assignedBranch = match.branch_id;
        }
      } catch {
        // Fallback
      }
    }
    if (!assignedBranch) {
      assignedBranch = 'branch_1';
    }

    // Branch user can only assign to their branch
    if (currentUser?.role === 'branch_user' && currentUser.branch_id) {
      assignedBranch = currentUser.branch_id;
    }

    const nextNum = 3800 + leads.length + 1;
    const id = `L-${nextNum}`;
    const now = new Date().toISOString();

    const newLead: Lead = {
      id,
      customer_name: data.customer_name.trim(),
      phone: data.phone.trim(),
      enquiry: data.enquiry.trim(),
      branch_id: assignedBranch as string,
      stage: 'new',
      priority: data.priority || 'medium',
      source: data.source || 'walk_in',
      interest_tags: data.interest_tags || [],
      follow_up_date: data.follow_up_date,
      consent_whatsapp: data.consent_whatsapp ?? true,
      notes: [],
      activities: [
        {
          id: `la_${Date.now()}`,
          type: 'created',
          description: `Lead created from ${(data.source || 'walk_in').replace('_', ' ')}`,
          user_name: currentUser?.full_name || 'Staff',
          created_at: now
        }
      ],
      created_at: now,
      updated_at: now
    };

    // Auto AI classify
    newLead.ai_summary = this.generateAISummary(newLead);

    leads.unshift(newLead);
    this.saveStore(leads);
    return newLead;
  }

  public async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    const leads = this.getStore();
    const index = leads.findIndex(l => l.id === id);
    if (index === -1) throw new Error('Lead not found');

    const currentUser = await getCurrentUser();
    const old = leads[index];
    const now = new Date().toISOString();

    const activities = [...old.activities];
    if (updates.priority && updates.priority !== old.priority) {
      activities.unshift({
        id: `la_${Date.now()}`,
        type: 'priority_change',
        description: `Priority changed from ${old.priority} to ${updates.priority}`,
        user_name: currentUser?.full_name || 'Staff',
        created_at: now
      });
    }

    const updated: Lead = {
      ...old,
      ...updates,
      activities,
      updated_at: now
    };

    leads[index] = updated;
    this.saveStore(leads);
    return updated;
  }

  public async updateLeadStage(
    id: string,
    stage: LeadStage,
    lostReason?: Lead['lost_reason'],
    lostNotes?: string
  ): Promise<Lead> {
    const leads = this.getStore();
    const index = leads.findIndex(l => l.id === id);
    if (index === -1) throw new Error('Lead not found');

    const old = leads[index];
    const currentUser = await getCurrentUser();
    const now = new Date().toISOString();

    const activity: LeadActivity = {
      id: `la_${Date.now()}`,
      type: 'stage_change',
      description: `Stage moved from ${old.stage.replace('_', ' ')} to ${stage.replace('_', ' ')}`,
      user_name: currentUser?.full_name || 'Staff',
      created_at: now
    };

    const updated: Lead = {
      ...old,
      stage,
      lost_reason: stage === 'lost' ? lostReason : undefined,
      lost_notes: stage === 'lost' ? lostNotes : undefined,
      activities: [activity, ...old.activities],
      updated_at: now
    };

    leads[index] = updated;
    this.saveStore(leads);
    return updated;
  }

  public async addLeadNote(id: string, content: string): Promise<LeadNote> {
    const leads = this.getStore();
    const index = leads.findIndex(l => l.id === id);
    if (index === -1) throw new Error('Lead not found');

    const currentUser = await getCurrentUser();
    const now = new Date().toISOString();

    const note: LeadNote = {
      id: `ln_${Date.now()}`,
      content: content.trim(),
      author_id: currentUser?.id,
      author_name: currentUser?.full_name || 'Staff',
      created_at: now
    };

    const activity: LeadActivity = {
      id: `la_${Date.now()}`,
      type: 'note_added',
      description: `Added note: "${content.slice(0, 30)}${content.length > 30 ? '...' : ''}"`,
      user_name: currentUser?.full_name || 'Staff',
      created_at: now
    };

    leads[index].notes.unshift(note);
    leads[index].activities.unshift(activity);
    leads[index].updated_at = now;

    this.saveStore(leads);
    return note;
  }

  public async convertLead(id: string, addToCustomers: boolean = true): Promise<{ lead: Lead; customerCreated: boolean }> {
    const leads = this.getStore();
    const index = leads.findIndex(l => l.id === id);
    if (index === -1) throw new Error('Lead not found');

    const lead = leads[index];
    const currentUser = await getCurrentUser();
    const now = new Date().toISOString();
    let customerCreated = false;
    let customerId = lead.converted_customer_id;

    if (addToCustomers) {
      try {
        // Check if customer with this phone already exists
        const existing = await getCustomers({ search: lead.phone });
        const match = existing.items.find((c: Customer) => c.phone.replace(/\D/g, '') === lead.phone.replace(/\D/g, ''));
        if (match) {
          customerId = match.id;
        } else {
          // Create new customer
          const newCust = await createCustomer({
            name: lead.customer_name,
            phone: lead.phone,
            branch_id: lead.branch_id,
            customer_type: 'Regular',
            status: 'active',
            consent: lead.consent_whatsapp,
            source: 'Lead Conversion',
          });
          customerId = newCust.id;
          customerCreated = true;
        }
      } catch (err) {
        console.error('Error creating customer on lead convert:', err);
      }
    }

    const activity: LeadActivity = {
      id: `la_${Date.now()}`,
      type: 'converted',
      description: customerCreated
        ? `Lead converted and new customer profile created in database`
        : `Lead marked as Converted (linked to customer record)`,
      user_name: currentUser?.full_name || 'Staff',
      created_at: now
    };

    const updated: Lead = {
      ...lead,
      stage: 'converted',
      converted_customer_id: customerId,
      activities: [activity, ...lead.activities],
      updated_at: now
    };

    leads[index] = updated;
    this.saveStore(leads);
    return { lead: updated, customerCreated };
  }

  public generateAISummary(lead: Partial<Lead>): LeadAISummary {
    const text = `${lead.enquiry || ''} ${(lead.interest_tags || []).join(' ')}`.toLowerCase();
    let category: LeadAISummary['category'] = 'product_enquiry';
    let suggested_priority: Lead['priority'] = 'medium';
    const bullets: string[] = [];

    if (text.includes('wedding') || text.includes('sherwani') || text.includes('groom') || text.includes('reception') || text.includes('tuxedo')) {
      category = 'wedding_occasion';
      suggested_priority = 'high';
      bullets.push('Wedding / occasion wear enquiry with high ticket potential');
      bullets.push('Requires custom fitting & tailoring trial coordination');
    } else if (text.includes('bulk') || text.includes('corporate') || text.includes('uniform') || text.includes('bank')) {
      category = 'bulk_corporate';
      suggested_priority = 'high';
      bullets.push('B2B or corporate order enquiry');
      bullets.push('Sample dispatch & tier pricing discussion recommended');
    } else if (text.includes('location') || text.includes('timing') || text.includes('hours') || text.includes('open') || text.includes('address')) {
      category = 'store_info';
      suggested_priority = 'low';
      bullets.push('Customer requested physical store details & visiting hours');
    } else {
      category = 'product_enquiry';
      suggested_priority = 'medium';
      bullets.push('Product range and fabric inquiry');
    }

    bullets.push(`Lead captured via ${(lead.source || 'walk_in').replace('_', ' ')}`);

    return {
      category,
      suggested_priority,
      bullets,
      generated_at: new Date().toISOString()
    };
  }

  public async aiClassifyLead(id: string): Promise<LeadAISummary> {
    const lead = await this.getLeadById(id);
    if (!lead) throw new Error('Lead not found');

    const summary = this.generateAISummary(lead);
    await this.updateLead(id, { ai_summary: summary });
    return summary;
  }
}

export const leadsService = new LeadsService();
