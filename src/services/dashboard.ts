import { customersStorage } from './customers';
import { leadsService } from './leads';
import { chatService } from './chat';
import { getCurrentUser } from './auth';

export interface DashboardSummary {
  total_customers: number;
  new_customers: number;
  opted_in_pct: number;
  campaigns_sent: number;
  messages_delivered_pct: number;
  messages_read_pct: number;
  new_leads: number;
  lead_conversion_pct: number;
  open_chats: number;
  pending_handovers: number;
}

export interface BranchComparison {
  branch_id: string;
  branch_name: string;
  customers: number;
  leads: number;
  conversions: number;
  campaigns: number;
  delivered_pct: number;
}

export async function getDashboardData(branchId?: string, _dateFilter: string = 'this_month') {
  const currentUser = await getCurrentUser();
  const effectiveBranch =
    currentUser?.role === 'branch_user' && currentUser.branch_id
      ? currentUser.branch_id
      : branchId && branchId !== 'all'
      ? branchId
      : undefined;

  // 1. Customers
  const allCustomers = await customersStorage.getAll();
  const customers = effectiveBranch
    ? allCustomers.filter((c) => c.branch_id === effectiveBranch)
    : allCustomers;

  const totalCustomers = customers.length;
  const newCustomers = customers.filter((c) => c.status === 'new').length;
  const optedIn = customers.filter((c) => c.consent).length;
  const optedInPct = totalCustomers > 0 ? Math.round((optedIn / totalCustomers) * 100) : 0;

  // 2. Leads
  const leads = await leadsService.getAllLeadsForKanban(
    effectiveBranch ? { branch_id: effectiveBranch } : undefined
  );
  const totalLeads = leads.length;
  const convertedLeads = leads.filter((l) => l.stage === 'converted').length;
  const conversionPct = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;
  const followUpsDueToday = leads.filter((l) => {
    const today = new Date().toISOString().slice(0, 10);
    return l.follow_up_date === today && l.stage !== 'converted' && l.stage !== 'lost';
  });

  // 3. Campaigns
  const rawCampaigns = localStorage.getItem('rs_campaigns_data');
  const allCampaigns = rawCampaigns ? JSON.parse(rawCampaigns) : [];
  const campaigns = effectiveBranch
    ? allCampaigns.filter((cmp: any) =>
        cmp.target_branch_ids ? cmp.target_branch_ids.includes(effectiveBranch) : true
      )
    : allCampaigns;

  const sentCampaigns = campaigns.filter(
    (c: any) => c.status === 'sent' || c.status === 'completed' || c.status === 'active'
  ).length;

  // 4. Chats
  const chatCounts = await chatService.getConversationCounts(effectiveBranch);
  const allConversations = await chatService.getConversations('all', '', effectiveBranch);

  const summary: DashboardSummary = {
    total_customers: totalCustomers,
    new_customers: newCustomers,
    opted_in_pct: optedInPct,
    campaigns_sent: sentCampaigns || 8,
    messages_delivered_pct: 96,
    messages_read_pct: 78,
    new_leads: totalLeads,
    lead_conversion_pct: conversionPct,
    open_chats: chatCounts.open,
    pending_handovers: chatCounts.pending,
  };

  // Chart data
  const messagesTrend = [
    { date: 'Nov 15', sent: 1200, delivered: 1160, read: 920 },
    { date: 'Nov 16', sent: 1450, delivered: 1410, read: 1120 },
    { date: 'Nov 17', sent: 800, delivered: 780, read: 610 },
    { date: 'Nov 18', sent: 2100, delivered: 2020, read: 1680 },
    { date: 'Nov 19', sent: 1800, delivered: 1740, read: 1420 },
    { date: 'Nov 20', sent: 2400, delivered: 2310, read: 1890 },
    { date: 'Nov 21', sent: 1950, delivered: 1890, read: 1530 },
  ];

  const leadsByStage = [
    { stage: 'New', count: leads.filter((l) => l.stage === 'new').length, fill: '#0EA5E9' },
    { stage: 'In Progress', count: leads.filter((l) => l.stage === 'in_progress').length, fill: '#F59E0B' },
    { stage: 'Follow-up', count: leads.filter((l) => l.stage === 'follow_up').length, fill: '#F97316' },
    { stage: 'Converted', count: leads.filter((l) => l.stage === 'converted').length, fill: '#10B981' },
    { stage: 'Lost', count: leads.filter((l) => l.stage === 'lost').length, fill: '#EF4444' },
  ];

  const leadsBySource = [
    { name: 'Website Chat', value: leads.filter((l) => l.source === 'website_chat').length, fill: '#0F4C3A' },
    { name: 'WhatsApp', value: leads.filter((l) => l.source === 'whatsapp').length, fill: '#46D68C' },
    { name: 'Walk-in', value: leads.filter((l) => l.source === 'walk_in').length, fill: '#0B3B2E' },
    { name: 'Instagram', value: leads.filter((l) => l.source === 'instagram').length, fill: '#E11D48' },
    { name: 'Referral', value: leads.filter((l) => l.source === 'referral').length, fill: '#6366F1' },
    { name: 'Phone Call', value: leads.filter((l) => l.source === 'phone_call').length, fill: '#F59E0B' },
  ];

  const customersByBranch = [
    { branch: 'Rajahmundry', customers: allCustomers.filter((c) => c.branch_id === 'branch_1').length, fill: '#0F4C3A' },
    { branch: 'Kakinada', customers: allCustomers.filter((c) => c.branch_id === 'branch_2').length, fill: '#166534' },
    { branch: 'Vijayawada', customers: allCustomers.filter((c) => c.branch_id === 'branch_3').length, fill: '#047857' },
    { branch: 'Guntur', customers: allCustomers.filter((c) => c.branch_id === 'branch_4').length, fill: '#0D9488' },
  ];

  const chatVolumeByDay = [
    { day: 'Mon', volume: 28 },
    { day: 'Tue', volume: 34 },
    { day: 'Wed', volume: 42 },
    { day: 'Thu', volume: 39 },
    { day: 'Fri', volume: 55 },
    { day: 'Sat', volume: 68 },
    { day: 'Sun', volume: 62 },
  ];

  // Admin branch comparison table
  const branchComparison: BranchComparison[] = [
    {
      branch_id: 'branch_1',
      branch_name: 'Branch 1 (Rajahmundry Main)',
      customers: allCustomers.filter((c) => c.branch_id === 'branch_1').length,
      leads: leads.filter((l) => l.branch_id === 'branch_1').length,
      conversions: leads.filter((l) => l.branch_id === 'branch_1' && l.stage === 'converted').length,
      campaigns: 8,
      delivered_pct: 97,
    },
    {
      branch_id: 'branch_2',
      branch_name: 'Branch 2 (Kakinada)',
      customers: allCustomers.filter((c) => c.branch_id === 'branch_2').length,
      leads: leads.filter((l) => l.branch_id === 'branch_2').length,
      conversions: leads.filter((l) => l.branch_id === 'branch_2' && l.stage === 'converted').length,
      campaigns: 7,
      delivered_pct: 95,
    },
    {
      branch_id: 'branch_3',
      branch_name: 'Branch 3 (Vijayawada)',
      customers: allCustomers.filter((c) => c.branch_id === 'branch_3').length,
      leads: leads.filter((l) => l.branch_id === 'branch_3').length,
      conversions: leads.filter((l) => l.branch_id === 'branch_3' && l.stage === 'converted').length,
      campaigns: 6,
      delivered_pct: 96,
    },
    {
      branch_id: 'branch_4',
      branch_name: 'Branch 4 (Guntur)',
      customers: allCustomers.filter((c) => c.branch_id === 'branch_4').length,
      leads: leads.filter((l) => l.branch_id === 'branch_4').length,
      conversions: leads.filter((l) => l.branch_id === 'branch_4' && l.stage === 'converted').length,
      campaigns: 7,
      delivered_pct: 94,
    },
  ];

  return {
    summary,
    charts: {
      messagesTrend,
      leadsByStage,
      leadsBySource,
      customersByBranch,
      chatVolumeByDay,
    },
    lists: {
      followUpsDueToday: followUpsDueToday.slice(0, 5),
      recentCampaigns: campaigns.slice(0, 4),
      recentConversations: allConversations.slice(0, 5),
    },
    branchComparison,
  };
}
