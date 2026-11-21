import { ChatConversation, ChatMessage, KBArticle, ChatSettings } from '@/types/models';

export const SEED_CHAT_SETTINGS: ChatSettings = {
  ai_enabled: true,
  online_status: 'online',
  welcome_message: 'Hello! Welcome to RS Mens World. How can I help you find the perfect outfit today?',
  offline_message: 'Our stores are currently closed for the night. Please leave your enquiry and our team will get back to you by 10 AM tomorrow.',
  handover_message: "I am connecting you with a store fashion consultant right now. Please hold on for a moment while our team reviews your message.",
  disclaimer_text: "Note: AI cannot guarantee real-time stock holds, price locks, or rush delivery promises without store confirmation."
};

export const SEED_KB_ARTICLES: KBArticle[] = [
  {
    id: 'kb_01',
    title: 'Store Locations & Addresses',
    category: 'Store Info',
    branch_id: 'all',
    keywords: ['location', 'address', 'store', 'near me', 'branches', 'where', 'city', 'rajahmundry', 'kakinada', 'vijayawada', 'guntur'],
    content: `RS Mens World has 4 branches in Andhra Pradesh:
1. Rajahmundry Main Branch (Flagship): Main Road, Near Kotipalli Bus Stand, Rajahmundry - 533101.
2. Kakinada Branch: Cinema Road, Near Surya Rao Pet, Kakinada - 533001.
3. Vijayawada Branch: Bandar Road, Opp. PVP Mall, Vijayawada - 520010.
4. Guntur Branch: Arundelpet Main Road, 4th Line, Guntur - 522002.
Valet parking is available at all our stores.`,
    is_active: true,
    updated_at: '2026-11-20T10:00:00Z'
  },
  {
    id: 'kb_02',
    title: 'Store Timings & Working Days',
    category: 'Store Info',
    branch_id: 'all',
    keywords: ['timings', 'hours', 'time', 'open', 'close', 'sunday', 'weekend', 'working hours'],
    content: `All RS Mens World stores are open 7 days a week:
• Monday to Sunday: 10:00 AM to 9:30 PM.
• Tailoring trial masters are available daily from 11:00 AM to 8:30 PM.
• Stores remain open on all festivals and national holidays with special festive hours.`,
    is_active: true,
    updated_at: '2026-11-20T10:00:00Z'
  },
  {
    id: 'kb_03',
    title: 'Exchange & Return Policy',
    category: 'Customer Support',
    branch_id: 'all',
    keywords: ['return', 'exchange', 'refund', 'policy', 'replacement', 'bill', 'damaged', 'size exchange'],
    content: `Exchange Policy:
• Merchandise can be exchanged within 7 days of purchase at any of our 4 branches.
• Original tax invoice and price tags must be intact.
• Altered or custom-tailored garments cannot be returned or exchanged.
• Credit note is issued if immediate replacement is not preferred; cash refunds are not offered.`,
    is_active: true,
    updated_at: '2026-11-20T10:00:00Z'
  },
  {
    id: 'kb_04',
    title: 'Current Festive & Wedding Offers',
    category: 'Promotions',
    branch_id: 'all',
    keywords: ['offer', 'discount', 'sale', 'festive', 'coupon', 'deals', 'promo', 'wedding discount'],
    content: `Current Active Offers across all branches:
• Flat 20% OFF on Italian & Raymond 3-Piece Wedding Suits.
• Buy 2 Get 1 FREE on Premium Formal & Casual Shirts.
• Free Bespoke Tailoring & Styling Consultation for Groom Wear bookings above ₹15,000.
• Special 10% corporate discount for bulk orders (10+ units).`,
    is_active: true,
    updated_at: '2026-11-20T10:00:00Z'
  },
  {
    id: 'kb_05',
    title: 'Size Guide & Fit Chart',
    category: 'Product Guide',
    branch_id: 'all',
    keywords: ['size', 'sizing', 'fit', 'slim fit', 'chest', 'measurements', 'guide', 'chart', 'xl', 'xxl'],
    content: `Standard Men's Sizing Guide:
• Size 38 (Small): Chest 38 inches | Collar 15"
• Size 40 (Medium): Chest 40 inches | Collar 15.5"
• Size 42 (Large): Chest 42 inches | Collar 16"
• Size 44 (XL): Chest 44 inches | Collar 16.5"
• Size 46 (XXL): Chest 46 inches | Collar 17"
Available in Slim Fit and Contemporary Regular Fit. Free in-store custom alterations for waist and sleeve length.`,
    is_active: true,
    updated_at: '2026-11-20T10:00:00Z'
  },
  {
    id: 'kb_06',
    title: 'Contact Numbers & Customer Support',
    category: 'Contact',
    branch_id: 'all',
    keywords: ['contact', 'phone', 'call', 'support', 'helpline', 'whatsapp number', 'care'],
    content: `Branch Contact Numbers:
• Rajahmundry (Head Office): +91 98480 22334
• Kakinada Store: +91 98480 22335
• Vijayawada Store: +91 98480 22336
• Guntur Store: +91 98480 22337
WhatsApp Support: +91 98480 22334 (Mon–Sun 9 AM – 10 PM).`,
    is_active: true,
    updated_at: '2026-11-20T10:00:00Z'
  },
  {
    id: 'kb_07',
    title: 'Accepted Payment Modes',
    category: 'Store Info',
    branch_id: 'all',
    keywords: ['payment', 'pay', 'upi', 'gpay', 'phonepe', 'credit card', 'debit card', 'cash', 'emi'],
    content: `Accepted Payment Modes:
• UPI (Google Pay, PhonePe, Paytm, BHIM)
• Credit & Debit Cards (Visa, MasterCard, RuPay, Amex)
• Cash payments accepted at billing desk
• No-Cost EMI available on major credit cards for purchases above ₹10,000.`,
    is_active: true,
    updated_at: '2026-11-20T10:00:00Z'
  }
];

export const SEED_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'conv_1',
    customer_name: 'Vikram Singh',
    customer_phone: '+919988766554',
    customer_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    channel: 'instagram',
    branch_id: 'branch_1',
    status: 'open',
    unread_count: 0,
    ai_paused: false,
    last_message: 'Do you have a store near me?',
    last_message_at: '2026-11-21T10:46:00Z',
    interest_tags: ['Store Locator'],
    linked_lead_id: undefined,
    lead_status: 'new',
    follow_up_date: '2026-11-21',
    context_bullets: [
      'Customer asked for nearest store address in AP',
      'Sent location map and branch opening hours',
      'Expressed interest in visiting Rajahmundry flagship'
    ],
    created_at: '2026-11-21T10:44:00Z',
    updated_at: '2026-11-21T10:46:00Z'
  },
  {
    id: 'conv_2',
    customer_name: 'Arjun Reddy',
    customer_phone: '+919876543210',
    customer_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    channel: 'whatsapp',
    branch_id: 'branch_2',
    status: 'open',
    unread_count: 0,
    ai_paused: false,
    last_message: 'Yes, it is in stock at our Rajahmundry Main Branch. Would you like me to create a lead so our team can assist you further?',
    last_message_at: '2026-11-21T10:28:00Z',
    interest_tags: ['Formal Shirts', 'Size L'],
    linked_lead_id: 'L-3828',
    lead_status: 'in_progress',
    follow_up_date: '2026-11-20',
    context_bullets: [
      'Enquired about formal shirts in size L',
      'Product image carousel viewed by customer',
      'Confirmed availability at Rajahmundry Main Branch',
      'Ready for store follow-up'
    ],
    created_at: '2026-11-21T10:20:00Z',
    updated_at: '2026-11-21T10:28:00Z'
  },
  {
    id: 'conv_3',
    customer_name: 'Rahul Kumar',
    customer_phone: '+919840123456',
    customer_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    channel: 'website',
    branch_id: 'branch_1',
    status: 'open',
    unread_count: 1,
    ai_paused: false,
    last_message: 'Do you have formal shirts in white twill size 42?',
    last_message_at: '2026-11-21T11:02:00Z',
    interest_tags: ['Formal Shirts', 'Size 42'],
    lead_status: 'new',
    context_bullets: [
      'Captured from website assistant widget',
      'Looking for 100% cotton white twill',
      'Sent pricing and store trial invite'
    ],
    created_at: '2026-11-21T11:00:00Z',
    updated_at: '2026-11-21T11:02:00Z'
  },
  {
    id: 'conv_4',
    customer_name: 'Priya Sharma',
    customer_phone: '+919845012345',
    customer_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    channel: 'whatsapp',
    branch_id: 'branch_1',
    status: 'open',
    unread_count: 1,
    ai_paused: false,
    last_message: 'What are the offers on wedding suits this week?',
    last_message_at: '2026-11-21T10:55:00Z',
    interest_tags: ['Wedding Suit', 'Festive Offer'],
    linked_lead_id: 'L-3816',
    lead_status: 'converted',
    context_bullets: [
      'Inquired about wedding suit discounts',
      'Bot delivered Flat 20% festive voucher details'
    ],
    created_at: '2026-11-21T10:50:00Z',
    updated_at: '2026-11-21T10:55:00Z'
  },
  {
    id: 'conv_5',
    customer_name: 'Neha Iyer',
    customer_phone: '+919840567890',
    customer_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face',
    channel: 'instagram',
    branch_id: 'branch_2',
    status: 'open',
    unread_count: 0,
    ai_paused: false,
    last_message: 'Can I get the latest festive catalog on WhatsApp?',
    last_message_at: '2026-11-21T09:50:00Z',
    interest_tags: ['Catalog', 'Party Wear'],
    context_bullets: [
      'Responded to Instagram reel with inquiry',
      'Shared WhatsApp brochure link'
    ],
    created_at: '2026-11-21T09:40:00Z',
    updated_at: '2026-11-21T09:50:00Z'
  },
  {
    id: 'conv_6',
    customer_name: 'Karthik M',
    customer_phone: '+919876577889',
    channel: 'website',
    branch_id: 'branch_3',
    status: 'closed',
    unread_count: 0,
    ai_paused: false,
    last_message: 'What is the return policy for unaltered shirts?',
    last_message_at: '2026-11-20T17:30:00Z',
    interest_tags: ['Return Policy'],
    context_bullets: [
      'Asked about return and exchange policies',
      'Successfully answered by AI bot from KB article'
    ],
    created_at: '2026-11-20T17:25:00Z',
    updated_at: '2026-11-20T17:30:00Z'
  },
  {
    id: 'conv_7',
    customer_name: 'Suresh Babu',
    customer_phone: '+919841123456',
    channel: 'whatsapp',
    branch_id: 'branch_3',
    status: 'pending',
    unread_count: 2,
    ai_paused: true,
    last_message: 'Talk to staff - Need customized alteration for groom blazer urgently',
    last_message_at: '2026-11-21T10:15:00Z',
    interest_tags: ['Human Handover', 'Urgent Alteration'],
    context_bullets: [
      'Customer requested human assistance',
      'Handover initiated: assigned to Vijayawada branch team'
    ],
    created_at: '2026-11-21T10:10:00Z',
    updated_at: '2026-11-21T10:15:00Z'
  },
  {
    id: 'conv_8',
    customer_name: 'Anand Kumar',
    customer_phone: '+919842233445',
    channel: 'website',
    branch_id: 'branch_4',
    status: 'pending',
    unread_count: 1,
    ai_paused: true,
    last_message: 'Can I speak to someone about corporate bulk uniform pricing?',
    last_message_at: '2026-11-21T09:30:00Z',
    interest_tags: ['Corporate Order', 'Bulk Discount'],
    context_bullets: [
      'Bulk purchase query for 25 suits',
      'Pending manager contact'
    ],
    created_at: '2026-11-21T09:20:00Z',
    updated_at: '2026-11-21T09:30:00Z'
  },
  {
    id: 'conv_9',
    customer_name: 'Manoj Bajpai',
    customer_phone: '+919840678901',
    channel: 'whatsapp',
    branch_id: 'branch_4',
    status: 'closed',
    unread_count: 0,
    ai_paused: false,
    last_message: 'Thank you, I will visit the Guntur store today!',
    last_message_at: '2026-11-20T15:40:00Z',
    interest_tags: ['Store Timings'],
    context_bullets: ['Checked store timings', 'Confirmed visit to Guntur branch'],
    created_at: '2026-11-20T15:30:00Z',
    updated_at: '2026-11-20T15:40:00Z'
  },
  {
    id: 'conv_10',
    customer_name: 'Harish Varma',
    customer_phone: '+919832144556',
    channel: 'website',
    branch_id: 'branch_4',
    status: 'open',
    unread_count: 0,
    ai_paused: false,
    last_message: 'Do you carry Modi jackets in pastel peach or mint?',
    last_message_at: '2026-11-21T08:20:00Z',
    interest_tags: ['Modi Jacket', 'Pastel Colors'],
    context_bullets: ['Inquired about ethnic jackets in summer pastel colors'],
    created_at: '2026-11-21T08:15:00Z',
    updated_at: '2026-11-21T08:20:00Z'
  },
  {
    id: 'conv_11',
    customer_name: 'Deepak Rao',
    customer_phone: '+919849900112',
    channel: 'instagram',
    branch_id: 'branch_1',
    status: 'pending',
    unread_count: 1,
    ai_paused: true,
    last_message: 'Need help connecting with tailor master for suit fitting',
    last_message_at: '2026-11-21T11:15:00Z',
    interest_tags: ['Tailoring Master'],
    context_bullets: ['Customer requested direct master tailor callback'],
    created_at: '2026-11-21T11:10:00Z',
    updated_at: '2026-11-21T11:15:00Z'
  },
  {
    id: 'conv_12',
    customer_name: 'Srinivas Chowdary',
    customer_phone: '+919847788990',
    channel: 'website',
    branch_id: 'branch_2',
    status: 'closed',
    unread_count: 0,
    ai_paused: false,
    last_message: 'Do you accept UPI payment?',
    last_message_at: '2026-11-19T14:10:00Z',
    interest_tags: ['Payment Modes'],
    context_bullets: ['Inquired about payment options', 'Answered by AI bot'],
    created_at: '2026-11-19T14:05:00Z',
    updated_at: '2026-11-19T14:10:00Z'
  },
  {
    id: 'conv_13',
    customer_name: 'Chandra Murthy',
    customer_phone: '+919846677889',
    channel: 'whatsapp',
    branch_id: 'branch_3',
    status: 'closed',
    unread_count: 0,
    ai_paused: false,
    last_message: 'Thank you for the store directions.',
    last_message_at: '2026-11-19T11:30:00Z',
    interest_tags: ['Store Info'],
    context_bullets: ['Vijayawada store location provided'],
    created_at: '2026-11-19T11:20:00Z',
    updated_at: '2026-11-19T11:30:00Z'
  },
  {
    id: 'conv_14',
    customer_name: 'Satish Naidu',
    customer_phone: '+919845566778',
    channel: 'website',
    branch_id: 'branch_1',
    status: 'closed',
    unread_count: 0,
    ai_paused: false,
    last_message: 'What sizes are available in slim fit trousers?',
    last_message_at: '2026-11-18T16:00:00Z',
    interest_tags: ['Size Guide'],
    context_bullets: ['Size chart delivered by bot'],
    created_at: '2026-11-18T15:50:00Z',
    updated_at: '2026-11-18T16:00:00Z'
  },
  {
    id: 'conv_15',
    customer_name: 'Girish Patnaik',
    customer_phone: '+919844455667',
    channel: 'instagram',
    branch_id: 'branch_2',
    status: 'closed',
    unread_count: 0,
    ai_paused: false,
    last_message: 'Great, thanks for the quick help!',
    last_message_at: '2026-11-18T12:00:00Z',
    interest_tags: ['General Enquiry'],
    context_bullets: ['Casual chat completed'],
    created_at: '2026-11-18T11:50:00Z',
    updated_at: '2026-11-18T12:00:00Z'
  }
];

export const SEED_MESSAGES: Record<string, ChatMessage[]> = {
  conv_1: [
    {
      id: 'msg_101',
      conversation_id: 'conv_1',
      sender: 'customer',
      text: 'Do you have a store near me?',
      created_at: '2026-11-21T10:45:00Z'
    },
    {
      id: 'msg_102',
      conversation_id: 'conv_1',
      sender: 'ai',
      text: 'Our flagship store is located at Main Road, Rajahmundry, with branches in Anna Nagar, Kakinada, and Vijayawada.',
      created_at: '2026-11-21T10:46:00Z'
    }
  ],
  conv_2: [
    {
      id: 'msg_201',
      conversation_id: 'conv_2',
      sender: 'customer',
      text: 'Available in size L?',
      created_at: '2026-11-21T10:24:00Z'
    },
    {
      id: 'msg_202',
      conversation_id: 'conv_2',
      sender: 'ai',
      text: 'Here are some formal shirts in size L. Let me know which one you like.',
      image_urls: [
        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=300&h=300&fit=crop'
      ],
      created_at: '2026-11-21T10:25:00Z'
    },
    {
      id: 'msg_203',
      conversation_id: 'conv_2',
      sender: 'customer',
      text: 'The blue one looks good. Is it available at your Rajahmundry store?',
      created_at: '2026-11-21T10:27:00Z'
    },
    {
      id: 'msg_204',
      conversation_id: 'conv_2',
      sender: 'ai',
      text: 'Yes, it is in stock at our Rajahmundry Main Branch. Would you like me to create a lead so our team can assist you further?',
      created_at: '2026-11-21T10:28:00Z'
    }
  ],
  conv_3: [
    {
      id: 'msg_301',
      conversation_id: 'conv_3',
      sender: 'customer',
      text: 'Do you have formal shirts in white twill size 42?',
      created_at: '2026-11-21T11:00:00Z'
    },
    {
      id: 'msg_302',
      conversation_id: 'conv_3',
      sender: 'ai',
      text: 'Yes, our Rajahmundry Main Branch has premium white twill formal shirts in Size 42 (Large) ready for fitting. We also offer free in-store sleeve & collar alteration!',
      created_at: '2026-11-21T11:01:00Z'
    }
  ],
  conv_4: [
    {
      id: 'msg_401',
      conversation_id: 'conv_4',
      sender: 'customer',
      text: 'What are the offers on wedding suits this week?',
      created_at: '2026-11-21T10:50:00Z'
    },
    {
      id: 'msg_402',
      conversation_id: 'conv_4',
      sender: 'ai',
      text: 'We currently have a Flat 20% discount on all Italian & Raymond 3-Piece Wedding Suits, along with complimentary custom tailoring consultation for the groom!',
      created_at: '2026-11-21T10:51:00Z'
    }
  ],
  conv_7: [
    {
      id: 'msg_701',
      conversation_id: 'conv_7',
      sender: 'customer',
      text: 'Talk to staff - Need customized alteration for groom blazer urgently',
      created_at: '2026-11-21T10:14:00Z'
    },
    {
      id: 'msg_702',
      conversation_id: 'conv_7',
      sender: 'system',
      text: 'Handed over to staff. Store team will reply shortly.',
      created_at: '2026-11-21T10:15:00Z'
    }
  ]
};
