# Tasks: Phase 1 AI Chatbot, Lead Generation & Dashboard

## 1. Project Scaffolding & Design Foundation

- [x] 1.1 Initialize React + Vite application with Tailwind CSS, Lucide React, and React Router v6; verify build script and development server run without errors.
- [x] 1.2 Configure design tokens in Tailwind configuration for Deep Navy (`#141b2d`), Warm Cognac (`#9c5a24`), Slate background (`#f3f4f7`), and font families (Bodoni Moda, Archivo, IBM Plex Mono); verify styles apply correctly to sample text.
- [x] 1.3 Implement responsive application layout shell (`Sidebar`, `TopBar`, `MobileDrawer`, and content container); verify responsive behavior across desktop (1440px), tablet (768px), and mobile (390px) breakpoints.
- [x] 1.4 Exclude POS, billing, inventory, stock transfer, and accounting routes from navigation; verify sidebar contains only Overview, AI Chat Inbox, Lead Pipeline, Customers, Campaigns, Reports, and Settings.

## 2. Multi-Branch Context & Mock Service Layer

- [x] 2.1 Create provisional TypeScript/JSDoc entity contracts for Branch, Customer, Chat, Lead, and Campaign based on Section 3 of the Technical Specification; verify type definitions export cleanly.
- [x] 2.2 Implement `BranchContext` supporting 4 configurable branches (B1: Rajahmundry Main Store confirmed, B2: Kakinada, B3: Vijayawada, B4: Guntur) and `AuthContext` supporting Super Admin vs. Branch User roles; verify branch switching updates context state.
- [x] 2.3 Implement synthetic seed datasets and local storage persistence in `src/mocks/seedData.js`; verify initial branches, chats, leads, customers, and campaigns load into local storage on startup.
- [x] 2.4 Implement service adapters (`apiClient`, `branchService`, `chatService`, `leadService`, `customerService`, `campaignService`, `reportService`) with `VITE_USE_MOCKS=true` toggle; verify mock methods return data with simulated latency.

## 3. AI Chatbot & Conversation Management

- [x] 3.1 Build the customer-facing website chat widget preview with collapsible trigger, brand greeting, and prominent AI participation disclosure badge; verify disclosure is clearly visible.
- [x] 3.2 Implement knowledge base FAQ search engine in mock chat service (covering Rajahmundry store hours, location, categories, exchange policies); verify approved queries return verified answers.
- [x] 3.3 Implement safe fallback messaging and staff handover trigger for unknown queries; verify "Talk to Store Staff" button flags chat as pending handover.
- [x] 3.4 Build inline contact capture form within chat collecting visitor name, 10-digit mobile number, preferred store branch, and explicit contact consent checkbox; verify validation blocks invalid phone numbers.
- [x] 3.5 Build staff AI Chat Inbox split-pane view displaying conversation list, message transcripts with timestamps/AI tags, and visitor contact context; verify conversation selection renders correct history.

## 4. AI-Assisted Lead Generation & Pipeline

- [x] 4.1 Implement automated lead creation hook connecting completed chat lead forms and manual lead creation modal to `leadService`; verify new leads appear with source and branch tags.
- [x] 4.2 Build AI heuristic classification function in `src/utils/aiClassifier.js` suggesting category (Wedding Wear, Suits & Blazers, Casuals, Alterations), priority (Low, Medium, High, Urgent), and enquiry summary; verify classification output for sample inputs.
- [x] 4.3 Build 6-stage Kanban board (New, Contacted, Qualified, Follow-up, Converted, Lost) with drag-and-drop card movement; verify moving a card updates lead stage in state and local storage.
- [x] 4.4 Build accessible alternative Table view for leads with sorting, search, branch filter, and stage badges; verify toggle switches between Kanban and Table views smoothly.
- [x] 4.5 Build Lead Details slide-over drawer allowing staff to view AI analysis, override category/priority, add activity notes, and set next follow-up dates; verify manual override tag appears when staff edits AI values.

## 5. Petpooja Customer Import Console

- [x] 5.1 Implement 4-step customer import wizard (File Upload → Column Mapping → Validation/Duplicate Review → Import Confirmation); verify stepper navigation and state preservation.
- [x] 5.2 Build CSV and Excel (.xlsx) file parser with drag-and-drop file upload zone; verify parsing correctly extracts headers and row data.
- [x] 5.3 Implement column mapping interface with automatic detection for Name, Mobile, Branch, Email, Birthday, Anniversary, and Consent; verify dropdown column remapping updates preview.
- [x] 5.4 Implement row validation checking 10-digit phone format, duplicate phone detection against existing customers, branch assignment, and marketing consent; verify invalid/duplicate counts match test files.
- [x] 5.5 Build import confirmation review screen displaying valid, invalid, duplicate, and missing-consent tallies; verify clicking "Confirm Import" saves only valid records and displays summary receipt.

## 6. Campaign Console & Branch Targeting

- [x] 6.1 Build 4-step Campaign Creator wizard (Template/Image Selection → Branch Selection → Audience Preview → Confirmation/Schedule); verify step progression controls.
- [x] 6.2 Implement independent 4-branch toggle controls with dynamic audience calculation; verify disabled branches explicitly display 0 targeted recipients.
- [x] 6.3 Implement strict consent filtering in `campaignService` excluding contacts without `marketingOptIn === true` or with invalid mobile numbers; verify audience tally matches verified opt-in count.
- [x] 6.4 Build campaign preview card rendering message template, banner image, and scheduled delivery time; verify modal confirmation triggers mock campaign creation with status "Scheduled".

## 7. Operations Dashboard, Reporting & Polish

- [x] 7.1 Build executive overview dashboard with primary KPI cards (New Chats, Captured Leads, Follow-ups Due, Pending Handovers) and quick action buttons; verify cards reflect current store counts.
- [x] 7.2 Implement enquiry volume and lead acquisition trend charts filterable by time window (Today, Last 7 Days, Last 30 Days); verify charts re-render upon date range selection.
- [x] 7.3 Implement global top-bar branch switcher for Super Admin and branch lock for Branch User; verify changing branch updates dashboard statistics and lead lists.
- [x] 7.4 Implement CSV export utility for filtered leads, campaign delivery logs, and customer registries; verify clicking "Export CSV" triggers browser file download with valid data.
- [x] 7.5 Add persistent "Demo Mode / Mock Services" top-bar badge and Integration Status screen detailing mock connection state; verify mock transparency is visible across all pages.
- [x] 7.6 Execute complete frontend production build (`npm run build`) and verify zero bundling errors, clean console logs, and proper responsive layout across viewports.

## Workflow follow-up

- Review completed Phase 1 frontend implementation with client and backend engineering teams.
- Confirm backend REST API endpoint schemas and cut over from mock adapters.
