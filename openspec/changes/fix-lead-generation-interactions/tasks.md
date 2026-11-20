# Tasks

## 1. Lead Filters Popover & Filtering Engine

- [x] 1.1 Create `LeadFiltersPopover.jsx` in `src/components/leads/` supporting Branch, Lead Stage, Priority, and Source criteria with "Apply Filters", "Clear Filters", and "Close" controls, and verify clicking the Filters button toggles it.
- [x] 1.2 Wire filter state into `src/pages/LeadsPage.jsx`, updating `filteredLeads` reactively in both Kanban and Table views and rendering active filter chips, and verify applying filters updates the display.
- [x] 1.3 Add an informative empty state view in `LeadsPage.jsx` when filters match zero leads with a "Reset All Filters" button, and verify clearing filters restores all records.

## 2. Kanban Stage Headers & Dynamic Counts

- [x] 2.1 Update `src/components/leads/LeadKanbanBoard.jsx` to dynamically calculate column header badge counts from live filtered leads, and verify counts match actual records in each column.
- [x] 2.2 Implement stage focus behavior on clicking Kanban stage headers (New, In Progress, Follow-up, Converted) with visual active indication and a "Show All Stages" reset pill, and verify clicking focuses that column.
- [x] 2.3 Verify PRD stage compatibility by ensuring legacy `Contacted` and `Qualified` stages map gracefully to the `In Progress` column without mutating stored records or breaking API contracts, and verify stage synchronization.

## 3. Follow-up Date Picker & Lead Details Interactions

- [x] 3.1 Harden the interactive Follow-up Date picker in `src/components/leads/LeadDetailsPanel.jsx` with explicit calendar button trigger, native picker invocation (`showPicker()`) with fallback, and pointer-event protections, and verify clicking opens the calendar.
- [x] 3.2 Wire date selection to `leadService.updateLead`, updating selected lead details immediately, triggering toast notification, and reflecting on Kanban card and Table view, and verify persistence in `mockStorage`.
- [x] 3.3 Verify Notes, Lead Stage select, and "Send WhatsApp" button in `LeadDetailsPanel.jsx`, and verify stage dropdown moves the card and WhatsApp link opens `wa.me` with formatted mobile number.

## 4. Add / Edit Lead & Cross-View Synchronization

- [x] 4.1 Verify "+ Add Lead" modal in `src/pages/LeadsPage.jsx`, validating required fields, branch assignment, and appending newly created leads to the New column, and verify selection of new lead.
- [x] 4.2 Verify "Edit Lead" modal in `src/pages/LeadsPage.jsx`, validating data pre-fill, updates to customer enquiry/details, and reflection in details panel and table, and verify edit persistence.
- [x] 4.3 Verify seamless switching between Kanban and Table views with active search terms, branch filters, multi-criteria filters, and selected lead, and verify state is fully preserved.

## 5. Build Verification & Regression Smoke Tests

- [x] 5.1 Run `npm.cmd run build` to verify 0 compilation or bundling errors and ensure clean production assets.
- [x] 5.2 Perform regression checks across AI Chatbot (`/chat-inbox`), Customers (`/customers`), WhatsApp Campaigns (`/campaigns`), and Retail ERP routes (`/pos`, `/invoices`, `/inventory`, `/transfers`, `/accounting`), and verify zero regressions.
