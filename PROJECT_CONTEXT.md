# RS Mens World — Customer Engagement Platform (Project Context)

Read this file before every task. Build ONLY the phase named in the task.

## 0. How this project is built (IMPORTANT)
- This repo is the FRONTEND only. A separate backend team builds the API and database.
- Build the complete frontend first, running on MOCK DATA, then hand it to the backend team.
- Every screen gets data only through src/services/*. Each service calls a mock adapter
  (src/mocks/) when VITE_USE_MOCKS=true, and the real API (VITE_API_BASE_URL) when false.
- Each phase adds the endpoints its screens need to docs/API_CONTRACT.md
  (method, path, query params, request body, response JSON, who can call it).
  This file is the handover to the backend team.
- Connectors are my role too: Petpooja import is parsed and validated in the browser;
  WhatsApp and AI calls go through backend endpoints listed in API_CONTRACT.md
  (keys never in frontend code), with mock responses until the backend is ready.

## 1. Scope
Contracted scope (SOW): AI Chatbot, AI Lead Generation, WhatsApp Campaigns with branch toggles, Customer Database with Petpooja import, Reports.

Build now:
- Login (Head Office / Super Admin + Branch Login)
- Users & Branches (4 branches)
- Customer Database + Petpooja CSV/Excel import
- Content library (media, message templates, segments)
- WhatsApp Campaigns with per-branch ON/OFF toggles
- Lead Generation (Kanban + Table)
- AI Chatbot (website widget + inbox, WhatsApp inbound)
- Dashboard + Reports (campaign, customer, lead, chat) + CSV export

Placeholder only ("Coming soon" page, keep in sidebar): Billing (POS), Invoices & Returns, Stock & Catalogue, Stock Transfers, Accounting.

Branches (seed data):
- B1 – Rajahmundry Main Branch
- B2 – Kakinada Branch
- B3 – Vijayawada Branch
- B4 – Guntur Branch

Roles:
- super_admin: all branches, all settings, content, user management
- branch_user: ONLY their own branch's customers, campaigns, leads, chats, reports.
  The backend enforces this. The frontend also hides menus, guards routes, and the
  mock adapter filters by the logged-in user's branch so behaviour matches.

## 2. Tech stack
- React + Vite + TypeScript
- Tailwind CSS + shadcn/ui, font Inter
- TanStack Query (data fetching), React Hook Form + Zod (forms)
- React Router
- Axios (one API client with auth token header and error handling)
- SheetJS (xlsx) + PapaParse for Petpooja import
- dnd-kit for Kanban, Recharts for charts
- Backend, WhatsApp Cloud API and AI model: provided by backend team via REST API

## 3. Folder structure
```
src/
├── app/            router.tsx, providers.tsx, ProtectedRoute.tsx
├── layouts/        AppShell.tsx, Sidebar.tsx, Topbar.tsx
├── components/ui/  Button, Pill, Card, Drawer, DataTable, Tabs, Toggle, EmptyState
├── features/
│   ├── auth/       LoginPage, useAuth, BranchContext
│   ├── branches/
│   ├── users/
│   ├── customers/  CustomersPage, CustomerDrawer, ImportWizard
│   ├── content/    MediaLibrary, Templates, Segments
│   ├── campaigns/  CampaignsPage, CampaignWizard, PhonePreview
│   ├── leads/      LeadsKanban, LeadsTable, LeadDrawer, FilterPanel
│   ├── chatbot/    Inbox, ChatWindow, KnowledgeBase
│   └── reports/
├── services/       ONLY place screens get data from (customers.ts, leads.ts, ...)
├── mocks/          mock data + mock adapter (fake delay 300ms, persists to localStorage)
├── lib/            apiClient.ts, format.ts, phone.ts
└── types/          models.ts (shared TypeScript types = API response shapes)
docs/
└── API_CONTRACT.md handover to backend team, updated every phase
widget/             website chat bubble (single script tag)
```

## 4. Design system
| Token | Value | Use |
|---|---|---|
| sidebar-bg | #0B3B2E | Sidebar, login left panel |
| primary | #0F4C3A | Primary buttons, active Kanban/Table toggle |
| accent | #46D68C | Active nav item (mint), Online dot, toggles |
| accent-soft | #E6F7EF | Selected row, bot chat bubbles, Import button |
| page-bg | #F4F7F6 | App background |
| card | #FFFFFF, border #E6EBE9, radius 14px | Panels, cards |
| text / muted | #0F172A / #64748B | Headings / secondary |
| pill-green | bg #DCFCE7 text #15803D | New, Converted, Consent Yes, Sent |
| pill-yellow | bg #FEF3C7 text #A16207 | In Progress, Scheduled |
| pill-orange | bg #FFEDD5 text #C2410C | Follow-up |
| pill-red | bg #FEE2E2 text #B91C1C | Lost, Consent No, Failed |
| pill-blue / purple / amber | soft bg + dark text | Repeat, Announcement / Loyalty / VIP |

Fonts: Inter 600–700 headings, 400–500 body; monospace for IDs (L-3823, C-10248).

Sidebar groups (in order):
- Logo "RS Mens World" + subtitle "Customer Engagement Platform", branch chip below
- OPERATIONS: Dashboard, Billing (POS), Invoices & Returns
- INVENTORY: Stock & Catalogue, Stock Transfers
- FINANCE: Accounting
- CUSTOMER ENGAGEMENT: AI Chatbot, Lead Generation, Customers, WhatsApp Campaigns
- INSIGHTS & CONTROL: Reports, Users & Branches, Settings
- Bottom: user avatar, name, branch, logout icon

Page pattern (reuse everywhere):
- Header: title + subtitle (left); branch selector, date filter, bell, help, avatar (right)
- Tab chips with counts → search + filter bar → table on left, details drawer on right
- Floating "Website Chat" button bottom-right

## 5. Data model (proposed shapes for TypeScript types; backend team confirms)
Every business record has branch_id. super_admin sees all; branch_user sees own branch only.

- branches: id, code, name, city, address, timings, wa_phone_id, is_active
- profiles: id (= auth user), full_name, role, branch_id, is_active
- customers: id, code, name, phone (E.164), email, birthday, anniversary, branch_id, customer_type, status, consent, consent_source, consent_at, opted_out_at, total_purchases, order_count, last_interaction_at, source
- import_batches: id, file_name, uploaded_by, total, valid, duplicates, invalid, status, report_json
- media_assets: id, storage_path, title, kind, uploaded_by
- message_templates: id, name, category, body, variables, meta_template_name, meta_status
- segments: id, name, rules_json
- campaigns: id, name, type, template_id, media_id, segment_id, status, scheduled_at, created_by
- campaign_branches: campaign_id, branch_id, enabled, audience_count
- campaign_messages: id, campaign_id, customer_id, branch_id, wa_message_id, status, error, timestamps
- leads: id, code, name, phone, enquiry, interest_tags, source, branch_id, stage, priority, ai_summary, ai_category, follow_up_at, assigned_to, consent, customer_id
- lead_notes: id, lead_id, body, created_by, created_at
- conversations: id, channel, visitor_name, phone, branch_id, status, handover, lead_id, context_summary
- messages: id, conversation_id, sender, body, media_urls, created_at
- kb_articles: id, title, content, branch_id, is_active
- audit_logs: id, user_id, action, entity, entity_id, details, created_at

## 6. Rules for every phase
- Components call src/services/* only, never the API or mocks directly.
- No mock data inside components; all mock data lives in src/mocks/.
- Mock data is realistic (Indian names, +91 numbers, the 4 branches) and enough to test
  paging, search and filters (e.g. 200 customers, 60 leads, 12 campaigns).
- Every new endpoint a screen needs is added to docs/API_CONTRACT.md in the same phase.
- No database, SQL or server code in this repo.
- Every list has loading, empty and error states.
- Don't modify earlier phases' files unless needed, and say so when you do.
- Never put API keys or tokens in frontend code; .env is never committed.
