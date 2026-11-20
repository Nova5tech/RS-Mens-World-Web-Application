import { Branch } from '@/types/models';

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'branch_1',
    code: 'B1',
    name: 'Rajahmundry Main Branch',
    city: 'Rajahmundry',
    address: 'Main Road, Near Syamala Theatre, Rajahmundry, AP - 533101',
    timings: '10:00 AM - 9:30 PM',
    wa_phone_id: 'wa_b1_rajahmundry',
    is_active: true,
  },
  {
    id: 'branch_2',
    code: 'B2',
    name: 'Kakinada Branch',
    city: 'Kakinada',
    address: 'Cinema Road, Opposite Bhanu Gudi, Kakinada, AP - 533003',
    timings: '10:00 AM - 9:30 PM',
    wa_phone_id: 'wa_b2_kakinada',
    is_active: true,
  },
  {
    id: 'branch_3',
    code: 'B3',
    name: 'Vijayawada Branch',
    city: 'Vijayawada',
    address: 'M.G. Road, Governorpet, Vijayawada, AP - 520002',
    timings: '10:00 AM - 10:00 PM',
    wa_phone_id: 'wa_b3_vijayawada',
    is_active: true,
  },
  {
    id: 'branch_4',
    code: 'B4',
    name: 'Guntur Branch',
    city: 'Guntur',
    address: 'Arundelpet, 4th Lane, Guntur, AP - 522002',
    timings: '10:00 AM - 9:30 PM',
    wa_phone_id: 'wa_b4_guntur',
    is_active: true,
  },
];
