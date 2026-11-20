# Tasks

## 1. TopBar Profile Avatar & Header Actions

- [x] 1.1 Implement accessible profile dropdown menu in `src/components/layout/TopBar.jsx` with outside-click and Escape key handlers, and verify clicking the avatar toggles the menu.
- [x] 1.2 Add "Profile Details" view modal displaying current user's name, role, email, and assigned branch, and verify clicking "Profile" opens the modal.
- [x] 1.3 Wire "Settings" option to navigate to `/settings` and "Sign Out" to clear the session via `useAuth().logout()` and navigate to `/login`, verifying correct routing.

## 2. AI Chatbot Marked Controls Repair

- [x] 2.1 Implement `ConversationInfoDrawer.jsx` in `src/components/chat/` showing customer metadata, branch, channel, timestamps, and linked lead status, and verify clicking the info icon in chat header opens it.
- [x] 2.2 Implement `ConversationExpandModal.jsx` in `src/components/chat/` displaying the complete chat history in an expanded overlay, and verify clicking the expand icon opens the modal without losing selection.
- [x] 2.3 Implement the 3-dot contextual menu in `src/components/chat/StaffChatInbox.jsx` with actions to resolve/close conversation, reopen, request human handover, and create lead, and verify selecting each action updates state.
- [x] 2.4 Fix the Follow-up Date field in `src/components/leads/LeadDetailsPanel.jsx` and chat sidebar by adding an interactive date input, verifying selecting a date calls `leadService.updateLead` and persists changes.
- [x] 2.5 Connect "Create Lead" from chat to pre-fill customer information when no linked lead exists, verifying it creates a record in `leadService` and shows success toast.

## 3. Remaining AI Chatbot Controls

- [x] 3.1 Verify and repair search filtering and status tabs (All, Open, Pending, Closed) in `StaffChatInbox.jsx`, verifying conversations filter accordingly.
- [x] 3.2 Verify message sending, auto-generated timestamps, attachment file picking simulation, and store stylist handover toggle in `StaffChatInbox.jsx`, verifying message appears in thread.

## 4. Lead Generation Interaction Verification

- [x] 4.1 Verify Kanban drag-and-drop and Table view toggle in `src/pages/LeadsPage.jsx`, verifying moving leads between stages persists via `leadService`.
- [x] 4.2 Verify "+ Add Lead" and "Edit Lead" modals in `src/pages/LeadsPage.jsx`, verifying newly created leads appear in the New column and edits update the details panel.
- [x] 4.3 Verify Search and Branch filters in `LeadsPage.jsx`, verifying correct filtering by customer name, phone, and branch.

## 5. Customers Module Interaction Verification

- [x] 5.1 Verify "+ Add Customer" and "Edit Customer" in `src/pages/CustomersPage.jsx`, verifying changes update the table and right details drawer.
- [x] 5.2 Verify Petpooja Import Wizard (`PetpoojaImportWizard.jsx`), verifying file upload, column mapping preview, duplicate detection, and import completion toast.
- [x] 5.3 Verify "View Purchase History" button in customer details panel, verifying it navigates to `/invoices?search=<CustomerName>`.

## 6. WhatsApp Campaigns Interaction Verification

- [x] 6.1 Verify the 4-step campaign creation wizard (`CampaignsPage.jsx`), verifying navigation between Details, Audience, Content, and Review steps.
- [x] 6.2 Verify the 4 independent branch switches (B1, B2, B3, B4) and audience calculation, verifying turning B4 OFF calculates exactly 21,530 eligible audience.
- [x] 6.3 Verify message template switcher and live shirt carousel WhatsApp preview, verifying message updates dynamically.
- [x] 6.4 Verify "Launch Broadcast" and "Save Draft" actions, verifying new campaigns append to table and show success feedback.

## 7. Cross-Module Audit & Final Build Verification

- [x] 7.1 Author `docs/CUSTOMER_ENGAGEMENT_INTERACTION_AUDIT.md` documenting every control, initial issue, root cause, files changed, and test status across all 4 modules.
- [x] 7.2 Run `npm.cmd run build` to verify 0 compilation errors and confirm dev server continues running without warnings.
- [x] 7.3 Perform smoke tests on Retail ERP routes (`/pos`, `/invoices`, `/inventory`, `/transfers`, `/accounting`) to ensure zero regressions in shared layouts.
