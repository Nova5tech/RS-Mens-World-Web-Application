# RS Mens World — Comprehensive Test & Acceptance Checklist

Master quality assurance and acceptance criteria checklist covering Phase 1B through Phase 9, plus SOW deliverables.

---

## 1. Authentication & Role-Based Access (Phase 1 & 1B)
- [x] **Visual Parity**: Login page visually matches `docs/design/01-login.png` (store photo blend, organic mint waves, hanger logo, 28px card radius, segmented controls, custom branch dropdown).
- [x] **Head Office Login**: Super admin logs in with `admin@rsmensworld.com` / `Admin@123`.
- [x] **Branch Login**: Branch user logs in with Branch selector (B1–B4) and PIN (`1111`, `2222`, `3333`, `4444`).
- [x] **Deactivated Account**: Deactivated user account is blocked from login with explicit error message.
- [x] **Route Protection**: Unauthenticated requests redirect to `/login`.
- [x] **Branch Isolation**: Branch user cannot access `/users`, `/content`, or `/settings`.

---

## 2. Users & Branches Management (Phase 2)
- [x] **Branches Tab**: Lists all 4 branches with code, address, timings, WhatsApp number, user counts, and active status.
- [x] **Add/Edit Branch**: Create and update branch records with validation.
- [x] **Users Tab**: Lists staff and administrators with role badges, branch assignments, and login methods.
- [x] **Credential Reset**: Super Admin can reset user PIN or password; new temporary credential is displayed once.
- [x] **Self-Deactivation Guard**: Super Admin cannot deactivate their own active account or the last remaining admin.

---

## 3. Customer Database & Petpooja Import (Phase 3)
- [x] **Visual Parity**: Customers page matches `docs/design/03-customers.png`.
- [x] **Seed Data**: 200 realistic Indian customer records with E.164 phone formatting.
- [x] **Tab Counts**: All Customers, New (last 30d), Active (last 90d), and Inactive counts reflect underlying data.
- [x] **Branch Scoping**: Branch users only see customers belonging to their assigned store branch.
- [x] **Petpooja Importer**: 5-step import modal handles `.xlsx`, `.xls`, `.csv` up to 10 MB.
- [x] **Column Mapping**: Auto-detects Petpooja headers with fuzzy branch matching (e.g. "Rajahmundry" -> B1).
- [x] **Phone Validation**: Detects invalid mobile numbers (<10 digits / not starting with 6–9) and file duplicates.
- [x] **Upsert Integrity**: Re-importing existing phone numbers updates profiles rather than creating duplicates.
- [x] **CSV Export**: Downloads clean CSV with UTF-8 BOM (`\uFEFF`) displaying INR currency (`₹`) properly in Excel.

---

## 4. Content Library (Phase 4)
- [x] **Admin Only**: `/content` is restricted to Super Admin; hidden from branch user sidebar.
- [x] **Media Assets**: Upload image files (PNG/JPG/WebP <= 5 MB), categorize by kind (Offer, New Arrival, Festival, Greeting).
- [x] **Message Templates**: Manage WhatsApp templates with variable chips (`{{customer_name}}`, `{{branch_name}}`).
- [x] **Phone Preview**: Live WhatsApp bubble preview renders personalizations accurately.
- [x] **Audience Segments**: Segment builder with live dynamic audience count evaluated against customer database.

---

## 5. WhatsApp Campaigns (Phase 5)
- [x] **Visual Parity**: Wizard matches `docs/design/05-campaigns-wizard.png`.
- [x] **Independent Branch Toggles**: Each branch (B1, B2, B3, B4) can be switched ON/OFF independently.
- [x] **Consent Enforcement**: Only customers with `consent === true` and without opt-out are queued.
- [x] **Zero Sends to Switched-OFF**: Branches set to OFF receive 0 messages; audience preview shows 0.
- [x] **Quiet Hours**: Respects DND quiet hours rules when enabled in platform settings.
- [x] **Execution Simulation**: Messages progress through queued -> sent -> delivered -> read with realistic delivery rates (~96%).
- [x] **Campaign Report**: Per-branch delivery breakdown, recipient logs, retry failed messages, and CSV export.

---

## 6. Lead Generation & CRM (Phase 6)
- [x] **Visual Parity**: Matches `docs/design/06-leads-kanban-drawer.png`, `06-leads-table.png`, `06-leads-filter-panel.png`.
- [x] **View Switcher**: Toggle between Kanban and Table views with persistent active filters.
- [x] **Kanban DND**: Drag and drop cards across stages (New, In Progress, Follow-up, Converted, Lost) with `@dnd-kit`.
- [x] **Lead Drawer**: Slide-over drawer with AI insights bullets, category, consultation notes timeline, and activity trail.
- [x] **Auto-Assignment**: Leads auto-assign based on preferred branch -> customer history -> Branch 1.
- [x] **Lead Conversion**: Moving to Converted provisions exactly one customer profile without duplicates.
- [x] **Lost Reason**: Moving to Lost requires mandatory reason selection.

---

## 7. AI Chatbot & Website Widget (Phase 7)
- [x] **Visual Parity**: 3-column inbox matches `docs/design/07-chatbot-admin.png`.
- [x] **Knowledge Grounding**: Bot answers inquiries strictly from approved Knowledge Base articles.
- [x] **Zero Inventory Hallucination**: Bot refuses to confirm live floor stock or custom discount promises and offers staff handover.
- [x] **Staff Takeover**: Human reply pauses AI mode with an explicit "Resume AI" button.
- [x] **Pending Status**: Visitor asking for staff moves conversation to Pending status.
- [x] **Embedded Widget**: Floating website chat widget registers pre-chat contact and syncs live to staff inbox.
- [x] **Standalone Widget**: Embed script bundle in `widget/` with clear integration instructions.

---

## 8. Dashboard & Reports (Phase 8)
- [x] **KPI Cards**: 10 performance cards (Total Customers, New, Opted-in %, Campaigns Sent, Delivered %, Read %, New Leads, Conversion %, Open Chats, Pending Handovers).
- [x] **Recharts Visualizations**: 5 charts using approved brand palette (#0B3B2E, #0F4C3A, #46D68C, #E6F7EF).
- [x] **Branch Comparison**: Super Admin viewing "All Branches" sees comparative metrics table.
- [x] **Reports Hub**: 4 tabs (Campaign, Customer, Lead, Chat) with date range and branch scoping.
- [x] **Excel CSV Export**: All reports export with UTF-8 BOM (`\uFEFF`) and proper date/currency formatting.

---

## 9. Settings, Audit Log, Hardening & Handover (Phase 9)
- [x] **Business Profile**: Configure company name, tagline, support phone, email, and address.
- [x] **Campaign Rules**: Allow/disallow branch campaigns, toggle quiet hours (e.g. 9:00 PM – 9:00 AM), set default consent source.
- [x] **Status Cards**: WhatsApp Cloud API verified badge and AI model engine status cards.
- [x] **Demo Reset**: One-click factory reset restores initial seed state.
- [x] **Audit Log**: `/settings/audit` records logins, imports, campaign sends, lead changes, user edits with CSV export.
- [x] **Notifications**: Topbar bell shows unread count and dropdown with follow-ups, campaigns, imports, and handovers.
- [x] **Help Guide**: Topbar (?) opens interactive architectural and module operations guide.
- [x] **404 Page**: Custom branded Not Found page with return to dashboard action.
- [x] **Error Boundary**: Catches unhandled UI errors gracefully without blank screens.
- [x] **Code Splitting**: All major route modules split via `React.lazy` and `Suspense`.
- [x] **Page Titles**: Browser document title updates dynamically per route.
- [x] **API Contract**: Complete handover specification in `docs/API_CONTRACT.md`.
- [x] **README**: Setup, scripts, env vars, mock-to-real switch guide in `README.md`.

---

## 10. SOW Acceptance Criteria Summary
1. **Petpooja import**: Customers imported, validated, normalized, and mapped to correct branches; duplicates and invalid numbers reported accurately.
2. **Targeted WhatsApp campaigns**: Super Admin sends promotional broadcasts with offer media ONLY to branches toggled ON.
3. **Consent protection**: Switched-OFF branches and customers without opt-in consent receive nothing.
4. **Branch tenancy**: Every branch user sees ONLY their own branch's customers, campaigns, leads, chats, and reports.
5. **AI Chatbot**: Answers exclusively from approved knowledge base, never hallucinates stock or prices, and supports human staff takeover.
6. **Lead capture**: Inbound inquiries captured with customer details, classified by AI, and assigned to the right branch.
7. **Report fidelity**: Report metrics match underlying mock customer, lead, and campaign records.
