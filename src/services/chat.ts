import {
  ChatConversation,
  ChatMessage,
  KBArticle,
  ChatSettings,
  ConversationStatus,
} from '@/types/models';
import {
  SEED_CONVERSATIONS,
  SEED_MESSAGES,
  SEED_KB_ARTICLES,
  SEED_CHAT_SETTINGS,
} from '@/mocks/data/chat';
import { getCurrentUser } from './auth';
import { leadsService } from './leads';

const CONV_KEY = 'rs_chat_conversations';
const MSG_KEY = 'rs_chat_messages';
const KB_KEY = 'rs_chat_kb_articles';
const SETTINGS_KEY = 'rs_chat_settings';

class ChatService {
  private getConversationsStore(): ChatConversation[] {
    const raw = localStorage.getItem(CONV_KEY);
    if (!raw) {
      localStorage.setItem(CONV_KEY, JSON.stringify(SEED_CONVERSATIONS));
      return [...SEED_CONVERSATIONS];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [...SEED_CONVERSATIONS];
    }
  }

  private saveConversationsStore(convs: ChatConversation[]): void {
    localStorage.setItem(CONV_KEY, JSON.stringify(convs));
    window.dispatchEvent(new CustomEvent('rs_chat_updated'));
  }

  private getMessagesStore(): Record<string, ChatMessage[]> {
    const raw = localStorage.getItem(MSG_KEY);
    if (!raw) {
      localStorage.setItem(MSG_KEY, JSON.stringify(SEED_MESSAGES));
      return { ...SEED_MESSAGES };
    }
    try {
      return JSON.parse(raw);
    } catch {
      return { ...SEED_MESSAGES };
    }
  }

  private saveMessagesStore(messages: Record<string, ChatMessage[]>): void {
    localStorage.setItem(MSG_KEY, JSON.stringify(messages));
    window.dispatchEvent(new CustomEvent('rs_chat_updated'));
  }

  public async getConversations(
    filterStatus: 'all' | ConversationStatus = 'all',
    search: string = '',
    branchId?: string
  ): Promise<ChatConversation[]> {
    let items = this.getConversationsStore();
    const currentUser = await getCurrentUser();

    // Branch scoping
    if (currentUser?.role === 'branch_user' && currentUser.branch_id) {
      items = items.filter((c) => c.branch_id === currentUser.branch_id);
    } else if (branchId && branchId !== 'all') {
      items = items.filter((c) => c.branch_id === branchId);
    }

    // Status filter
    if (filterStatus !== 'all') {
      items = items.filter((c) => c.status === filterStatus);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      items = items.filter(
        (c) =>
          c.customer_name.toLowerCase().includes(q) ||
          (c.customer_phone && c.customer_phone.includes(q)) ||
          (c.last_message && c.last_message.toLowerCase().includes(q)) ||
          c.interest_tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort by latest message descending
    return items.sort(
      (a, b) =>
        new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
    );
  }

  public async getConversationCounts(branchId?: string): Promise<{
    all: number;
    open: number;
    pending: number;
    closed: number;
  }> {
    let items = this.getConversationsStore();
    const currentUser = await getCurrentUser();

    if (currentUser?.role === 'branch_user' && currentUser.branch_id) {
      items = items.filter((c) => c.branch_id === currentUser.branch_id);
    } else if (branchId && branchId !== 'all') {
      items = items.filter((c) => c.branch_id === branchId);
    }

    return {
      all: items.length,
      open: items.filter((c) => c.status === 'open').length,
      pending: items.filter((c) => c.status === 'pending').length,
      closed: items.filter((c) => c.status === 'closed').length,
    };
  }

  public async getConversationById(id: string): Promise<ChatConversation | null> {
    const convs = this.getConversationsStore();
    return convs.find((c) => c.id === id) || null;
  }

  public async getMessages(conversationId: string): Promise<ChatMessage[]> {
    const store = this.getMessagesStore();
    return store[conversationId] || [];
  }

  public async sendStaffMessage(
    conversationId: string,
    text: string
  ): Promise<ChatMessage> {
    const messages = this.getMessagesStore();
    const convs = this.getConversationsStore();
    const currentUser = await getCurrentUser();

    const now = new Date().toISOString();
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      conversation_id: conversationId,
      sender: 'staff',
      sender_name: currentUser?.full_name || 'Staff Member',
      text: text.trim(),
      created_at: now,
    };

    if (!messages[conversationId]) messages[conversationId] = [];
    messages[conversationId].push(newMsg);
    this.saveMessagesStore(messages);

    // Update conversation: staff took over -> pause AI, update last message
    const idx = convs.findIndex((c) => c.id === conversationId);
    if (idx !== -1) {
      convs[idx].ai_paused = true;
      convs[idx].last_message = text.trim();
      convs[idx].last_message_at = now;
      convs[idx].status = 'open'; // move from pending to open if replied
      this.saveConversationsStore(convs);
    }

    return newMsg;
  }

  public async resumeAI(conversationId: string): Promise<void> {
    const convs = this.getConversationsStore();
    const idx = convs.findIndex((c) => c.id === conversationId);
    if (idx !== -1) {
      convs[idx].ai_paused = false;
      this.saveConversationsStore(convs);
    }
  }

  public async updateConversationStatus(
    conversationId: string,
    status: ConversationStatus
  ): Promise<void> {
    const convs = this.getConversationsStore();
    const idx = convs.findIndex((c) => c.id === conversationId);
    if (idx !== -1) {
      convs[idx].status = status;
      this.saveConversationsStore(convs);
    }
  }

  public async assignBranch(
    conversationId: string,
    branchId: string
  ): Promise<void> {
    const convs = this.getConversationsStore();
    const idx = convs.findIndex((c) => c.id === conversationId);
    if (idx !== -1) {
      convs[idx].branch_id = branchId;
      this.saveConversationsStore(convs);
    }
  }

  public async createLeadFromConversation(conversationId: string): Promise<string> {
    const convs = this.getConversationsStore();
    const conv = convs.find((c) => c.id === conversationId);
    if (!conv) throw new Error('Conversation not found');

    const lead = await leadsService.createLead({
      customer_name: conv.customer_name,
      phone: conv.customer_phone || '+919848011223',
      enquiry: `Enquiry from ${conv.channel} chat: ${conv.last_message || 'General store enquiry'}`,
      preferred_branch_id: conv.branch_id,
      interest_tags: conv.interest_tags.length > 0 ? conv.interest_tags : ['Chatbot Lead'],
      source: conv.channel === 'whatsapp' ? 'whatsapp' : 'website_chat',
      priority: 'high',
      consent_whatsapp: true,
    });

    conv.linked_lead_id = lead.id;
    this.saveConversationsStore(convs);
    return lead.id;
  }

  // -----------------------------------------------------------
  // KNOWLEDGE BASE ARTICLES
  // -----------------------------------------------------------
  public async getKBArticles(): Promise<KBArticle[]> {
    const raw = localStorage.getItem(KB_KEY);
    if (!raw) {
      localStorage.setItem(KB_KEY, JSON.stringify(SEED_KB_ARTICLES));
      return [...SEED_KB_ARTICLES];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [...SEED_KB_ARTICLES];
    }
  }

  public async saveKBArticles(articles: KBArticle[]): Promise<void> {
    localStorage.setItem(KB_KEY, JSON.stringify(articles));
  }

  public async createKBArticle(data: Omit<KBArticle, 'id' | 'updated_at'>): Promise<KBArticle> {
    const articles = await this.getKBArticles();
    const newArticle: KBArticle = {
      ...data,
      id: `kb_${Date.now()}`,
      updated_at: new Date().toISOString(),
    };
    articles.unshift(newArticle);
    await this.saveKBArticles(articles);
    return newArticle;
  }

  public async updateKBArticle(id: string, updates: Partial<KBArticle>): Promise<KBArticle> {
    const articles = await this.getKBArticles();
    const idx = articles.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('Article not found');
    articles[idx] = {
      ...articles[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    await this.saveKBArticles(articles);
    return articles[idx];
  }

  public async deleteKBArticle(id: string): Promise<void> {
    const articles = await this.getKBArticles();
    const filtered = articles.filter((a) => a.id !== id);
    await this.saveKBArticles(filtered);
  }

  // -----------------------------------------------------------
  // CHAT SETTINGS
  // -----------------------------------------------------------
  public async getChatSettings(): Promise<ChatSettings> {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(SEED_CHAT_SETTINGS));
      return { ...SEED_CHAT_SETTINGS };
    }
    try {
      return JSON.parse(raw);
    } catch {
      return { ...SEED_CHAT_SETTINGS };
    }
  }

  public async updateChatSettings(settings: Partial<ChatSettings>): Promise<ChatSettings> {
    const current = await this.getChatSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  }

  // -----------------------------------------------------------
  // PUBLIC WEBSITE CHAT WIDGET & MOCK AI ENGINE
  // -----------------------------------------------------------
  public async startPublicChat(data: {
    name: string;
    phone: string;
    branch_id: string;
    consent: boolean;
  }): Promise<{ conversationId: string; welcomeMessage: ChatMessage }> {
    const convs = this.getConversationsStore();
    const messages = this.getMessagesStore();
    const settings = await this.getChatSettings();

    // Check if open conversation with this phone already exists
    let conv = convs.find(
      (c) => c.customer_phone === data.phone && c.status !== 'closed'
    );

    const now = new Date().toISOString();

    if (!conv) {
      const convId = `conv_web_${Date.now()}`;
      conv = {
        id: convId,
        customer_name: data.name.trim(),
        customer_phone: data.phone.trim(),
        channel: 'website',
        branch_id: data.branch_id || 'branch_1',
        status: 'open',
        unread_count: 0,
        ai_paused: false,
        last_message: settings.welcome_message,
        last_message_at: now,
        interest_tags: ['Website Visitor'],
        context_bullets: [
          `New chat started on website widget`,
          `Branch selected: ${data.branch_id}`,
          `WhatsApp consent: ${data.consent ? 'Granted' : 'Declined'}`,
        ],
        created_at: now,
        updated_at: now,
      };

      convs.unshift(conv);
      this.saveConversationsStore(convs);

      // Create welcome message
      const welcome: ChatMessage = {
        id: `msg_welcome_${Date.now()}`,
        conversation_id: conv.id,
        sender: 'ai',
        text: settings.welcome_message,
        created_at: now,
      };

      messages[conv.id] = [welcome];
      this.saveMessagesStore(messages);

      return { conversationId: conv.id, welcomeMessage: welcome };
    }

    const convMessages = messages[conv.id] || [];
    return {
      conversationId: conv.id,
      welcomeMessage: convMessages[0] || {
        id: `msg_welcome_${Date.now()}`,
        conversation_id: conv.id,
        sender: 'ai',
        text: settings.welcome_message,
        created_at: now,
      },
    };
  }

  public async sendPublicMessage(
    conversationId: string,
    text: string
  ): Promise<{ customerMsg: ChatMessage; aiMsg?: ChatMessage }> {
    const messages = this.getMessagesStore();
    const convs = this.getConversationsStore();
    const kbArticles = await this.getKBArticles();
    const settings = await this.getChatSettings();

    const now = new Date().toISOString();

    const customerMsg: ChatMessage = {
      id: `msg_cust_${Date.now()}`,
      conversation_id: conversationId,
      sender: 'customer',
      text: text.trim(),
      created_at: now,
    };

    if (!messages[conversationId]) messages[conversationId] = [];
    messages[conversationId].push(customerMsg);

    // Update conversation snippet
    const convIdx = convs.findIndex((c) => c.id === conversationId);
    let conv = convIdx !== -1 ? convs[convIdx] : null;

    if (conv) {
      conv.last_message = text.trim();
      conv.last_message_at = now;
      conv.unread_count += 1;
    }

    const lower = text.toLowerCase().trim();

    // Check for Human Handover ("talk to staff", "agent", "human", "representative", "manager")
    const isHandover =
      lower.includes('staff') ||
      lower.includes('human') ||
      lower.includes('agent') ||
      lower.includes('talk to') ||
      lower.includes('representative') ||
      lower.includes('manager') ||
      lower.includes('call me');

    // Check for Stock / Price / Delivery guarantee questions
    const isStockOrPrice =
      lower.includes('in stock') ||
      lower.includes('available right now') ||
      lower.includes('price lock') ||
      lower.includes('deliver today') ||
      lower.includes('guarantee stock');

    let aiMsg: ChatMessage | undefined;

    // If AI is enabled and not paused by human staff
    if (settings.ai_enabled && conv && !conv.ai_paused) {
      let replyText = '';

      if (isHandover) {
        conv.status = 'pending';
        conv.ai_paused = true;
        conv.interest_tags.push('Handover Requested');
        conv.context_bullets.push('Customer requested human staff handover');

        // Add system message
        const sysMsg: ChatMessage = {
          id: `msg_sys_${Date.now()}`,
          conversation_id: conversationId,
          sender: 'system',
          text: 'Handed over to staff. Store team will reply shortly.',
          created_at: new Date(Date.now() + 200).toISOString(),
        };
        messages[conversationId].push(sysMsg);

        replyText = settings.handover_message;
      } else if (isStockOrPrice) {
        replyText =
          "We have high inventory in our stores, but real-time sizes fluctuate quickly during peak hours. Would you like me to connect you with our store team to hold this piece for you?";
      } else {
        // Keyword match against active KB articles
        const activeArticles = kbArticles.filter((a) => a.is_active);
        const match = activeArticles.find((art) =>
          art.keywords.some((kw) => lower.includes(kw.toLowerCase()))
        );

        if (match) {
          replyText = match.content;
        } else {
          replyText =
            "I'm not sure about that. Would you like me to connect you with our store team?";
        }
      }

      aiMsg = {
        id: `msg_ai_${Date.now() + 500}`,
        conversation_id: conversationId,
        sender: 'ai',
        text: replyText,
        created_at: new Date(Date.now() + 500).toISOString(),
      };
      messages[conversationId].push(aiMsg);
      conv.last_message = replyText;
    }

    // Auto-create lead on purchase intent or handover
    if (
      conv &&
      !conv.linked_lead_id &&
      (isHandover ||
        lower.includes('wedding') ||
        lower.includes('buy') ||
        lower.includes('order') ||
        lower.includes('size'))
    ) {
      try {
        const lead = await leadsService.createLead({
          customer_name: conv.customer_name,
          phone: conv.customer_phone || '+919848011223',
          enquiry: `Website chat enquiry: "${text.slice(0, 100)}"`,
          preferred_branch_id: conv.branch_id,
          interest_tags: conv.interest_tags,
          source: 'website_chat',
          priority: isHandover ? 'high' : 'medium',
          consent_whatsapp: true,
        });
        conv.linked_lead_id = lead.id;
      } catch (e) {
        console.error('Failed to auto-create lead:', e);
      }
    }

    if (convIdx !== -1 && conv) {
      convs[convIdx] = conv;
      this.saveConversationsStore(convs);
    }
    this.saveMessagesStore(messages);

    return { customerMsg, aiMsg };
  }
}

export const chatService = new ChatService();
