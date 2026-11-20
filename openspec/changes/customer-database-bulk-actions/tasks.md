# Tasks

## 1. Bulk Action Toolbar Component

- [x] 1.1 Create `src/components/customers/BulkActionBar.jsx` with selection count, Deselect All action, and button group adhering to Mint Green & Deep Teal styling. Verify component renders cleanly when selections exist.
- [x] 1.2 Implement smooth floating entrance and exit animations with responsive mobile and desktop styling. Verify bar appears when `count > 0` and unmounts when selection is cleared.

## 2. Bulk Export to CSV

- [x] 2.1 Implement client-side CSV generator utility with RFC-4180 escaping and sanitization for selected customer fields. Verify CSV string structure contains all required columns.
- [x] 2.2 Wire Export Selected button to trigger direct browser download with timestamped filename (`rs_customers_selected_<date>.csv`). Verify download initiates on click.
- [x] 2.3 Verify branch data isolation so Branch Users can only export records belonging to their assigned branch, whereas Super Admin can export selected records across authorized branches.

## 3. Bulk Customer Category Update

- [x] 3.1 Create `src/components/customers/BulkCategoryModal.jsx` allowing users to select target customer type (`Regular`, `VIP`, `Repeat`). Verify modal opens with current selection count.
- [x] 3.2 Wire category batch update handler in `CustomersPage.jsx` to mutate selected records in `mockStorage` and local state atomically. Verify table category badges and counts update immediately.
- [x] 3.3 Add success toast notification reporting total customers updated. Verify toast feedback fires on confirmation.

## 4. WhatsApp Campaign Audience Integration (RBAC & Consent Gated)

- [x] 4.1 Enforce strict RBAC gating so 'Add to WhatsApp Campaign' is strictly available to Super Admin, and hidden or disabled with clear tooltip for Branch Users. Verify button is inaccessible to Branch Users.
- [x] 4.2 Build marketing consent filter logic to separate selected customers into consented (`consent === true`) and unconsented (`consent === false`). Verify unconsented records are never passed to campaign marketing lists.
- [x] 4.3 Create `src/components/customers/AddToAudienceModal.jsx` displaying total selected, eligible consented count, and warning banner for any excluded unconsented customers. Verify modal provides transparent preview before submission.
- [x] 4.4 Wire audience persistence to save eligible customer IDs into campaign storage or route to WhatsApp Campaigns. Verify toast confirms addition of eligible contacts.

## 5. Integration, Regressions & Build Verification

- [x] 5.1 Wire `BulkActionBar`, `BulkCategoryModal`, and `AddToAudienceModal` into `src/pages/CustomersPage.jsx`. Verify all states synchronize without breaking existing single-customer selection and details panel.
- [x] 5.2 Run complete production build (`npm run build`) to ensure zero Babel, JSX, or bundling errors. Verify clean build exit code 0.
- [x] 5.3 Verify all six audit activities (select one, select multiple, select all, bulk export, bulk audience, bulk category) function end-to-end.
