import { USE_MOCKS, apiClient } from './apiClient.js';
import { mockStorage, delay } from '../mocks/mockStorage.js';
import { queryKnowledgeBase } from '../utils/aiClassifier.js';

export const chatService = {
  async getChats(branchId = null) {
    if (USE_MOCKS) {
      await delay(150);
      let chats = mockStorage.getChats();
      if (branchId && branchId !== 'ALL') {
        chats = chats.filter(c => !c.branchId || c.branchId === branchId);
      }
      return chats;
    }
    return apiClient(`/chats${branchId ? `?branchId=${branchId}` : ''}`);
  },

  async getChat(id) {
    if (USE_MOCKS) {
      await delay(100);
      const chats = mockStorage.getChats();
      const chat = chats.find(c => c.id === id);
      if (!chat) throw new Error('Chat session not found');
      return chat;
    }
    return apiClient(`/chats/${id}`);
  },

  async createChat(initialData = {}) {
    if (USE_MOCKS) {
      await delay(150);
      const newChat = {
        id: `CHAT-${Date.now().toString().slice(-4)}`,
        channel: 'website',
        visitorName: initialData.visitorName || 'Website Visitor',
        visitorMobile: initialData.visitorMobile || '',
        startedAt: new Date().toISOString(),
        branchId: initialData.branchId || 'B1',
        status: 'active',
        handoverRequested: false,
        handoverTimestamp: null,
        leadId: null,
        messages: [
          {
            id: `msg-${Date.now()}-0`,
            role: 'assistant',
            text: 'Namaste! Welcome to RS Mens World AI Assistant. How can we help you today? Ask about store hours, custom wedding suits, royal sherwanis, or tailoring.',
            timestamp: new Date().toISOString(),
            isAi: true,
            isApprovedFaq: true,
          },
        ],
      };
      mockStorage.addChat(newChat);
      return newChat;
    }
    return apiClient('/chats', {
      method: 'POST',
      body: JSON.stringify(initialData),
    });
  },

  async sendMessage(chatId, userMessageText) {
    if (USE_MOCKS) {
      await delay(250);
      const chat = await this.getChat(chatId);
      const kb = mockStorage.getKnowledgeBase();

      const userMsg = {
        id: `msg-${Date.now()}-user`,
        role: 'user',
        text: userMessageText,
        timestamp: new Date().toISOString(),
      };

      // Match against approved knowledge base
      const matchResult = queryKnowledgeBase(userMessageText, kb);

      const aiMsg = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        text: matchResult.response,
        timestamp: new Date(Date.now() + 500).toISOString(),
        isAi: true,
        isApprovedFaq: matchResult.isApproved,
        isUnknown: !matchResult.isApproved,
      };

      const updatedMessages = [...chat.messages, userMsg, aiMsg];
      const updatedChat = mockStorage.updateChat(chatId, {
        messages: updatedMessages,
      });

      return { chat: updatedChat, aiReply: aiMsg };
    }

    return apiClient(`/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text: userMessageText }),
    });
  },

  async requestHandover(chatId, branchId = null) {
    if (USE_MOCKS) {
      await delay(150);
      const chat = await this.getChat(chatId);
      const systemMsg = {
        id: `msg-${Date.now()}-sys`,
        role: 'system',
        text: `Staff handover requested. Alerting ${branchId || chat.branchId || 'store'} team. A sales representative will contact you shortly.`,
        timestamp: new Date().toISOString(),
      };

      return mockStorage.updateChat(chatId, {
        status: 'handover_pending',
        handoverRequested: true,
        handoverTimestamp: new Date().toISOString(),
        branchId: branchId || chat.branchId,
        messages: [...chat.messages, systemMsg],
      });
    }
    return apiClient(`/chats/${chatId}/handover`, {
      method: 'POST',
      body: JSON.stringify({ branchId }),
    });
  },

  async resolveChat(chatId) {
    if (USE_MOCKS) {
      await delay(100);
      return mockStorage.updateChat(chatId, {
        status: 'resolved',
      });
    }
    return apiClient(`/chats/${chatId}/resolve`, { method: 'POST' });
  },

  async getKnowledgeBase() {
    if (USE_MOCKS) {
      await delay(100);
      return mockStorage.getKnowledgeBase();
    }
    return apiClient('/knowledge-base');
  },
};
