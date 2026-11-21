import { Lead } from '@/types/models';

export const SEED_LEADS: Lead[] = [
  {
    id: 'L-3816',
    customer_name: 'Priya Sharma',
    phone: '+919845012345',
    enquiry: 'Offer details and pricing for festive collection. Interested in family wedding set.',
    branch_id: 'branch_1',
    stage: 'converted',
    priority: 'high',
    source: 'website_chat',
    interest_tags: ['Formal Wear', 'Festive Offer', 'Wedding Suit'],
    follow_up_date: new Date().toISOString().slice(0, 10),
    consent_whatsapp: true,
    converted_customer_id: 'c_003',
    ai_summary: {
      category: 'wedding_occasion',
      suggested_priority: 'high',
      bullets: [
        'Enquired via website chatbot regarding festive discounts for 4 suits',
        'Budget range ₹25,000 - ₹35,000 for family reception',
        'Customer visited Rajahmundry store and completed tailoring measurements'
      ],
      generated_at: '2026-11-20T10:15:00Z'
    },
    notes: [
      {
        id: 'ln_001',
        content: 'Customer confirmed purchase of 2 Italian 3-piece suits. Measurements taken at Rajahmundry main branch.',
        author_name: 'Rajesh Varma',
        created_at: '2026-11-20T12:30:00Z'
      }
    ],
    activities: [
      {
        id: 'la_001',
        type: 'created',
        description: 'Lead captured from Website Chat widget',
        user_name: 'AI Chatbot',
        created_at: '2026-11-19T09:00:00Z'
      },
      {
        id: 'la_002',
        type: 'stage_change',
        description: 'Stage changed from New to In Progress',
        user_name: 'Rajesh Varma',
        created_at: '2026-11-19T11:20:00Z'
      },
      {
        id: 'la_003',
        type: 'stage_change',
        description: 'Stage changed from In Progress to Converted',
        user_name: 'Rajesh Varma',
        created_at: '2026-11-20T14:00:00Z'
      }
    ],
    created_at: '2026-11-19T09:00:00Z',
    updated_at: '2026-11-20T14:00:00Z'
  },
  {
    id: 'L-3823',
    customer_name: 'Amit Joshi',
    phone: '+919833344556',
    enquiry: 'Store location and timing for weekend visit. Looking for executive formal blazers.',
    branch_id: 'branch_1',
    stage: 'new',
    priority: 'medium',
    source: 'whatsapp',
    interest_tags: ['Formal Wear', 'Blazers', 'Store Info'],
    follow_up_date: new Date().toISOString().slice(0, 10),
    consent_whatsapp: true,
    ai_summary: {
      category: 'store_info',
      suggested_priority: 'medium',
      bullets: [
        'Requested location pin and weekend store timings for Rajahmundry branch',
        'Looking for slim-fit blazer options for business conference'
      ],
      generated_at: '2026-11-21T08:30:00Z'
    },
    notes: [],
    activities: [
      {
        id: 'la_004',
        type: 'created',
        description: 'Lead created via WhatsApp Business API inbound',
        user_name: 'System',
        created_at: '2026-11-21T08:30:00Z'
      }
    ],
    created_at: '2026-11-21T08:30:00Z',
    updated_at: '2026-11-21T08:30:00Z'
  },
  {
    id: 'L-3829',
    customer_name: 'Arjun Pillai',
    phone: '+919899900112',
    enquiry: 'Order placed - 2 shirts. Trial completed at Rajahmundry store.',
    branch_id: 'branch_1',
    stage: 'converted',
    priority: 'low',
    source: 'walk_in',
    interest_tags: ['Formal Shirts', 'Trial'],
    follow_up_date: '2026-11-20',
    consent_whatsapp: true,
    ai_summary: {
      category: 'product_enquiry',
      suggested_priority: 'low',
      bullets: [
        'Walk-in customer at Rajahmundry branch',
        'Purchased 2 executive formal shirts after fitting trial'
      ],
      generated_at: '2026-11-20T16:00:00Z'
    },
    notes: [],
    activities: [
      {
        id: 'la_005',
        type: 'created',
        description: 'Lead created manually by store manager',
        user_name: 'Rajesh Varma',
        created_at: '2026-11-20T15:30:00Z'
      },
      {
        id: 'la_006',
        type: 'converted',
        description: 'Lead converted to customer database',
        user_name: 'Rajesh Varma',
        created_at: '2026-11-20T16:45:00Z'
      }
    ],
    created_at: '2026-11-20T15:30:00Z',
    updated_at: '2026-11-20T16:45:00Z'
  },
  {
    id: 'L-3828',
    customer_name: 'Arjun Reddy',
    phone: '+919888899001',
    enquiry: 'Order status inquiry for customized sherwani alteration.',
    branch_id: 'branch_2',
    stage: 'follow_up',
    priority: 'high',
    source: 'phone_call',
    interest_tags: ['Wedding Wear', 'Sherwani', 'Alterations'],
    follow_up_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10), // tomorrow
    consent_whatsapp: true,
    ai_summary: {
      category: 'wedding_occasion',
      suggested_priority: 'high',
      bullets: [
        'Wedding event on Nov 28th',
        'Sherwani sleeve adjustment pending with tailor in Kakinada'
      ],
      generated_at: '2026-11-21T07:15:00Z'
    },
    notes: [
      {
        id: 'ln_002',
        content: 'Tailor promised delivery by tomorrow 4 PM. Informed customer.',
        author_name: 'Suresh Kumar',
        created_at: '2026-11-21T07:30:00Z'
      }
    ],
    activities: [
      {
        id: 'la_007',
        type: 'stage_change',
        description: 'Moved to Follow-up for tailoring delivery',
        user_name: 'Suresh Kumar',
        created_at: '2026-11-21T07:30:00Z'
      }
    ],
    created_at: '2026-11-19T14:10:00Z',
    updated_at: '2026-11-21T07:30:00Z'
  },
  {
    id: 'L-3841',
    customer_name: 'Ashwin Narayanan',
    phone: '+919823411223',
    enquiry: 'Corporate uniform trial booking for 15 executives.',
    branch_id: 'branch_1',
    stage: 'in_progress',
    priority: 'high',
    source: 'website_chat',
    interest_tags: ['Corporate Order', 'Bulk Booking', 'Formal Wear'],
    follow_up_date: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    consent_whatsapp: true,
    ai_summary: {
      category: 'bulk_corporate',
      suggested_priority: 'high',
      bullets: [
        'Enquired for 15 sets of blazer + trousers for corporate sales team',
        'Requested fabric swatch catalog and corporate discount tier'
      ],
      generated_at: '2026-11-20T11:00:00Z'
    },
    notes: [],
    activities: [],
    created_at: '2026-11-20T11:00:00Z',
    updated_at: '2026-11-20T11:00:00Z'
  },
  {
    id: 'L-3842',
    customer_name: 'Balaji Krishnan',
    phone: '+919834522334',
    enquiry: 'Groom waistcoat styling options and color coordination.',
    branch_id: 'branch_2',
    stage: 'in_progress',
    priority: 'medium',
    source: 'instagram',
    interest_tags: ['Wedding Wear', 'Waistcoat', 'Ethnic'],
    follow_up_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    consent_whatsapp: true,
    ai_summary: {
      category: 'wedding_occasion',
      suggested_priority: 'medium',
      bullets: [
        'Saw Instagram reel featuring Raw Silk Nehru jackets',
        'Seeking matching silk pocket square and brooch'
      ],
      generated_at: '2026-11-21T09:20:00Z'
    },
    notes: [],
    activities: [],
    created_at: '2026-11-21T09:20:00Z',
    updated_at: '2026-11-21T09:20:00Z'
  },
  {
    id: 'L-3835',
    customer_name: 'Dinesh Balaji',
    phone: '+919843255667',
    enquiry: 'Formal trousers slim fit size 34 in navy and charcoal.',
    branch_id: 'branch_2',
    stage: 'new',
    priority: 'low',
    source: 'whatsapp',
    interest_tags: ['Trousers', 'Formal Wear'],
    follow_up_date: new Date().toISOString().slice(0, 10),
    consent_whatsapp: true,
    ai_summary: {
      category: 'product_enquiry',
      suggested_priority: 'low',
      bullets: [
        'Checking stock availability for size 34 formal trousers',
        'Offered to reserve 2 pieces at Kakinada store'
      ],
      generated_at: '2026-11-21T10:00:00Z'
    },
    notes: [],
    activities: [],
    created_at: '2026-11-21T10:00:00Z',
    updated_at: '2026-11-21T10:00:00Z'
  },
  {
    id: 'L-3838',
    customer_name: 'Gowtham N',
    phone: '+919887688990',
    enquiry: 'Linen casual shirts collection in pastel summer shades.',
    branch_id: 'branch_4',
    stage: 'new',
    priority: 'medium',
    source: 'website_chat',
    interest_tags: ['Casual Shirts', 'Linen', 'Summer'],
    follow_up_date: new Date().toISOString().slice(0, 10),
    consent_whatsapp: true,
    ai_summary: {
      category: 'product_enquiry',
      suggested_priority: 'medium',
      bullets: [
        'Inquired about 100% French linen long sleeve shirts',
        'Guntur branch has newly received pastel batch'
      ],
      generated_at: '2026-11-21T10:30:00Z'
    },
    notes: [],
    activities: [],
    created_at: '2026-11-21T10:30:00Z',
    updated_at: '2026-11-21T10:30:00Z'
  },
  {
    id: 'L-3834',
    customer_name: 'Harish Varma',
    phone: '+919832144556',
    enquiry: 'Modi jackets in pastel shades for upcoming reception ceremony.',
    branch_id: 'branch_4',
    stage: 'new',
    priority: 'high',
    source: 'walk_in',
    interest_tags: ['Modi Jacket', 'Ethnic', 'Wedding'],
    follow_up_date: new Date().toISOString().slice(0, 10),
    consent_whatsapp: true,
    ai_summary: {
      category: 'wedding_occasion',
      suggested_priority: 'high',
      bullets: [
        'Urgent requirement for Nov 24th event',
        'Trial needed for sizes 40 and 42'
      ],
      generated_at: '2026-11-21T11:00:00Z'
    },
    notes: [],
    activities: [],
    created_at: '2026-11-21T11:00:00Z',
    updated_at: '2026-11-21T11:00:00Z'
  },
  {
    id: 'L-3837',
    customer_name: 'Karthik Raja',
    phone: '+919876577889',
    enquiry: 'Italian fabric formal blazers for reception cocktail.',
    branch_id: 'branch_3',
    stage: 'new',
    priority: 'high',
    source: 'referral',
    interest_tags: ['Italian Blazer', 'Cocktail', 'Formal'],
    follow_up_date: new Date().toISOString().slice(0, 10),
    consent_whatsapp: true,
    ai_summary: {
      category: 'wedding_occasion',
      suggested_priority: 'high',
      bullets: [
        'Referred by existing VIP customer at Vijayawada branch',
        'Interested in Raymond Premium wool blend'
      ],
      generated_at: '2026-11-21T11:15:00Z'
    },
    notes: [],
    activities: [],
    created_at: '2026-11-21T11:15:00Z',
    updated_at: '2026-11-21T11:15:00Z'
  },
  {
    id: 'L-3822',
    customer_name: 'Kiran Das',
    phone: '+919822233445',
    enquiry: 'Casual shirts enquiry - check weekend discounts.',
    branch_id: 'branch_2',
    stage: 'new',
    priority: 'low',
    source: 'website_chat',
    interest_tags: ['Casual Shirts', 'Discount'],
    follow_up_date: new Date().toISOString().slice(0, 10),
    consent_whatsapp: true,
    ai_summary: {
      category: 'product_enquiry',
      suggested_priority: 'low',
      bullets: [
        'Browsing casual printed shirts on web portal'
      ],
      generated_at: '2026-11-19T10:00:00Z'
    },
    notes: [],
    activities: [],
    created_at: '2026-11-19T10:00:00Z',
    updated_at: '2026-11-19T10:00:00Z'
  },
  {
    id: 'L-3846',
    customer_name: 'Kishore Varma',
    phone: '+919878966778',
    enquiry: 'Wedding reception suit trial scheduled for tomorrow afternoon.',
    branch_id: 'branch_1',
    stage: 'follow_up',
    priority: 'high',
    source: 'phone_call',
    interest_tags: ['Wedding Suit', 'Trial', 'Reception'],
    follow_up_date: new Date().toISOString().slice(0, 10), // today
    consent_whatsapp: true,
    ai_summary: {
      category: 'wedding_occasion',
      suggested_priority: 'high',
      bullets: [
        'Trial appointment fixed for 3:00 PM today at Rajahmundry',
        'Master tailor has prepared sample 3-piece tuxedo'
      ],
      generated_at: '2026-11-21T08:00:00Z'
    },
    notes: [
      {
        id: 'ln_003',
        content: 'Customer confirmed arrival with bride father at 3 PM.',
        author_name: 'Rajesh Varma',
        created_at: '2026-11-21T08:15:00Z'
      }
    ],
    activities: [],
    created_at: '2026-11-20T17:00:00Z',
    updated_at: '2026-11-21T08:15:00Z'
  },
  {
    id: 'L-3811',
    customer_name: 'Rahul Kumar',
    phone: '+919840123456',
    enquiry: 'Enquired about formal shirts. Interested in size 42 slim fit.',
    branch_id: 'branch_1',
    stage: 'new',
    priority: 'medium',
    source: 'whatsapp',
    interest_tags: ['Formal Shirts', 'Slim Fit'],
    follow_up_date: new Date().toISOString().slice(0, 10),
    consent_whatsapp: true,
    ai_summary: {
      category: 'product_enquiry',
      suggested_priority: 'medium',
      bullets: [
        'Sent photo of white textured twill shirt',
        'Asked about combo pricing for 3 shirts'
      ],
      generated_at: '2026-11-21T09:40:00Z'
    },
    notes: [],
    activities: [],
    created_at: '2026-11-21T09:40:00Z',
    updated_at: '2026-11-21T09:40:00Z'
  },
  {
    id: 'L-3812',
    customer_name: 'Rohit Verma',
    phone: '+919840234567',
    enquiry: "Men's wedding wear collection preview and custom styling.",
    branch_id: 'branch_1',
    stage: 'new',
    priority: 'high',
    source: 'website_chat',
    interest_tags: ['Wedding Wear', 'Styling', 'Sherwani'],
    follow_up_date: new Date().toISOString().slice(0, 10),
    consent_whatsapp: true,
    ai_summary: {
      category: 'wedding_occasion',
      suggested_priority: 'high',
      bullets: [
        'Groom looking for complete wedding attire package',
        'Budget above ₹40,000'
      ],
      generated_at: '2026-11-21T10:10:00Z'
    },
    notes: [],
    activities: [],
    created_at: '2026-11-21T10:10:00Z',
    updated_at: '2026-11-21T10:10:00Z'
  },
  {
    id: 'L-3814',
    customer_name: 'Sandeep Rao',
    phone: '+919840345678',
    enquiry: 'Formal wear in bulk for bank branch staff.',
    branch_id: 'branch_3',
    stage: 'in_progress',
    priority: 'high',
    source: 'referral',
    interest_tags: ['Bulk Order', 'Formal Wear', 'Corporate'],
    follow_up_date: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
    consent_whatsapp: true,
    ai_summary: {
      category: 'bulk_corporate',
      suggested_priority: 'high',
      bullets: [
        'Canara Bank branch requirement for 22 male staff members',
        'Sample sent to Vijayawada branch'
      ],
      generated_at: '2026-11-20T14:00:00Z'
    },
    notes: [],
    activities: [],
    created_at: '2026-11-20T14:00:00Z',
    updated_at: '2026-11-20T14:00:00Z'
  },
  {
    id: 'L-3815',
    customer_name: 'Vishal Reddy',
    phone: '+919840456789',
    enquiry: 'Purchase completed - need more options for anniversary event.',
    branch_id: 'branch_3',
    stage: 'follow_up',
    priority: 'medium',
    source: 'walk_in',
    interest_tags: ['Indo Western', 'Anniversary'],
    follow_up_date: new Date().toISOString().slice(0, 10), // today
    consent_whatsapp: true,
    ai_summary: {
      category: 'wedding_occasion',
      suggested_priority: 'medium',
      bullets: [
        'Customer bought a blazer last week',
        'Follow-up to showcase new indo-western arrivals'
      ],
      generated_at: '2026-11-21T09:00:00Z'
    },
    notes: [],
    activities: [],
    created_at: '2026-11-18T11:00:00Z',
    updated_at: '2026-11-21T09:00:00Z'
  },
  {
    id: 'L-3817',
    customer_name: 'Neha Iyer',
    phone: '+919840567890',
    enquiry: 'Party wear collection for husband - blazer with velvet lapel.',
    branch_id: 'branch_2',
    stage: 'in_progress',
    priority: 'medium',
    source: 'instagram',
    interest_tags: ['Party Wear', 'Blazers', 'Gift'],
    follow_up_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    consent_whatsapp: true,
    ai_summary: {
      category: 'product_enquiry',
      suggested_priority: 'medium',
      bullets: [
        'Inquired on Instagram for velvet lapel dinner jacket'
      ],
      generated_at: '2026-11-21T08:45:00Z'
    },
    notes: [],
    activities: [],
    created_at: '2026-11-21T08:45:00Z',
    updated_at: '2026-11-21T08:45:00Z'
  },
  {
    id: 'L-3818',
    customer_name: 'Manoj Bajpai',
    phone: '+919840678901',
    enquiry: 'Size availability (L) in linen safari suits.',
    branch_id: 'branch_4',
    stage: 'in_progress',
    priority: 'low',
    source: 'whatsapp',
    interest_tags: ['Safari Suit', 'Linen'],
    follow_up_date: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    consent_whatsapp: true,
    ai_summary: {
      category: 'product_enquiry',
      suggested_priority: 'low',
      bullets: [
        'Safari suit size L in olive and beige requested'
      ],
      generated_at: '2026-11-20T16:20:00Z'
    },
    notes: [],
    activities: [],
    created_at: '2026-11-20T16:20:00Z',
    updated_at: '2026-11-20T16:20:00Z'
  },
  {
    id: 'L-3825',
    customer_name: 'Meera Nair',
    phone: '+919840789012',
    enquiry: 'Purchased formal shirt for brother. Order completed.',
    branch_id: 'branch_4',
    stage: 'converted',
    priority: 'low',
    source: 'walk_in',
    interest_tags: ['Formal Shirts', 'Gift'],
    follow_up_date: '2026-11-19',
    consent_whatsapp: true,
    converted_customer_id: 'c_012',
    ai_summary: {
      category: 'product_enquiry',
      suggested_priority: 'low',
      bullets: ['Completed gift purchase at Guntur branch'],
      generated_at: '2026-11-19T15:00:00Z'
    },
    notes: [],
    activities: [],
    created_at: '2026-11-19T14:00:00Z',
    updated_at: '2026-11-19T15:30:00Z'
  },
  {
    id: 'L-3826',
    customer_name: 'Vikram Singhania',
    phone: '+919840890123',
    enquiry: 'Custom tailored tuxedo for international conference. Order confirmed.',
    branch_id: 'branch_1',
    stage: 'converted',
    priority: 'high',
    source: 'referral',
    interest_tags: ['Tuxedo', 'Tailoring', 'VIP'],
    follow_up_date: '2026-11-18',
    consent_whatsapp: true,
    converted_customer_id: 'c_001',
    ai_summary: {
      category: 'wedding_occasion',
      suggested_priority: 'high',
      bullets: ['High value bespoke tuxedo completed at Rajahmundry'],
      generated_at: '2026-11-18T18:00:00Z'
    },
    notes: [],
    activities: [],
    created_at: '2026-11-17T10:00:00Z',
    updated_at: '2026-11-18T18:00:00Z'
  },
  {
    id: 'L-3830',
    customer_name: 'Venkat Rao',
    phone: '+919840901234',
    enquiry: 'Wanted tailor-made blazers delivered in 24 hours. Timeline not possible.',
    branch_id: 'branch_1',
    stage: 'lost',
    priority: 'medium',
    source: 'walk_in',
    interest_tags: ['Blazers', 'Express Tailoring'],
    lost_reason: 'out_of_stock',
    lost_notes: 'Customer needed suit delivered by tonight for emergency flight. Standard tailoring is 48 hours minimum.',
    consent_whatsapp: false,
    ai_summary: {
      category: 'product_enquiry',
      suggested_priority: 'medium',
      bullets: ['Lost lead due to tight rush-tailoring timeline'],
      generated_at: '2026-11-19T12:00:00Z'
    },
    notes: [],
    activities: [],
    created_at: '2026-11-19T11:00:00Z',
    updated_at: '2026-11-19T12:00:00Z'
  },
  {
    id: 'L-3831',
    customer_name: 'Prasad Chintapalli',
    phone: '+919841012345',
    enquiry: 'Looked for budget wedding sherwani under ₹3,000.',
    branch_id: 'branch_2',
    stage: 'lost',
    priority: 'low',
    source: 'website_chat',
    interest_tags: ['Sherwani', 'Budget'],
    lost_reason: 'price',
    lost_notes: 'Pricing expectation below our entry collection starting at ₹6,999.',
    consent_whatsapp: true,
    ai_summary: {
      category: 'wedding_occasion',
      suggested_priority: 'low',
      bullets: ['Budget mismatch with premium product pricing'],
      generated_at: '2026-11-18T14:00:00Z'
    },
    notes: [],
    activities: [],
    created_at: '2026-11-18T13:00:00Z',
    updated_at: '2026-11-18T14:30:00Z'
  },
  {
    id: 'L-3832',
    customer_name: 'Suresh Babu',
    phone: '+919841123456',
    enquiry: 'Wedding suit enquiry - multiple follow-ups made, no response.',
    branch_id: 'branch_3',
    stage: 'lost',
    priority: 'medium',
    source: 'whatsapp',
    interest_tags: ['Wedding Suit'],
    lost_reason: 'no_response',
    lost_notes: 'Called 3 times over 5 days, WhatsApp messages delivered but unread.',
    consent_whatsapp: true,
    ai_summary: {
      category: 'wedding_occasion',
      suggested_priority: 'medium',
      bullets: ['Customer unreachable after initial query'],
      generated_at: '2026-11-17T11:00:00Z'
    },
    notes: [],
    activities: [],
    created_at: '2026-11-12T10:00:00Z',
    updated_at: '2026-11-17T11:00:00Z'
  }
];

// Helper to generate remaining leads up to 60 to have rich distribution across all 4 branches and stages
const FIRST_NAMES = ['Kavitha', 'Naveen', 'Anand', 'Deepak', 'Srinivas', 'Chandra', 'Girish', 'Satish', 'Tarun', 'Praveen', 'Siddharth', 'Aditya', 'Ramesh', 'Vijay', 'Mohan', 'Krishna', 'Sunil', 'Santosh', 'Rajiv', 'Kishore', 'Venkatesh', 'Bhaskar', 'Ravi', 'Sudhir', 'Chaitanya', 'Praneeth', 'Akhil', 'Sandeep', 'Bharath', 'Gopal', 'Naresh', 'Kalyan', 'Srinath', 'Varun', 'Hemant', 'Manish', 'Devendra'];
const LAST_NAMES = ['Rao', 'Reddy', 'Varma', 'Chowdary', 'Naidu', 'Sharma', 'Patnaik', 'Murthy', 'Prasad', 'Raju', 'Babu', 'Gupta', 'Iyer', 'Menon', 'Pillai', 'Kumar', 'Verma', 'Das'];
const INTEREST_POOL = [
  ['Wedding Suit', 'Blazers'],
  ['Formal Shirts', 'Trousers'],
  ['Kurta Pajama', 'Modi Jacket'],
  ['Sherwani', 'Ethnic Wear'],
  ['Corporate Order', 'Uniform'],
  ['Linen Shirts', 'Casuals'],
  ['Tuxedo', 'Reception Wear'],
  ['Indo Western', 'Silk Kurta']
];
const STAGE_POOL: Array<Lead['stage']> = ['new', 'in_progress', 'follow_up', 'converted', 'lost'];
const BRANCH_POOL = ['branch_1', 'branch_2', 'branch_3', 'branch_4'];
const SOURCE_POOL: Array<Lead['source']> = ['website_chat', 'whatsapp', 'walk_in', 'instagram', 'referral', 'phone_call'];
const PRIORITY_POOL: Array<Lead['priority']> = ['high', 'medium', 'low'];

for (let i = SEED_LEADS.length; i < 60; i++) {
  const fName = FIRST_NAMES[i % FIRST_NAMES.length];
  const lName = LAST_NAMES[i % LAST_NAMES.length];
  const stage = STAGE_POOL[i % STAGE_POOL.length];
  const branchId = BRANCH_POOL[i % BRANCH_POOL.length];
  const source = SOURCE_POOL[i % SOURCE_POOL.length];
  const priority = PRIORITY_POOL[i % PRIORITY_POOL.length];
  const interest = INTEREST_POOL[i % INTEREST_POOL.length];
  const idNum = 3800 + i;
  const phone = `+9198${(40000000 + i * 1373).toString().padStart(8, '0')}`;

  const isOverdue = i % 5 === 0;
  const isToday = i % 5 === 1;
  const dateOffset = isOverdue ? -2 : isToday ? 0 : (i % 7) + 1;
  const followUpDate = new Date(Date.now() + dateOffset * 86400000).toISOString().slice(0, 10);

  SEED_LEADS.push({
    id: `L-${idNum}`,
    customer_name: `${fName} ${lName}`,
    phone,
    enquiry: `Interested in ${interest.join(' and ')} for upcoming occasion. Inquired via ${source.replace('_', ' ')}.`,
    branch_id: branchId,
    stage,
    priority,
    source,
    interest_tags: interest,
    follow_up_date: stage === 'converted' || stage === 'lost' ? undefined : followUpDate,
    consent_whatsapp: i % 10 !== 0,
    lost_reason: stage === 'lost' ? (i % 2 === 0 ? 'price' : 'not_interested') : undefined,
    lost_notes: stage === 'lost' ? 'Customer preferred alternative brand or timeline' : undefined,
    converted_customer_id: stage === 'converted' ? `c_${100 + i}` : undefined,
    ai_summary: {
      category: interest.some(x => x.includes('Wedding') || x.includes('Sherwani') || x.includes('Tuxedo'))
        ? 'wedding_occasion'
        : interest.some(x => x.includes('Corporate'))
        ? 'bulk_corporate'
        : 'product_enquiry',
      suggested_priority: priority,
      bullets: [
        `Inquired regarding ${interest.join(', ')}`,
        `Assigned to ${branchId === 'branch_1' ? 'Rajahmundry' : branchId === 'branch_2' ? 'Kakinada' : branchId === 'branch_3' ? 'Vijayawada' : 'Guntur'} store`,
        `Customer response channel: ${source.replace('_', ' ')}`
      ],
      generated_at: new Date(Date.now() - (i % 5) * 86400000).toISOString()
    },
    notes: [
      {
        id: `ln_${idNum}`,
        content: `Initial consultation logged. Requested catalogue preview on WhatsApp.`,
        author_name: branchId === 'branch_1' ? 'Rajesh Varma' : branchId === 'branch_2' ? 'Suresh Kumar' : branchId === 'branch_3' ? 'Praveen Raju' : 'Kiran Kumar',
        created_at: new Date(Date.now() - (i % 4) * 86400000).toISOString()
      }
    ],
    activities: [
      {
        id: `la_${idNum}_1`,
        type: 'created',
        description: `Lead created from ${source.replace('_', ' ')}`,
        user_name: 'System',
        created_at: new Date(Date.now() - (i % 7) * 86400000).toISOString()
      }
    ],
    created_at: new Date(Date.now() - (i % 10) * 86400000).toISOString(),
    updated_at: new Date(Date.now() - (i % 3) * 86400000).toISOString()
  });
}
