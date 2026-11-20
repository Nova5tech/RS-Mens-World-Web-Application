# Spec: Global Branch Configuration & Role Isolation

## ADDED REQUIREMENTS

### Requirement: Canonical Branch Definitions
The system MUST define the four official stores in a single, centralized configuration module (`src/config/branchConfig.js`):
- `B1`: Name `Rajahmandary Main Branch`, Code `RJY`, Label `Branch 1 – Rajahmandary Main Branch`
- `B2`: Name `Kakinada Branch`, Code `KKD`, Label `Branch 2 – Kakinada Branch`
- `B3`: Name `Vijayawada Branch`, Code `BZA`, Label `Branch 3 – Vijayawada Branch`
- `B4`: Name `Guntur Branch`, Code `GNT`, Label `Branch 4 – Guntur Branch`

All components, services, and mocks MUST derive branch names from this canonical configuration rather than defining separate hardcoded arrays.

### Requirement: Cross-Module Branch Consistency
The updated branch names MUST be displayed identically across:
1. `LoginPage.jsx` (Branch dropdown and Head Office demo accounts)
2. `TopBar.jsx` & `Sidebar.jsx` (Branch switcher and store pill)
3. `StaffChatInbox.jsx` & `CustomerChatWidget.jsx` (Branch tags and quick replies)
4. `LeadsPage.jsx` & `AddLeadModal.jsx` (Branch selectors, table rows, and details panel)
5. `CustomersPage.jsx` & `AddCustomerModal.jsx` (Customer store assignment and filter dropdown)
6. `CampaignsPage.jsx` & `CampaignWizardModal.jsx` (Audience branch targeting)
7. `ReportsPage.jsx` (Branch performance comparison table)
8. `SettingsPage.jsx` (Branch configuration table)
9. Retail ERP modules: `PosPage.jsx`, `InventoryPage.jsx`, `TransfersPage.jsx`, and `AccountingPage.jsx`.

### Requirement: Role-Based Branch Isolation
- Super Admin users SHALL have unrestricted access to all 4 branches and may freely toggle between `ALL` and individual branch filters.
- Branch users SHALL be locked strictly to their assigned branch (`assignedBranchId`).
- The branch switcher in TopBar and Sidebar SHALL be disabled for branch users, preventing switching to `ALL` or another branch.
- Modals that create leads, customers, invoices, or transfers SHALL auto-lock the branch to the logged-in user's assigned branch.

### Requirement: Safe Demo Migration
When initializing or loading localStorage:
- The system SHALL update existing branch objects in `rs_branches` with the canonical store names, preserving existing IDs, addresses, and transaction links.
- No existing customer, lead, invoice, or stock ledger records SHALL be reassigned or deleted.
