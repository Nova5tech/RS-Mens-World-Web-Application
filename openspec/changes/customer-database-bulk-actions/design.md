# Design: Customer Database Bulk Actions & RBAC Controls

## 1. Architecture & Component Structure

### 1.1 Bulk Action Toolbar (`BulkActionBar`)
Located in `src/components/customers/BulkActionBar.jsx` (or integrated in `CustomersPage.jsx`):
- **Visibility Condition**: Rendered as a fixed/docked floating card above the pagination bar or floating centered at the bottom of the viewport when `selectedCustomerIds.size > 0`.
- **Anatomy**:
  - Selection pill: `X customers selected` with a quick "Deselect All" button.
  - Action 1: **Export Selected (CSV)**: Accessible by both Super Admin and Branch Users.
  - Action 2: **Update Category**: Accessible by Super Admin and authorized Branch Users for their assigned customers.
  - Action 3: **Add to WhatsApp Campaign**: Accessible **strictly by Super Admin**. Hidden or disabled with tooltip for Branch Users.

### 1.2 Bulk Category Update Modal (`BulkCategoryModal.jsx`)
- Displays target count of selected customers.
- Selection radio / pill options:
  - `Regular` (Mint tag)
  - `VIP` (Amber gold tag)
  - `Repeat` (Blue tag)
- Batch updater: iterates through `selectedCustomerIds`, updates `customerList` and saves to `mockStorage.saveCustomers(...)`.
- Success toast notification (e.g., `Updated 5 customers to VIP category`).

### 1.3 Add to Campaign Audience Modal (`AddToAudienceModal.jsx`)
- **Strict RBAC Check**: Enforced via `!isBranchUser` or `isAdmin`.
- **Consent Analysis Engine**:
  - Identifies total selected: `N`
  - Validates consent: counts `consent: true` (e.g., `M`) and `consent: false` (e.g., `K`).
  - If any customer has `consent: false`:
    - Shows an alert: `⚠️ K selected customer(s) have opted out of marketing communications and will be excluded automatically to comply with privacy laws.`
    - Lists eligible recipients (`M` opted-in customers).
  - Campaign selector dropdown or action:
    - Add to existing campaign audience (or creates draft audience group).
    - Persists audience linkage to campaign storage.
  - Success toast & confirmation.

### 1.4 CSV Generator Utility
- Builds RFC-4180 compliant CSV string from selected customer objects:
  - Headers: `Customer ID,Name,Phone,Branch,Consent,Last Interaction,Customer Type,Total Purchases,Orders,Avg Order Value`
  - Escapes comma-containing strings and sanitizes quotes.
  - Triggers blob download: `const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });` with download filename `rs_customers_selected_<timestamp>.csv`.

## 2. RBAC & Data Boundary Matrix

| Action | Super Admin | Branch User | Verification Rule |
| :--- | :--- | :--- | :--- |
| **Select One / Multiple / All** | Across authorized branches | Strictly assigned branch only | Only rows present in `authorizedCustomers` can be selected. |
| **Export Selected to CSV** | Allowed for selected customers | Allowed for selected assigned branch customers | Export payload strictly filtered against `authorizedCustomers`. |
| **Update Category** | Allowed for all selected customers | Allowed for assigned branch customers | Prevents cross-branch edits if non-authorized IDs injected. |
| **Add to WhatsApp Campaign Audience** | **Allowed** (with Consent Gating) | **Blocked / Hidden** | Feature restricted to Super Admin; excludes any customer with `consent === false`. |

## 3. UI/UX & Visual Styling
- Dark Teal primary: `#004F4C`
- Mint accent: `#A8F0D0`
- Surface: Crisp white `#ffffff` with rounded 16px border (`rounded-2xl`), subtle drop shadow (`shadow-float` / `shadow-lg`), and crisp borders (`border border-slate-200/90`).
- Responsive: Stacks cleanly on mobile devices while remaining anchored on desktop/tablet.
