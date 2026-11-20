# Proposal

## Why

The Lead Generation module in the RS Mens World frontend application visually mirrors the approved Mint Green + Deep Teal interface, but key operational controls—specifically the multi-criteria Filters button, Kanban stage header interactions, and the Lead Details follow-up date picker—do not perform their intended actions. To prepare the frontend for production usability and backend API handoff, these controls must be made functional, reactive, and integrated with the shared lead service and mock storage without disturbing the approved visual hierarchy or unrelated Retail ERP and Customer Engagement modules.

## What Changes

- **Lead Filters Popover/Drawer**:
  - Implement a dedicated, responsive filter popover/drawer triggered by the "Filters" button.
  - Support filtering by Branch (All, B1, B2, B3, B4), Lead Stage (New, In Progress, Follow-up, Converted, Lost), Priority (High, Medium, Low), and Source (WhatsApp / AI Chat, Walk-in, Website, Phone Enquiry).
  - Add "Apply Filters", "Clear Filters", and "Close" actions with active filter badges.
  - Synchronize filter state across both Kanban and Table views, displaying an empty state when no leads match.
- **Kanban Stage Headers & Count Integrity**:
  - Resolve the UX behavior of Kanban stage headers (New, In Progress, Follow-up, Converted): make them clear column headers with optional single-click stage focus/filtering and reset capability.
  - Dynamically calculate and display accurate counts from live filtered lead data (e.g., `New (12)`, `In Progress (8)`, `Follow-up (5)`, `Converted (4)`).
  - Ensure stages seamlessly map existing PRD stages (`Contacted` and `Qualified` map to the approved UI's `In Progress` column) without modifying stored values or breaking sync.
- **Interactive Follow-up Date Scheduling**:
  - Replace non-functioning or obscured date triggers with an accessible date picker in `LeadDetailsPanel.jsx` and chat sidebar.
  - Wire selection to `leadService.updateLead(lead.id, { followUpDate, followUpDateFormatted })` with toast confirmation.
  - Immediately reflect updated dates in selected lead details, Kanban cards, and Table view rows.
- **Comprehensive Lead Controls Verification**:
  - Verify "+ Add Lead" and "Edit Lead" modal dialogs, search term filtering, Kanban/Table view toggling, card selection, stage transition dropdowns, and WhatsApp direct links.

## Capabilities

### New Capabilities
- `lead-pipeline-interaction`: Covers interactive lead filtering, Kanban stage focus/filtering and reactive column counts, accessible follow-up date scheduling, lead creation/editing modals, and cross-view state synchronization between Kanban and Table views.

### Modified Capabilities
<!-- None: No prior OpenSpec specifications exist under openspec/specs/ -->

## Impact

- **Affected Components**: `src/pages/LeadsPage.jsx`, `src/components/leads/LeadKanbanBoard.jsx`, `src/components/leads/LeadDetailsPanel.jsx`, `src/components/leads/LeadCard.jsx`, `src/components/leads/LeadTableView.jsx`, `src/components/leads/AddLeadModal.jsx`.
- **Services & Storage**: `src/services/leadService.js`, `src/mocks/mockStorage.js`, `src/mocks/seedData.js`.
- **Preserved Scope**: Zero impact or modifications to Retail ERP modules (Billing/POS, Invoices, Inventory, Transfers, Accounting) and Customer Engagement companions (AI Chatbot, Customers, WhatsApp Campaigns).
