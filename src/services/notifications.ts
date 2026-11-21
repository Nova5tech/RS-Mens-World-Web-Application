import { NotificationItem } from '@/types/models';
import { leadsService } from './leads';
import { chatService } from './chat';
import { getCurrentUser } from './auth';

const NOTIFICATIONS_READ_KEY = 'rs_read_notifications';

export const notificationsService = {
  getNotifications: async (branchId?: string): Promise<NotificationItem[]> => {
    const currentUser = await getCurrentUser();
    const effectiveBranch =
      currentUser?.role === 'branch_user' && currentUser.branch_id
        ? currentUser.branch_id
        : branchId && branchId !== 'all'
        ? branchId
        : undefined;

    const readRaw = localStorage.getItem(NOTIFICATIONS_READ_KEY);
    const readIds: string[] = readRaw ? JSON.parse(readRaw) : [];

    const items: NotificationItem[] = [];

    // 1. Follow-ups due today / overdue
    try {
      const leads = await leadsService.getAllLeadsForKanban(
        effectiveBranch ? { branch_id: effectiveBranch } : undefined
      );
      const today = new Date().toISOString().slice(0, 10);
      const dueLeads = leads.filter(
        (l) => l.follow_up_date && l.follow_up_date <= today && l.stage !== 'converted' && l.stage !== 'lost'
      );

      dueLeads.slice(0, 4).forEach((l) => {
        const id = `notif_lead_${l.id}`;
        items.push({
          id,
          title: `Follow-up Due: ${l.customer_name}`,
          description: `${l.enquiry || 'Occasion wear enquiry'} • ${l.branch_id}`,
          type: 'lead_followup',
          read: readIds.includes(id),
          link: '/leads',
          lead_id: l.id,
          created_at: new Date().toISOString(),
        });
      });
    } catch (e) {
      console.error(e);
    }

    // 2. Chat handovers pending
    try {
      const convs = await chatService.getConversations('pending', '', effectiveBranch);
      convs.slice(0, 3).forEach((c) => {
        const id = `notif_chat_${c.id}`;
        items.push({
          id,
          title: `Human Handover: ${c.customer_name}`,
          description: `Customer requested store staff assistance on ${c.channel}`,
          type: 'chat_pending',
          read: readIds.includes(id),
          link: '/chatbot',
          created_at: c.last_message_at,
        });
      });
    } catch (e) {
      console.error(e);
    }

    // 3. Campaign finished broadcast
    items.push({
      id: 'notif_camp_cmp101',
      title: 'Campaign Broadcast Completed',
      description: 'Winter Collection Launch broadcast delivered to 482 customers (96% delivery rate)',
      type: 'campaign_done',
      read: readIds.includes('notif_camp_cmp101'),
      link: '/campaigns',
      created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    });

    // 4. Petpooja Import finished
    items.push({
      id: 'notif_import_nov',
      title: 'Petpooja POS Sync Finished',
      description: 'Import batch processed successfully: 48 new customers registered, 2 profiles updated',
      type: 'import_done',
      read: readIds.includes('notif_import_nov'),
      link: '/customers',
      created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    });

    return items;
  },

  markAsRead: (id: string): void => {
    const readRaw = localStorage.getItem(NOTIFICATIONS_READ_KEY);
    const readIds: string[] = readRaw ? JSON.parse(readRaw) : [];
    if (!readIds.includes(id)) {
      readIds.push(id);
      localStorage.setItem(NOTIFICATIONS_READ_KEY, JSON.stringify(readIds));
    }
  },

  markAllAsRead: (ids: string[]): void => {
    const readRaw = localStorage.getItem(NOTIFICATIONS_READ_KEY);
    const readIds: string[] = readRaw ? JSON.parse(readRaw) : [];
    const merged = Array.from(new Set([...readIds, ...ids]));
    localStorage.setItem(NOTIFICATIONS_READ_KEY, JSON.stringify(merged));
  },
};
