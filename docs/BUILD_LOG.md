# RS Mens World — Frontend Build Log

## Phase 1B — Login Page Redesign (Exact match to `docs/design/01-login.png`)
- **Status**: Completed & Verified
- **Files Changed**:
  - `src/features/auth/LoginPage.tsx`: Rebuilt left branding panel with store photo fade mask, inline SVG organic mint sweeping waves, logo without bounding box, uppercase tracking subtitle, headings, solid teal squircle icon tiles for 4 features, and security footer; rebuilt right card with 28px radius, sliding segmented tab control, custom 56px store dropdown with mint selected state & checkmark, styled PIN and password inputs, 60px primary dark green sign-in button, back-to-role link, and conditional demo credential helpers.
  - `src/layouts/Sidebar.tsx`: Updated sidebar logo to use `logo-hanger.svg` without a bounding tile to match design specs.
  - `src/index.css`: Added input autofill background override so browser autofill retains a clean white background.
- **Self-Check Results**:
  - Exact visual match to `docs/design/01-login.png` verified: hanger logo, uppercase subtitle, feature rows, waves, segmented control, custom dropdown, button.
  - Head Office (Admin) login verified with `admin@rsmensworld.com` / `Admin@123`.
  - Branch login verified with branch selector and PINs (`1111`, `2222`, `3333`, `4444`).
  - Mobile layout verified (<1024px displays centered card on dark green background).
  - TypeScript & Vite build clean (`npm run build` zero errors).

## Phase 4 — Content Library (Super Admin only)
- **Status**: Completed & Verified
- **Files Added / Changed**:
  - `src/features/content/ContentLibraryPage.tsx`: Admin-only Content Library hub with three tabs (**Media Assets**, **Message Templates**, **Audience Segments**) and real-time item counts.
  - `src/features/content/MediaLibraryTab.tsx`: Grid of media cards with thumbnails, title, kind pills (Offer, New Arrival, Festival, Greeting), upload date, user badge, and Upload Modal supporting file selection and preview.
  - `src/features/content/TemplatesTab.tsx`: Meta WhatsApp message templates table with approval status pills (Approved, Pending, Rejected), drawer editor with variable tags (`{{customer_name}}`, `{{branch_name}}`, `{{offer_text}}`), and live WhatsApp phone preview bubble matching `docs/design/05-campaigns-wizard.png`.
  - `src/features/content/SegmentsTab.tsx`: Customer audience segments list with customer count, per-branch matching cards, and Segment Builder drawer with live audience counter evaluated against current customer database.
  - `src/types/models.ts`: Added `MediaAsset`, `MessageTemplate`, `Segment`, `SegmentRules`, `TemplateCategory`, and `MetaTemplateStatus`.
  - `src/mocks/data/content.ts`: Seeded 6 media assets, 8 message templates (Winter Collection Launch, Festive Offer Flat 20%, New Arrivals Formal Shirts, Birthday Wish, Anniversary Wish, Diwali Greetings, Loyal Customer Reward, Store Opening Hours), and 5 dynamic segments.
  - `src/services/content.ts`: Implemented media, template, and segment CRUD with live preview calculation `previewSegmentCount`.
  - `src/layouts/Sidebar.tsx` & `src/app/router.tsx`: Added `/content` to sidebar under Customer Engagement (admin only) and protected by `ProtectedRoute adminOnly`.
  - `docs/API_CONTRACT.md`: Documented Section 6 Content Library Endpoints (`GET/POST/DELETE /media`, `GET/POST/PATCH/DELETE /templates`, `GET/POST/PATCH/DELETE /segments`, `POST /segments/preview-count`).
- **Self-Check Results**:
  - Uploading a new poster displays in the media grid.
  - Segment "Birthday in December" count matches the calculated count of customer mock records born in month 12.
  - Branch users are strictly blocked from `/content` via route guard and hidden sidebar item.
  - TypeScript & Vite build clean (`npm run build` zero errors).

## Phase 3 — Customer Database + Petpooja Import (connector #1)
- **Status**: Completed & Verified
- **Files Added / Changed**:
  - `src/features/customers/CustomersPage.tsx`: Pixel-close match to `docs/design/03-customers.png`. Tab chips with counts (All, New, Active, Inactive), Search & Filter bar (Search, Branch, Consent, Customer Type, Advanced Filters popover), Customer table with checkboxes, phone formatted in E.164/Indian display, branch badge, consent pills (✓ Yes / ✕ No), sortable columns, pagination (20/page), bulk actions floating bar (Export CSV with UTF-8 BOM, Change Type, Mark Opted-Out), row action menu (View, Edit, Mark Opted-Out, Delete).
  - `src/features/customers/CustomerDrawer.tsx`: Customer profile details drawer with active pill, contact information, purchase summary card (Total Purchases ₹, Orders, Avg Order Value ₹), marketing consent details with opted-out timestamp, recent touchpoints/campaigns timeline, and edit/delete actions.
  - `src/features/customers/AddEditCustomerDrawer.tsx`: Full customer registration and update form with 10-digit mobile validation, store branch selector (locked for branch users), birthday/anniversary dates, customer type, and WhatsApp consent toggle.
  - `src/features/customers/ImportWizard.tsx`: Full-screen 5-step Petpooja import modal with drag & drop file upload (.xlsx, .xls, .csv), sample template download, automatic column mapping with fuzzy branch matching (e.g. "Rajahmundry", "RJY" -> B1), mobile number normalization, duplicate/invalid detection, review report with CSV download, batch progress simulation, and bulk upsert.
  - `src/features/customers/ImportHistoryModal.tsx`: History modal displaying past Petpooja import batches and metrics.
  - `src/lib/phone.ts` & `src/lib/format.ts`: Utilities for Indian mobile phone normalization, E.164 formatting, currency (₹), and date/relative time.
  - `src/types/models.ts`: Added `Customer`, `ImportBatch`, `CustomerType`, `CustomerStatus` definitions.
  - `src/mocks/data/customers.ts`: Seeded 200 realistic Indian customer records across all 4 branches.
  - `src/mocks/data/imports.ts`: Seeded past Petpooja batch import logs.
  - `src/services/customers.ts`: Implemented full customer service with filtering, pagination, branch isolation scoping, tab counts, and bulk upsert.
  - `docs/API_CONTRACT.md`: Documented Section 5 Customer Database & Petpooja Import Endpoints (`GET/POST/PATCH/DELETE /customers`, `GET /customers/counts`, `POST /customers/bulk-upsert`, `GET /imports`, `GET /imports/{id}`).
- **Self-Check Results**:
  - Exact visual match to `docs/design/03-customers.png` verified.
  - Import wizard validates phone numbers, detecting invalid numbers and duplicate rows.
  - Re-importing existing phone numbers marks them as "Will Update" without creating duplicate records.
  - Branch 1 user sees only Branch 1 customers.
  - Tab counts (All, New, Active, Inactive) match filtered customer totals.
  - CSV export downloads clean UTF-8 BOM file readable by Excel.
  - TypeScript & Vite build clean (`npm run build` zero errors).

## Phase 4 — Content Library (Super Admin only)
- **Status**: Completed & Verified
- **Files Added / Changed**:
  - `src/features/content/ContentLibraryPage.tsx`: Admin-only Content Library hub with three tabs (**Media Assets**, **Message Templates**, **Audience Segments**) and real-time item counts.
  - `src/features/content/MediaLibraryTab.tsx`: Grid of media cards with thumbnails, title, kind pills (Offer, New Arrival, Festival, Greeting), upload date, user badge, and Upload Modal supporting file selection and preview.
  - `src/features/content/TemplatesTab.tsx`: Meta WhatsApp message templates table with approval status pills (Approved, Pending, Rejected), drawer editor with variable tags (`{{customer_name}}`, `{{branch_name}}`, `{{offer_text}}`), and live WhatsApp phone preview bubble matching `docs/design/05-campaigns-wizard.png`.
  - `src/features/content/SegmentsTab.tsx`: Customer audience segments list with customer count, per-branch matching cards, and Segment Builder drawer with live audience counter evaluated against current customer database.
  - `src/types/models.ts`: Added `MediaAsset`, `MessageTemplate`, `Segment`, `SegmentRules`, `TemplateCategory`, and `MetaTemplateStatus`.
  - `src/mocks/data/content.ts`: Seeded 6 media assets, 8 message templates (Winter Collection Launch, Festive Offer Flat 20%, New Arrivals Formal Shirts, Birthday Wish, Anniversary Wish, Diwali Greetings, Loyal Customer Reward, Store Opening Hours), and 5 dynamic segments.
  - `src/services/content.ts`: Implemented media, template, and segment CRUD with live preview calculation `previewSegmentCount`.
  - `src/layouts/Sidebar.tsx` & `src/app/router.tsx`: Added `/content` to sidebar under Customer Engagement (admin only) and protected by `ProtectedRoute adminOnly`.
  - `docs/API_CONTRACT.md`: Documented Section 6 Content Library Endpoints (`GET/POST/DELETE /media`, `GET/POST/PATCH/DELETE /templates`, `GET/POST/PATCH/DELETE /segments`, `POST /segments/preview-count`).
- **Self-Check Results**:
  - Uploading a new poster displays in the media grid.
  - Segment "Birthday in December" count matches the calculated count of customer mock records born in month 12.
  - Branch users are strictly blocked from `/content` via route guard and hidden sidebar item.
  - TypeScript & Vite build clean (`npm run build` zero errors).

## Phase 2 — Users & Branches (Super Admin only)
- **Status**: Completed & Verified
- **Files Added / Changed**:
  - `src/features/users/UsersBranchesPage.tsx`: Full implementation of Users & Branches view with two tab modes (Branches & Users), sub-status filter chips (All, Active, Inactive), search input, Branches table with user counts and action buttons, Users table with login types (Email/Password or PIN) and role badges, Slide-over Add/Edit Drawers with form validation, confirmation modal for deactivation, and temporary credential display modal with one-click copy.
  - `src/types/models.ts`: Extended `Branch` and `User` models with `phone`, `users_count`, `pin`, `password`, `last_login_at`.
  - `src/mocks/data/users.ts`: Created initial seed users for Super Admin and branch managers (B1–B4).
  - `src/services/users.ts`: Added CRUD operations for users, credential reset (`resetCredential`), and mock storage persistence.
  - `src/services/branches.ts`: Extended branch service with `createBranch`, `updateBranch`, and `toggleBranchStatus`.
  - `src/services/auth.ts`: Integrated authentication flow with dynamic user and branch store so deactivated users or users of deactivated branches are blocked at login.
  - `src/app/router.tsx`: Routed `/users` and `/users-branches` as protected Super Admin-only routes.
  - `src/layouts/Sidebar.tsx`: Updated navigation link for Users & Branches to `/users`.
  - `docs/API_CONTRACT.md`: Documented Section 4 User Management Endpoints (`GET/POST/PATCH /branches`, `GET/POST/PATCH /users`, `POST /users/{id}/reset-credential`).
- **Self-Check Results**:
  - Super admin access verified on `/users`.
  - Creating a new branch user for Branch 3 persists and allows logging in as that branch user.
  - Deactivating a user immediately blocks login with `This account is currently deactivated`.
  - Self-deactivation and deactivating the last active super admin are strictly prevented with validation errors.
  - TypeScript & Vite build clean (`npm run build` zero errors).

## Phase 4 — Content Library (Super Admin only)
- **Status**: Completed & Verified
- **Files Added / Changed**:
  - `src/features/content/ContentLibraryPage.tsx`: Admin-only Content Library hub with three tabs (**Media Assets**, **Message Templates**, **Audience Segments**) and real-time item counts.
  - `src/features/content/MediaLibraryTab.tsx`: Grid of media cards with thumbnails, title, kind pills (Offer, New Arrival, Festival, Greeting), upload date, user badge, and Upload Modal supporting file selection and preview.
  - `src/features/content/TemplatesTab.tsx`: Meta WhatsApp message templates table with approval status pills (Approved, Pending, Rejected), drawer editor with variable tags (`{{customer_name}}`, `{{branch_name}}`, `{{offer_text}}`), and live WhatsApp phone preview bubble matching `docs/design/05-campaigns-wizard.png`.
  - `src/features/content/SegmentsTab.tsx`: Customer audience segments list with customer count, per-branch matching cards, and Segment Builder drawer with live audience counter evaluated against current customer database.
  - `src/types/models.ts`: Added `MediaAsset`, `MessageTemplate`, `Segment`, `SegmentRules`, `TemplateCategory`, and `MetaTemplateStatus`.
  - `src/mocks/data/content.ts`: Seeded 6 media assets, 8 message templates (Winter Collection Launch, Festive Offer Flat 20%, New Arrivals Formal Shirts, Birthday Wish, Anniversary Wish, Diwali Greetings, Loyal Customer Reward, Store Opening Hours), and 5 dynamic segments.
  - `src/services/content.ts`: Implemented media, template, and segment CRUD with live preview calculation `previewSegmentCount`.
  - `src/layouts/Sidebar.tsx` & `src/app/router.tsx`: Added `/content` to sidebar under Customer Engagement (admin only) and protected by `ProtectedRoute adminOnly`.
  - `docs/API_CONTRACT.md`: Documented Section 6 Content Library Endpoints (`GET/POST/DELETE /media`, `GET/POST/PATCH/DELETE /templates`, `GET/POST/PATCH/DELETE /segments`, `POST /segments/preview-count`).
- **Self-Check Results**:
  - Uploading a new poster displays in the media grid.
  - Segment "Birthday in December" count matches the calculated count of customer mock records born in month 12.
  - Branch users are strictly blocked from `/content` via route guard and hidden sidebar item.
  - TypeScript & Vite build clean (`npm run build` zero errors).

## Phase 3 — Customer Database + Petpooja Import (connector #1)
- **Status**: Completed & Verified
- **Files Added / Changed**:
  - `src/features/customers/CustomersPage.tsx`: Pixel-close match to `docs/design/03-customers.png`. Tab chips with counts (All, New, Active, Inactive), Search & Filter bar (Search, Branch, Consent, Customer Type, Advanced Filters popover), Customer table with checkboxes, phone formatted in E.164/Indian display, branch badge, consent pills (✓ Yes / ✕ No), sortable columns, pagination (20/page), bulk actions floating bar (Export CSV with UTF-8 BOM, Change Type, Mark Opted-Out), row action menu (View, Edit, Mark Opted-Out, Delete).
  - `src/features/customers/CustomerDrawer.tsx`: Customer profile details drawer with active pill, contact information, purchase summary card (Total Purchases ₹, Orders, Avg Order Value ₹), marketing consent details with opted-out timestamp, recent touchpoints/campaigns timeline, and edit/delete actions.
  - `src/features/customers/AddEditCustomerDrawer.tsx`: Full customer registration and update form with 10-digit mobile validation, store branch selector (locked for branch users), birthday/anniversary dates, customer type, and WhatsApp consent toggle.
  - `src/features/customers/ImportWizard.tsx`: Full-screen 5-step Petpooja import modal with drag & drop file upload (.xlsx, .xls, .csv), sample template download, automatic column mapping with fuzzy branch matching (e.g. "Rajahmundry", "RJY" -> B1), mobile number normalization, duplicate/invalid detection, review report with CSV download, batch progress simulation, and bulk upsert.
  - `src/features/customers/ImportHistoryModal.tsx`: History modal displaying past Petpooja import batches and metrics.
  - `src/lib/phone.ts` & `src/lib/format.ts`: Utilities for Indian mobile phone normalization, E.164 formatting, currency (₹), and date/relative time.
  - `src/types/models.ts`: Added `Customer`, `ImportBatch`, `CustomerType`, `CustomerStatus` definitions.
  - `src/mocks/data/customers.ts`: Seeded 200 realistic Indian customer records across all 4 branches.
  - `src/mocks/data/imports.ts`: Seeded past Petpooja batch import logs.
  - `src/services/customers.ts`: Implemented full customer service with filtering, pagination, branch isolation scoping, tab counts, and bulk upsert.
  - `docs/API_CONTRACT.md`: Documented Section 5 Customer Database & Petpooja Import Endpoints (`GET/POST/PATCH/DELETE /customers`, `GET /customers/counts`, `POST /customers/bulk-upsert`, `GET /imports`, `GET /imports/{id}`).
- **Self-Check Results**:
  - Exact visual match to `docs/design/03-customers.png` verified.
  - Import wizard validates phone numbers, detecting invalid numbers and duplicate rows.
  - Re-importing existing phone numbers marks them as "Will Update" without creating duplicate records.
  - Branch 1 user sees only Branch 1 customers.
  - Tab counts (All, New, Active, Inactive) match filtered customer totals.
  - CSV export downloads clean UTF-8 BOM file readable by Excel.
  - TypeScript & Vite build clean (`npm run build` zero errors).

## Phase 4 — Content Library (Super Admin only)
- **Status**: Completed & Verified
- **Files Added / Changed**:
  - `src/features/content/ContentLibraryPage.tsx`: Admin-only Content Library hub with three tabs (**Media Assets**, **Message Templates**, **Audience Segments**) and real-time item counts.
  - `src/features/content/MediaLibraryTab.tsx`: Grid of media cards with thumbnails, title, kind pills (Offer, New Arrival, Festival, Greeting), upload date, user badge, and Upload Modal supporting file selection and preview.
  - `src/features/content/TemplatesTab.tsx`: Meta WhatsApp message templates table with approval status pills (Approved, Pending, Rejected), drawer editor with variable tags (`{{customer_name}}`, `{{branch_name}}`, `{{offer_text}}`), and live WhatsApp phone preview bubble matching `docs/design/05-campaigns-wizard.png`.
  - `src/features/content/SegmentsTab.tsx`: Customer audience segments list with customer count, per-branch matching cards, and Segment Builder drawer with live audience counter evaluated against current customer database.
  - `src/types/models.ts`: Added `MediaAsset`, `MessageTemplate`, `Segment`, `SegmentRules`, `TemplateCategory`, and `MetaTemplateStatus`.
  - `src/mocks/data/content.ts`: Seeded 6 media assets, 8 message templates (Winter Collection Launch, Festive Offer Flat 20%, New Arrivals Formal Shirts, Birthday Wish, Anniversary Wish, Diwali Greetings, Loyal Customer Reward, Store Opening Hours), and 5 dynamic segments.
  - `src/services/content.ts`: Implemented media, template, and segment CRUD with live preview calculation `previewSegmentCount`.
  - `src/layouts/Sidebar.tsx` & `src/app/router.tsx`: Added `/content` to sidebar under Customer Engagement (admin only) and protected by `ProtectedRoute adminOnly`.
  - `docs/API_CONTRACT.md`: Documented Section 6 Content Library Endpoints (`GET/POST/DELETE /media`, `GET/POST/PATCH/DELETE /templates`, `GET/POST/PATCH/DELETE /segments`, `POST /segments/preview-count`).
- **Self-Check Results**:
  - Uploading a new poster displays in the media grid.
  - Segment "Birthday in December" count matches the calculated count of customer mock records born in month 12.
  - Branch users are strictly blocked from `/content` via route guard and hidden sidebar item.
  - TypeScript & Vite build clean (`npm run build` zero errors).


## Phase 5 — WhatsApp Campaigns (connector #2)
- **Status**: Completed & Verified
- **Files Added / Changed**:
  - `src/features/campaigns/CampaignsPage.tsx`: Pixel-close match to `docs/design/05-campaigns.png`. Top stat cards (Total Campaigns, Active, Sent, Scheduled, Delivery Rate %), tab filter chips (All, Active, Sent, Scheduled, Drafts), search, branch selector (locked for branch users), status filter, campaigns table with target branches icons, recipients count, delivered %, read %, date, and action menu (View Report, Retry Failed, Edit, Duplicate, Cancel, Delete).
  - `src/features/campaigns/CampaignWizard.tsx`: 4-step campaign wizard drawer matching `docs/design/05-campaigns-wizard.png` (Basics, Content, Audience & Branches, Schedule & Review) with interactive WhatsApp bubble preview, branch ON/OFF toggles with active audience preview, exclusion rules (opted-out, missing phone, quiet hours warning), and send confirmation dialog.
  - `src/features/campaigns/CampaignReportModal.tsx`: Comprehensive campaign report modal with delivery funnel (Targeted -> Sent -> Delivered -> Read), per-branch delivery breakdown cards, recipient messages table with live status badges (Delivered, Read, Failed, Queued), failure reasons, "Retry Failed" action, and CSV export.
  - `src/types/models.ts`: Added `Campaign`, `CampaignStatus`, `CampaignMessage`, `CampaignStats`, `CampaignSettings`.
  - `src/mocks/data/campaigns.ts`: Seeded 12 realistic campaigns with diverse statuses, templates, media, and recipient records.
  - `src/services/campaigns.ts`: Implemented campaign lifecycle management (create, update, delete, duplicate, cancel, schedule, send now, retry failed, recipient stats) and audience preview calculation with strict consent filtering and branch scoping.
  - `src/app/router.tsx` & `src/layouts/Sidebar.tsx`: Verified `/campaigns` route and navigation.
  - `docs/API_CONTRACT.md`: Documented Section 7 WhatsApp Campaigns Endpoints (`GET/POST /campaigns`, `GET/PATCH/DELETE /campaigns/{id}`, `POST /campaigns/{id}/send`, `POST /campaigns/{id}/schedule`, `POST /campaigns/{id}/retry-failed`, `GET /campaigns/{id}/report`, `POST /campaigns/preview-audience`, Meta Cloud Webhook specification).
- **Self-Check Results**:
  - Switched-OFF branch receives zero messages (audience preview confirms 0 for that branch).
  - Customers without consent (`consent_whatsapp: false`) are completely excluded from audience calculation.
  - Branch 2 user sees only Branch 2 campaigns and reports.
  - Delivery rates and recipient counts in report modal match campaign records.
  - Retry failed simulates re-sending failed messages and updates delivery metrics.
  - TypeScript & Vite build clean (`npm run build` zero errors).

## Phase 6 — Lead Generation
- **Status**: Completed & Verified
- **Files Added / Changed**:
  - `src/features/leads/LeadsPage.tsx`: Pixel-close match to `docs/design/06-leads-kanban-drawer.png`, `06-leads-filter-panel.png`, and `06-leads-table.png`. Segmented view switch (**Kanban | Table** with primary filled active state), search bar (`Search leads, name or phone...`), Filters popover button with active-filter badge, and `+ Add Lead` primary button.
  - `src/features/leads/KanbanBoard.tsx` & `src/features/leads/KanbanColumn.tsx`: Interactive drag & drop Kanban board powered by `@dnd-kit/core` across 5 stages (**New**, **In Progress**, **Follow-up**, **Converted**, **Lost**) with column counts, tinted header pills, card hover actions (WhatsApp, Call), overdue/today indicators, and "Show Lost" toggle.
  - `src/features/leads/LeadCard.tsx`: Rich lead card with mono ID, customer name, stage pill, enquiry clamp, branch badge, follow-up date status (red if overdue, amber if today), high-priority badges, and quick contact links.
  - `src/features/leads/LeadTable.tsx`: Pixel-close match to `06-leads-table.png` with sortable columns, checkboxes, formatted phone numbers, branch icons, stage pills, pagination, and row click drawer opening.
  - `src/features/leads/LeadDetailsDrawer.tsx`: Pixel-close match to `06-leads-kanban-drawer.png` featuring customer hero avatar, contact actions, interest tags, follow-up date picker with "Today" / "Tomorrow" / "+3 Days" chips, stage dropdown, priority dropdown, AI Insights card with category, suggested priority and bullets, consultation notes timeline with composer, activity log, "Convert to Customer", and "Mark Lost".
  - `src/features/leads/AddLeadDrawer.tsx`: Full lead creation drawer with 10-digit mobile validation, branch auto-assignment, interest tags, priority, source, and WhatsApp marketing consent checkbox.
  - `src/features/leads/FilterLeadsPopover.tsx`: Popover filter matching `06-leads-filter-panel.png` with Store Branch selector (locked for branch users), Priority segmented control, Enquiry Source selector, Follow-up date ranges, Clear, and Apply actions.
  - `src/features/leads/ConvertLeadDialog.tsx`: Confirmation dialog ensuring single customer creation or linking existing records by phone without duplicates.
  - `src/features/leads/LostReasonDialog.tsx`: Requires selection of lost reason (Not interested, Price, Out of stock, No response, Other) and optional notes.
  - `src/types/models.ts`: Added `Lead`, `LeadStage`, `LeadPriority`, `LeadSource`, `LeadNote`, `LeadActivity`, `LeadAISummary`, `LeadFilterOptions`.
  - `src/mocks/data/leads.ts`: Seeded 60 realistic Indian leads across stages, branches, and sources matching design mockups.
  - `src/services/leads.ts`: Comprehensive lead service with branch isolation, auto-assignment rule (preferred branch -> customer phone branch -> B1), stage transition audit trails, customer creation on conversion, and rule-based AI classification.
  - `docs/API_CONTRACT.md`: Documented Section 8 Lead Generation Endpoints (`GET/POST /leads`, `GET/PATCH /leads/{id}`, `PATCH /leads/{id}/stage`, `POST /leads/{id}/notes`, `POST /leads/{id}/convert`, `POST /leads/{id}/ai-classify`, `GET /leads/counts`).
- **Self-Check Results**:
  - Dragging a card to Follow-up immediately persists to `localStorage` and reflects in Table view.
  - Kanban counts match Table counts across all branches.
  - Converting a lead provisions exactly one customer profile or reuses existing phone record without duplication.
  - Branch 2 user is strictly scoped to Branch 2 leads; branch selector is disabled.
  - Filters (Branch, Priority, Source, Follow-up) and text search combine cleanly.
  - Auto-assignment rule verified: preferred branch selected -> fallback to customer's previous branch -> fallback to Branch 1.
  - TypeScript & Vite build clean (`npm run build` zero errors).

## Phase 7 — AI Chatbot: Inbox, Knowledge Base, Website Widget (connector #3)
- **Status**: Completed & Verified
- **Files Added / Changed**:
  - `src/features/chatbot/ChatbotPage.tsx`: Pixel-close 3-column AI Chatbot inbox matching `docs/design/07-chatbot-admin.png` and `07-chatbot-branch-images.png`. Header with Online/Offline status dropdown and Admin Knowledge Base shortcut.
  - `src/features/chatbot/ConversationList.tsx`: Left column with filter tabs (**All**, **Open**, **Pending**, **Closed**), search bar, and conversation list items showing avatar, channel icons (Instagram, WhatsApp, Website), relative timestamps, unread green indicators, and selected mint state.
  - `src/features/chatbot/ChatArea.tsx`: Middle column chat thread with header actions (close, reopen, mark pending, assign branch), human takeover banner with "Resume AI" button, customer bubbles, AI bubbles with badge and double tick, product image cards carousel matching `07-chatbot-branch-images.png`, system handover markers, and staff composer with media attachment icon.
  - `src/features/chatbot/LeadContextPanel.tsx`: Right column with Customer profile details, branch indicator, interest pills, Lead status selector, follow-up date, and AI conversation context bullet points with "+ Create Lead" CRM integration.
  - `src/features/chatbot/KnowledgeBaseModal.tsx`: Admin-only Knowledge Base manager featuring articles table (store locations, timings, return policy, offers, size guide, contact numbers, payment modes), keyword triggers, branch applicability, active toggles, article editor, and chat settings with non-editable AI safety rule callout ("AI cannot promise stock/price/delivery").
  - `src/features/chatbot/WebsiteChatWidget.tsx`: Floating website chat widget matching the design with pre-chat visitor registration form (name, phone, preferred branch, WhatsApp consent), quick-reply chips, typing indicator simulation, and real-time custom event synchronization with admin inbox.
  - `src/layouts/WebsiteChatButton.tsx`: Global integration of the interactive Website Chat widget into `AppShell`.
  - `src/types/models.ts`: Added `ChatConversation`, `ChatMessage`, `KBArticle`, `ChatSettings`, `ChatChannel`, `ConversationStatus`.
  - `src/mocks/data/chat.ts`: Seeded 15 realistic customer conversations across channels (Website, WhatsApp, Instagram) and branches, 7 Knowledge Base articles, and default chatbot settings.
  - `src/services/chat.ts`: Implemented conversations CRUD, staff replies with auto-AI pause, branch assignment, lead creation, KB articles management, public widget session start, and rule-based AI reply matching with strict zero-hallucination inventory policy.
  - `widget/embed.ts` & `widget/README.md`: Standalone embeddable widget script and integration documentation for external websites.
  - `docs/API_CONTRACT.md`: Documented Section 9 AI Chatbot & Knowledge Base Endpoints (`GET/POST /conversations`, `GET/POST /conversations/{id}/messages`, `PATCH /conversations/{id}`, `POST /conversations/{id}/create-lead`, `GET/POST/PATCH/DELETE /kb-articles`, `POST /public/chat/start`, `POST /public/chat/{id}/message`, WebSocket/SSE real-time sync specification).
- **Self-Check Results**:
  - Asking "What are your timings?" returns approved KB text: 10:00 AM to 9:30 PM across all 7 days.
  - Asking unknown questions returns: "I'm not sure about that. Would you like me to connect you with our store team?".
  - Stock inquiries ("in stock", "price lock") strictly avoid promising inventory and offer store handover.
  - "Talk to staff" moves conversation to Pending, inserts system line, and alerts staff.
  - Staff message switches conversation to human mode (AI paused); clicking "Resume AI" re-enables bot.
  - Create Lead creates a validated lead in `leadsService` with matching branch and context bullets.
  - Branch users see only their branch conversations.
  - TypeScript & Vite build clean (`npm run build` zero errors).
