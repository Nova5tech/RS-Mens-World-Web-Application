# Proposal

## Why

While the visual design of RS Mens World successfully matches the approved Mint Green + Deep Teal theme, several visible interactive elements across Customer Engagement modules (AI Chatbot, Lead Generation, Customers, and WhatsApp Campaigns) currently do not respond when clicked or lack complete state handling. Critical workflows—including top-level profile dropdowns, conversation info inspection, conversation expansion, 3-dot contextual status menus, and lead follow-up date scheduling—must be fully functional with reactive mock services before handing over to backend engineers.

## What Changes

- **Header Profile Avatar & Menu**: Implement an accessible dropdown menu on the top-right user avatar with Profile Details modal, Settings navigation, and Session Sign Out.
- **AI Chatbot Conversation Controls**:
  - Implement conversation information drawer/modal displaying customer identity, branch, channel, timestamps, and linked lead metadata.
  - Implement expand conversation modal showing complete thread history without losing active selection.
  - Implement 3-dot contextual conversation menu with role-permitted actions (*Resolve/Close*, *Reopen*, *Request Handover*, *Create Lead*).
  - Repair the Follow-up Date picker in the Lead Details panel with calendar selection, `leadService` persistence, and validation.
- **Cross-Module Customer Engagement Workflows**:
  - Guarantee that creating a lead from AI Chatbot immediately reflects in Lead Generation Kanban and Table views.
  - Guarantee that modifying lead stages and follow-up dates updates the shared mock storage.
  - Verify Petpooja CSV/XLSX customer import wizard validation and persistence.
  - Verify independent branch ON/OFF switches in WhatsApp Campaigns dynamically calculate eligible audience based on DPDP marketing consent.
- **Audit Documentation**: Create `docs/CUSTOMER_ENGAGEMENT_INTERACTION_AUDIT.md` tracking all controls, root causes, fix statuses, and browser test results.

## Capabilities

### New Capabilities
- `customer-engagement-interaction`: Defines the interactive behaviors, dialogs, contextual menus, date scheduling, and cross-module synchronization across the 4 Customer Engagement modules (Chatbot, Leads, Customers, Campaigns) and shared header.

### Modified Capabilities
<!-- None: No prior OpenSpec specifications exist under openspec/specs/ -->

## Impact

- **Affected Components**: `src/components/layout/TopBar.jsx`, `src/components/chat/StaffChatInbox.jsx`, `src/components/leads/LeadDetailsPanel.jsx`, `src/pages/ChatInboxPage.jsx`, `src/pages/LeadsPage.jsx`, `src/pages/CustomersPage.jsx`, `src/pages/CampaignsPage.jsx`.
- **Services & Storage**: `src/services/leadService.js`, `src/services/chatService.js`, `src/services/customerService.js`, `src/mocks/mockStorage.js`.
- **Retail ERP Scope**: Strictly preserved. Billing/POS, Inventory, Stock Transfers, Returns, and Accounting remain unmodified.
