# Proposal: Customer Database Bulk Actions & RBAC Controls

## 1. Problem Statement
In RS Men's World Customer Engagement Platform (`/customers`), the customer database table includes selection checkboxes on each customer row and a master selection checkbox in the table header. However, our technical audit revealed critical functional gaps:
1. **Selection Isolation**: While selecting individual customers, selecting multiple customers, and selecting all customers updates the component's internal selection state (`selectedCustomerIds`), no bulk actions toolbar or action bar appears to utilize the selected customer IDs.
2. **Missing CSV/Excel Export for Selected Customers**: Users cannot export selected customer records. There is no CSV generator or download trigger for active selections.
3. **Missing Campaign Audience Integration**: Super Admins cannot assign selected customer records directly into WhatsApp Campaign Audiences. Furthermore, there is no enforcement of DPDP marketing consent (`consent: true` / `marketingOptIn: true`) prior to adding customers to marketing campaign lists.
4. **Missing Bulk Category Update**: Users cannot batch-update customer classifications (e.g., transition selected customers to `VIP`, `Repeat`, or `Regular`). The only existing method is editing each customer individually via `AddCustomerModal`.

## 2. Proposed Changes
Implement a responsive, docked/floating bulk action bar (`BulkActionBar`) with strict role-based access control (RBAC) and privacy consent gating:

1. **Floating / Docked Bulk Action Toolbar**:
   - Appears dynamically at the bottom of the table when 1 or more customers are selected (`selectedCustomerIds.size > 0`).
   - Displays clear selection counter (e.g., `3 customers selected`) with a "Deselect All" button.
   - Styled adhering to RS Men's World Mint Green (`#A8F0D0` / `#008C83`) and Deep Teal (`#004F4C`) design system.

2. **Bulk Export to CSV**:
   - Available to Super Admin (authorized across selected branches) and Branch Users (strictly limited to their assigned branch).
   - Generates and downloads a formatted CSV containing canonical fields: Customer ID, Name, Phone, Branch, Consent Status, Customer Type, Total Purchases, Order Count, and Last Interaction Date.

3. **Add Selected to WhatsApp Campaign Audience (Super Admin Only + Consent Gated)**:
   - **RBAC**: Visible and usable **only** by Super Admin. Hidden or disabled for Branch Users with clear RBAC indication.
   - **Consent Verification**: Automatically inspects the `consent` flag of all selected records.
   - **Consent Modal / Summary**: Notifies the user of eligible opted-in customers (`consent: true`) vs. unconsented customers (`consent: false`), filtering out unconsented records from marketing audiences to comply with DPDP regulations.
   - Seamlessly appends eligible customer IDs to mock campaign audiences in `mockStorage.js` or triggers navigation to WhatsApp Campaigns with pre-populated target audience IDs.

4. **Update Customer Category in Bulk**:
   - Opens a streamlined Category Update Modal for selected customers.
   - Allows choosing target category (`Regular`, `VIP`, `Repeat`).
   - Applies atomic batch updates to `mockStorage` and component state with instantaneous UI badge updates and toast feedback.

## 3. Scope & RBAC Boundaries
- **In Scope**:
  - Implementation of floating `BulkActionBar` inside `src/pages/CustomersPage.jsx` (or reusable component in `src/components/customers/`).
  - Client-side CSV generation and instant download trigger.
  - Bulk Category Update dialog with category selection and batch persistence.
  - Add to WhatsApp Campaign Audience workflow with Super Admin authorization check and consent validation.
  - Toast notifications and state synchronization.
- **Out of Scope**:
  - Changes to underlying backend APIs (operates with `mockStorage` / local client state).
  - Modifications to the core layout, headers, sidebar, or other ERP modules (`/pos`, `/inventory`, `/accounting`).
