# Design: Branch Login UI & Global Branch Names

## 1. Visual & Architectural Overview

The goal is an exact visual and functional recreation of the approved Branch Login reference (`media_1795088943133_750b023d.jpg`) coupled with a global, centralized branch configuration system.

```
+-------------------------------------------------------------------------------------------------+
|                                    SPLIT AUTHENTICATION SCREEN                                  |
|                                                                                                 |
|  LEFT BRANDING SECTION (Dark Teal + Ambient Store Overlay)  |  RIGHT FLOATING WHITE CARD       |
|  ---------------------------------------------------------  |  ------------------------------  |
|  [Hanger Logo] RS Mens World                                |  [ Head Office (Admin) ] [ Branch Login ]
|  MULTI-BRANCH RETAIL & CUSTOMER ENGAGEMENT                  |                                  |
|                                                             |  Branch Login                    |
|  Branch Sign In                                             |  Choose your branch and enter... |
|  Access your branch dashboard                               |                                  |
|                                                             |  Select Branch                   |
|  [Store]     Branch-wise Access                             |  +----------------------------+  |
|              Manage your branch operations                  |  | [Store] Branch 1 – ... [v] |  |
|  [Users]     Leads & Customers                              |  +----------------------------+  |
|              Track and engage customers                     |  | [Store] Branch 1 (Active) v|  |
|  [Speaker]   Campaigns                                      |  | [Store] Branch 2           |  |
|              Run WhatsApp campaigns                         |  | [Store] Branch 3           |  |
|  [Chart]     Branch Reports                                 |  | [Store] Branch 4           |  |
|              View your branch performance                   |  +----------------------------+  |
|                                                             |                                  |
|  [Check] Secure Login · Role-based Access · Multi-branch    |  Password / PIN                  |
|  ~~~~~~~~~~~~~ Mint Wave SVG Accent ~~~~~~~~~~~~~           |  [Lock] [Enter PIN...]    [Eye]  |
|                                                             |                                  |
|                                                             |  [   ->] Sign In              ]  |
|                                                             |                                  |
|                                                             |     <- Back to Role Selection    |
+-------------------------------------------------------------------------------------------------+
```

## 2. Global Branch Configuration System

To avoid fragmented branch name arrays across 15+ components, all branch data derives from `src/config/branchConfig.js`:

```javascript
export const BRANCH_CONFIG = [
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
```

### Safe LocalStorage Synchronization
When `initLocalStorage()` executes in `src/mocks/mockStorage.js`:
- Inspect existing `rs_branches` in `localStorage`.
- Update each branch's `name` to match `BRANCH_CONFIG` by matching `id` (`B1` -> `Rajahmandary Main Branch`, `B2` -> `Kakinada Branch`, `B3` -> `Vijayawada Branch`, `B4` -> `Guntur Branch`).
- Preserves all transaction IDs, invoice numbers, stock ledgers, and customer associations with zero data resets.

## 3. UI Component Details for `LoginPage.jsx`

### Left Branding Column
- **Background**: Deep forest teal gradient (`#07352d` via `#004F4C` to `#04241e`), layered over an upscale retail menswear photograph with mask overlay.
- **Organic Mint Waves**: SVG path at bottom right with mint greens (`#38d996`, `#a8f0d0`), swooping towards the center card.
- **Header**: Coat hanger SVG (`#38d996`) + "RS Mens World" + tracking uppercase subhead.
- **Headings**:
  - For Branch Tab: "Branch Sign In" / "Access your branch dashboard"
  - For Head Office Tab: "Head Office Sign In" / "Access central management dashboard"
- **Features List**:
  - `Branch-wise Access` / `Manage your branch operations` (`Store` icon)
  - `Leads & Customers` / `Track and engage customers` (`Users` icon)
  - `Campaigns` / `Run WhatsApp campaigns` (`Megaphone` icon)
  - `Branch Reports` / `View your branch performance` (`BarChart3` icon)
- **Footer**: `Secure Login · Role-based Access · Multi-branch` with check badge.

### Right Card Column
- **Container**: `bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-100 max-w-lg w-full`.
- **Top Segmented Tabs**:
  - Outer: `bg-slate-100/90 p-1.5 rounded-2xl flex items-center gap-1`.
  - Inactive tab: `text-slate-600 hover:text-slate-900 font-medium text-xs sm:text-sm py-2 px-3 sm:px-4 rounded-xl transition-all`.
  - Active tab: `bg-[#004F4C] text-white font-semibold text-xs sm:text-sm py-2 px-3 sm:px-4 rounded-xl shadow-sm transition-all`.
  - Tab 1: Building icon + `Head Office (Admin)`
  - Tab 2: Store icon + `Branch Login`
- **Branch Tab Fields**:
  - Label: `Select Branch` (`text-slate-800 font-medium text-xs sm:text-sm mb-2 block`)
  - Dropdown Trigger:
    - `border border-emerald-600/60 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer bg-white`
    - Left: Store icon (`#004F4C`) + selected branch name (`Branch 1 – Rajahmandary Main Branch`)
    - Right: ChevronDown icon (`#004F4C`)
  - Dropdown Options Menu:
    - Floating menu with `border border-slate-200 rounded-2xl shadow-xl bg-white p-1.5 z-20 space-y-1`
    - Selected item: `bg-[#d1fae5] text-slate-900 font-medium` with Check icon on the right
    - Other items: `hover:bg-slate-50 text-slate-700`
  - PIN / Password Field:
    - `Lock` icon on left
    - Input: placeholder "Enter 4–6 digit PIN or password"
    - `Eye` / `EyeOff` button on right
  - Sign In Button:
    - `w-full py-3.5 px-6 rounded-xl bg-[#004F4C] hover:bg-[#003835] active:bg-[#002826] text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer`
    - Icon: `LogIn` (`->]`), Text: `Sign In`
  - Footer link: `← Back to Role Selection` (switches to Head Office tab or resets selection).

### Head Office Tab Fields
- Heading: `Head Office Login` / `Enter your Super Admin credentials.`
- Admin Profile card: `Rajesh Sharma` • `admin@rsmensworld.com` with Crown/Shield badge.
- PIN / Password Field with visibility toggle.
- Full-width Dark Teal Sign In button.

## 4. Role-Based Access Enforcement

- **Super Admin** (`acc-admin`):
  - Session role: `admin`.
  - `assignedBranchId`: `null`.
  - Branch switcher enabled in TopBar and Sidebar (options: All Branches, Branch 1, Branch 2, Branch 3, Branch 4).
  - Can view and manage all modules across all branches.
- **Branch Users** (`acc-b1`, `acc-b2`, `acc-b3`, `acc-b4`):
  - Session role: `branch_user`.
  - `assignedBranchId`: `'B1'` | `'B2'` | `'B3'` | `'B4'`.
  - Branch switcher in TopBar and Sidebar is disabled / locked to assigned branch.
  - All data views (Leads, Customers, Chat, Invoices, POS, Inventory) automatically isolate to that branch ID.
  - Cannot switch to other branches via UI or URL parameters.
