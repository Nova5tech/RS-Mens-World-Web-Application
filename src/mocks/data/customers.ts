import { Customer, CustomerType, CustomerStatus } from '@/types/models';

const FIRST_NAMES = [
  'Rahul', 'Priya', 'Arjun', 'Vikram', 'Neha', 'Suresh', 'Ananya', 'Ramesh',
  'Deepa', 'Karthik', 'Swati', 'Manoj', 'Pooja', 'Gowtham', 'Divya', 'Siddharth',
  'Lavanya', 'Harish', 'Keerthi', 'Ashwin', 'Bhavana', 'Dinesh', 'Meera', 'Kishore',
  'Sandhya', 'Rajesh', 'Aparna', 'Venkatesh', 'Kavitha', 'Naveen', 'Srilatha', 'Prasad',
  'Radha', 'Chaitanya', 'Shravya', 'Mahesh', 'Pavani', 'Sai', 'Tejaswini', 'Naresh',
];

const LAST_NAMES = [
  'Kumar', 'Sharma', 'Reddy', 'Singh', 'Iyer', 'Patel', 'Varma', 'Rao',
  'Nair', 'Chowdary', 'Joshi', 'Gupta', 'Verma', 'Pillai', 'Murthy', 'Krishnan',
  'Das', 'Babu', 'Mishra', 'Prabhu', 'Raju', 'Bhat', 'Shetty', 'Menon',
];

const BRANCH_CONFIGS = [
  { id: 'branch_1', code: 'B1', name: 'Rajahmundry Main Branch' },
  { id: 'branch_2', code: 'B2', name: 'Kakinada Branch' },
  { id: 'branch_3', code: 'B3', name: 'Vijayawada Branch' },
  { id: 'branch_4', code: 'B4', name: 'Guntur Branch' },
];

export function generateSeedCustomers(count: number = 200): Customer[] {
  const customers: Customer[] = [];

  // Pinned top 5 customers matching design screenshot 03-customers.png
  customers.push(
    {
      id: 'cust_10248',
      code: 'C-10248',
      name: 'Rahul Kumar',
      phone: '+919876543210',
      email: 'rahul.kumar@gmail.com',
      birthday: '1992-04-12',
      anniversary: '2019-11-20',
      branch_id: 'branch_1',
      branch_name: 'Rajahmundry Main Branch',
      customer_type: 'Regular',
      status: 'active',
      consent: true,
      consent_source: 'petpooja_import',
      consent_at: '2024-03-15T10:00:00Z',
      opted_out_at: null,
      total_purchases: 18450,
      order_count: 9,
      avg_order_value: 2047,
      last_interaction_at: '2025-11-18T14:30:00Z',
      created_at: '2024-03-15T10:00:00Z',
      source: 'Petpooja Import',
    },
    {
      id: 'cust_10247',
      code: 'C-10247',
      name: 'Priya Sharma',
      phone: '+919845012345',
      email: 'priya.sharma@yahoo.com',
      birthday: '1995-08-22',
      anniversary: '2021-02-14',
      branch_id: 'branch_2',
      branch_name: 'Kakinada Branch',
      customer_type: 'VIP',
      status: 'active',
      consent: true,
      consent_source: 'walkin',
      consent_at: '2024-05-10T11:20:00Z',
      opted_out_at: null,
      total_purchases: 45200,
      order_count: 14,
      avg_order_value: 3228,
      last_interaction_at: '2025-11-17T16:15:00Z',
      created_at: '2024-05-10T11:20:00Z',
      source: 'Walk-in Store',
    },
    {
      id: 'cust_10246',
      code: 'C-10246',
      name: 'Arjun Reddy',
      phone: '+919000067890',
      email: 'arjun.reddy@gmail.com',
      birthday: '1988-12-05',
      branch_id: 'branch_3',
      branch_name: 'Vijayawada Branch',
      customer_type: 'Regular',
      status: 'active',
      consent: false,
      consent_source: 'manual',
      consent_at: undefined,
      opted_out_at: '2025-08-10T09:00:00Z',
      total_purchases: 8900,
      order_count: 3,
      avg_order_value: 2966,
      last_interaction_at: '2025-11-16T10:00:00Z',
      created_at: '2024-08-12T10:00:00Z',
      source: 'Billing Counter',
    },
    {
      id: 'cust_10245',
      code: 'C-10245',
      name: 'Vikram Singh',
      phone: '+919812345678',
      email: 'vikram.singh@outlook.com',
      birthday: '1990-07-19',
      branch_id: 'branch_4',
      branch_name: 'Guntur Branch',
      customer_type: 'Repeat',
      status: 'active',
      consent: true,
      consent_source: 'petpooja_import',
      consent_at: '2024-01-20T12:00:00Z',
      opted_out_at: null,
      total_purchases: 28750,
      order_count: 11,
      avg_order_value: 2613,
      last_interaction_at: '2025-11-15T18:20:00Z',
      created_at: '2024-01-20T12:00:00Z',
      source: 'Petpooja Import',
    },
    {
      id: 'cust_10244',
      code: 'C-10244',
      name: 'Neha Iyer',
      phone: '+919945678901',
      email: 'neha.iyer@gmail.com',
      birthday: '1996-03-30',
      anniversary: '2023-11-15',
      branch_id: 'branch_1',
      branch_name: 'Rajahmundry Main Branch',
      customer_type: 'Regular',
      status: 'active',
      consent: true,
      consent_source: 'website_chat',
      consent_at: '2024-09-02T15:40:00Z',
      opted_out_at: null,
      total_purchases: 12400,
      order_count: 5,
      avg_order_value: 2480,
      last_interaction_at: '2025-11-15T11:00:00Z',
      created_at: '2024-09-02T15:40:00Z',
      source: 'Website Chat',
    }
  );

  // Remaining 195 records
  const startId = 10243;
  for (let i = 0; i < count - 5; i++) {
    const idNum = startId - i;
    const branch = BRANCH_CONFIGS[i % BRANCH_CONFIGS.length];
    const fn = FIRST_NAMES[i % FIRST_NAMES.length];
    const ln = LAST_NAMES[(i * 3) % LAST_NAMES.length];
    const name = `${fn} ${ln}`;

    // Base phone: unique 10 digits
    const phoneSuffix = 9000000000 + (i * 3821) % 999999999;
    const phone = `+91${phoneSuffix}`;

    const typeRoll = i % 10;
    const customer_type: CustomerType =
      typeRoll < 2 ? 'VIP' : typeRoll < 5 ? 'Repeat' : 'Regular';

    // Status roll: 25% new, 60% active, 15% inactive
    const statusRoll = i % 20;
    const status: CustomerStatus =
      statusRoll < 5 ? 'new' : statusRoll < 17 ? 'active' : 'inactive';

    const consent = (i % 7 !== 0); // ~85% true
    const order_count = 1 + (i % 15);
    const avg_order_value = 1200 + ((i * 137) % 3500);
    const total_purchases = order_count * avg_order_value;

    const daysAgo = status === 'new' ? (i % 25) : status === 'active' ? (5 + (i % 80)) : (110 + (i % 200));
    const lastInteractionDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
    const createdDate = new Date(Date.now() - (daysAgo + 60) * 24 * 60 * 60 * 1000).toISOString();

    customers.push({
      id: `cust_${idNum}`,
      code: `C-${idNum}`,
      name,
      phone,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i % 10}@gmail.com`,
      birthday: `19${80 + (i % 20)}-0${1 + (i % 9)}-${10 + (i % 18)}`,
      anniversary: i % 3 === 0 ? `20${15 + (i % 8)}-11-${10 + (i % 18)}` : undefined,
      branch_id: branch.id,
      branch_name: branch.name,
      customer_type,
      status,
      consent,
      consent_source: consent ? (i % 2 === 0 ? 'petpooja_import' : 'manual') : undefined,
      consent_at: consent ? createdDate : undefined,
      opted_out_at: !consent ? lastInteractionDate : null,
      total_purchases,
      order_count,
      avg_order_value,
      last_interaction_at: lastInteractionDate,
      created_at: createdDate,
      source: i % 2 === 0 ? 'Petpooja Import' : 'Store POS',
    });
  }

  return customers;
}

export const INITIAL_CUSTOMERS: Customer[] = generateSeedCustomers(200);
