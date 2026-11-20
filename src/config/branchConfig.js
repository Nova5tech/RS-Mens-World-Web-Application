/**
 * Centralized Canonical Branch Configuration
 * Single source of truth for all RS Mens World store branches.
 * 
 * Branch 1: Rajahmandary Main Branch (RJY)
 * Branch 2: Kakinada Branch (KKD)
 * Branch 3: Vijayawada Branch (BZA)
 * Branch 4: Guntur Branch (GNT)
 */

export const CANONICAL_BRANCHES = [
  {
    id: 'B1',
    code: 'RJY',
    branchNumber: 1,
    branchLabel: 'Branch 1',
    name: 'Rajahmandary Main Branch',
    shortName: 'Rajahmandary',
    displayName: 'Branch 1 – Rajahmandary Main Branch',
    fullDisplay: 'Branch 1 – Rajahmandary Main Branch',
    address: 'Door No. 7-2-14, Main Road, Near Danavaipeta Park, Rajahmundry, AP 533101',
    phone: '+91 883 244 5566',
    hours: '10:00 AM - 9:30 PM (Mon-Sun)',
    enabled: true,
    isConfirmed: true,
  },
  {
    id: 'B2',
    code: 'KKD',
    branchNumber: 2,
    branchLabel: 'Branch 2',
    name: 'Kakinada Branch',
    shortName: 'Kakinada',
    displayName: 'Branch 2 – Kakinada Branch',
    fullDisplay: 'Branch 2 – Kakinada Branch',
    address: 'Shop 14, Commercial Complex, Subhash Road, Kakinada, AP 533001',
    phone: '+91 884 233 4455',
    hours: '10:00 AM - 9:30 PM (Mon-Sun)',
    enabled: true,
    isConfirmed: false,
  },
  {
    id: 'B3',
    code: 'BZA',
    branchNumber: 3,
    branchLabel: 'Branch 3',
    name: 'Vijayawada Branch',
    shortName: 'Vijayawada',
    displayName: 'Branch 3 – Vijayawada Branch',
    fullDisplay: 'Branch 3 – Vijayawada Branch',
    address: 'Opp. Trendset Mall, MG Road, Vijayawada, AP 520010',
    phone: '+91 866 255 7788',
    hours: '10:00 AM - 10:00 PM (Mon-Sun)',
    enabled: true,
    isConfirmed: false,
  },
  {
    id: 'B4',
    code: 'GNT',
    branchNumber: 4,
    branchLabel: 'Branch 4',
    name: 'Guntur Branch',
    shortName: 'Guntur',
    displayName: 'Branch 4 – Guntur Branch',
    fullDisplay: 'Branch 4 – Guntur Branch',
    address: '4th Line, Arundelpet / Brodipet Junction, Guntur, AP 522002',
    phone: '+91 863 222 3344',
    hours: '10:00 AM - 9:30 PM (Mon-Sun)',
    enabled: true,
    isConfirmed: false,
  },
];

/**
 * Lookup helper: Get canonical branch by ID ('B1', 'B2', etc.)
 */
export function getBranchById(id) {
  if (!id || id === 'ALL') return null;
  return CANONICAL_BRANCHES.find(b => b.id === id) || null;
}

/**
 * Display helper: Get full label (e.g. 'Branch 1 – Rajahmandary Main Branch')
 */
export function getBranchDisplayName(id, fallback = 'All Branches') {
  if (!id || id === 'ALL') return fallback;
  const branch = getBranchById(id);
  return branch ? branch.displayName : fallback;
}

/**
 * Short name helper (e.g. 'Rajahmandary', 'Kakinada')
 */
export function getBranchShortName(id, fallback = 'All Branches') {
  if (!id || id === 'ALL') return fallback;
  const branch = getBranchById(id);
  return branch ? branch.shortName : fallback;
}

/**
 * Lookup dictionary by branch ID
 */
export const BRANCH_LOOKUP = CANONICAL_BRANCHES.reduce((acc, branch) => {
  acc[branch.id] = branch;
  return acc;
}, {});
