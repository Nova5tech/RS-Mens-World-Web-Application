# RS Mens World — Master Build Spec (Phase 1B → Phase 9)

Frontend only, on mock data, per PROJECT_CONTEXT.md (read it first).
Execute the phases below IN ORDER. Do not skip ahead.

## How to execute (mandatory loop for EVERY phase)

1. Look at the design images named for that phase in `docs/design/`.
   Match them pixel-close: layout, spacing, colours, fonts, icons, pills, radius, shadows.
2. Build the phase: types → mock data → services → components → page.
3. Add every endpoint the phase needs to `docs/API_CONTRACT.md`
   (method, path, who can call it, query params, request JSON, response JSON, errors).
4. Run `npm run build`. Fix ALL TypeScript and build errors before continuing.
5. Run the dev server and verify each "Self-check" item yourself in the browser.
   Fix anything that fails. Do not continue with a failing item.
6. Commit: `git add . && git commit -m "Phase <N>: <name>" && git tag phase-<N>-done`
7. Append a short entry to `docs/BUILD_LOG.md`: phase, files added/changed,
   self-check results, anything not done and why.
8. Continue to the next phase.

If something is ambiguous, choose the option closest to the SOW and the design images,
write the decision in BUILD_LOG.md, and continue. Never stop to ask.

## Global quality rules (apply to every phase)

- Visual source of truth = images in `docs/design/`. When this spec and an image disagree on looks, the image wins.
  When they disagree on behaviour, this spec wins.
- Colours: only the palette in PROJECT_CONTEXT.md §4. Font: Inter. Icons: lucide-react, 18px, stroke 1.75.
- Reuse shared components from `src/components/ui`. Don't create one-off duplicates.
- Every list/table: loading skeleton, empty state, error state with "Retry".
- Every form: Zod validation, inline field errors, disabled + spinner while saving, success toast.
- Every destructive action: confirm dialog.
- Branch rules everywhere: `super_admin` sees all branches and the topbar branch selector filters data
  ("All Branches" = no filter). `branch_user` sees only their branch; branch filters are locked to it.
  The MOCK ADAPTER must apply this filter too (from the logged-in user), not just the UI.
- Topbar date filter (Today, Yesterday, This Week, This Month, Custom range) filters dashboards and reports.
- Mock data: realistic Indian names, valid +91 mobile numbers, the 4 branches
  (B1 Rajahmundry Main, B2 Kakinada, B3 Vijayawada, B4 Guntur), dates relative to "today".
  Persist changes in localStorage so actions survive refresh. Settings page has "Reset demo data".
- Phone numbers: store as E.164 (+919876543210), display as "+91 98765 43210".
- IDs: customers C-10001…, leads L-3801…, campaigns CMP-101…, displayed in monospace.
- Responsive: 1366, 1024, 768, 390px. Tables scroll horizontally on mobile; drawers become full-screen on mobile.
- Accessibility: labels on inputs, keyboard-usable dropdowns, visible focus ring.
- No `any` types. No console errors or React key warnings.

---

## Phase 1B — Login page: exact match to `docs/design/01-login.png`

The current login page does not match. Rebuild ONLY its visuals (keep the auth logic from Phase 1).

Assets (already in repo):
- `public/images/logo-hanger.svg` — the mint hanger logo. Use it on the login page AND in the sidebar logo.
- `public/images/login-store.jpg` — clothing store photo for the left panel.

Left panel (≈ 55% width):
- Background: deep green (#0B3B2E → #0F4C3A). The store photo sits on the right part of the panel,
  blended into the green with a left-to-right gradient overlay (green fully opaque on the left, ~0% on the right).
- Large mint curved wave shapes (#46D68C → #8EF0C6, soft gradient) sweeping up from the bottom-right corner
  and continuing behind the right card, exactly like the image. Build them as inline SVG paths.
- Logo row: hanger SVG (≈ 56px tall, NO tile/box behind it) + "RS Mens World" in white, ~44px bold.
- Under it: "MULTI-BRANCH RETAIL & CUSTOMER ENGAGEMENT" — white, ~14px, uppercase, letter-spacing ~0.25em.
  Plain text, NOT a pill/badge.
- Heading "Branch Sign In" (~48px bold white) + subheading "Access your branch dashboard" (~24px, white 90%).
  On the Head Office tab, these become "Head Office Sign In" / "Access the admin console".
- Four feature rows, NO card backgrounds: a 56px rounded-xl solid teal tile (#14795B-ish) with a white
  filled icon (store, users, megaphone, bar-chart), then bold white title + one-line white 85% description:
  Branch-wise Access / Manage your branch operations · Leads & Customers / Track and engage customers ·
  Campaigns / Run WhatsApp campaigns · Branch Reports / View your branch performance.
- Footer line: mint shield-check icon + "Secure Login • Role-based Access • Multi-branch" in white 85%.

Right card:
- White card, radius 28px, large soft shadow, floating over the mint wave, ~560px wide, generous padding (40px).
- Segmented control at top: light grey track (#F1F4F3), radius full/2xl, two segments with icons
  ("Head Office (Admin)" building icon, "Branch Login" store icon).
  ACTIVE segment = solid primary dark green (#0F4C3A) with WHITE text and icon and soft shadow.
  Inactive = transparent, dark text. Animated sliding active pill.
- Title "Branch Login" (~36px bold) + "Choose your branch and enter your credentials." (muted).
  Head Office variant: "Head Office Login" + "Sign in with your admin email and password."
- "Select Branch" custom dropdown (not native select): 56px tall, radius 14px, 1.5px dark green border when
  open/focused, store icon + "Branch 1 – Rajahmundry Main Branch" bold, chevron right. Open menu:
  white, shadow, radius 14px, each option with store icon; selected option has mint (#CFF5E3) background
  and a dark green check mark on the right.
- "Password / PIN" input: 56px, lock icon left, eye toggle right, placeholder "Enter 4–6 digit PIN or password".
- "Sign In" button: full width, 60px, primary dark green, radius 14px, white "Sign In" ~20px semibold
  with a log-in icon on the left.
- Below: "← Back to Role Selection" link in primary green, centred (switches to the Head Office tab).
- Remove the "Demo:" credentials box from the card. Instead show demo credentials only when
  VITE_SHOW_DEMO_LOGINS=true, as a small muted line under the card.
- Keep autofill styling consistent (no blue autofill background: override with white).
- Mobile (<1024px): left panel hidden, card full width on the green background with the logo above it.

Also update the SIDEBAR logo to use logo-hanger.svg without a tile, matching docs/design/06-leads-kanban-drawer.png.

Self-check: side-by-side with 01-login.png at 1671×941 — logo, tagline, tabs, dropdown, button, waves, photo match;
both tabs log in correctly; mobile layout works.

---

## Phase 2 — Users & Branches (Super Admin only)

Route `/users` with two tabs: **Branches** and **Users**. Same page pattern as the customers design
(tab chips with counts, search, table, right drawer).

Branches tab: table (Code, Branch Name, City, Address, Timings, WhatsApp Number, Users, Status).
Drawer to add/edit: name, code, city, address, phone, opening timings (per day or one range), WhatsApp number,
Active toggle. Deactivating a branch hides it from login and selectors (confirm first).

Users tab: table (Name, Login type, Branch, Role, Last login, Status). Drawer to add/edit:
full name, role (Super Admin / Branch User), email+password for admins, branch + 4–6 digit PIN for branch users,
Active toggle. Actions: Reset PIN/password (shows new value once), Deactivate.
Rules: a deactivated user cannot log in; an admin cannot deactivate themselves; the last active admin cannot be removed.

API: GET/POST/PATCH /branches, GET/POST/PATCH /users, POST /users/{id}/reset-credential.
Self-check: create a Branch 3 user → log in as them → only Branch 3 visible; deactivated user is blocked at login.

---

## Phase 3 — Customer Database + Petpooja Import (connector #1)

Design: `docs/design/03-customers.png`. Route `/customers`. Mock: 200 customers across 4 branches.

Page:
- Header "Customer Database" / "Manage customers and import from Petpooja"; buttons "Import (Petpooja)"
  (mint-soft style) and "+ Add Customer" (primary).
- Tab chips with counts: All Customers · New (added in last 30 days) · Active (interaction in last 90 days) · Inactive.
- Filter bar: search (name, phone, email), Branch, Consent (All/Yes/No), Customer Type (Regular/VIP/Repeat), Filters
  (birthday month, anniversary month, source, date added).
- Table: checkbox, Customer Name, Phone, Branch, Consent (green "✓ Yes" / red "✕ No" pill), Last Interaction,
  Customer Type pill, ⋮ menu (View, Edit, Mark opted-out, Delete). Paging 20/page, sortable columns.
- Bulk actions when rows are selected: Export CSV, Change type, Mark opted-out.
- Customer Details drawer: avatar, name, ID, Active pill, phone, email, branch, type, customer-since date;
  Purchase Summary card (Total Purchases ₹, No. of Orders, Avg. Order Value); Consent section (status, source, date,
  opted-out date); Recent activity (campaigns received, leads, chats).

Add/Edit customer form: name*, mobile* (+91, 10 digits, unique), email, branch* (locked for branch users),
birthday, anniversary, customer type, consent checkbox → records consent_source = "manual" and consent_at = now.

Import wizard (full-screen modal, 5 steps with a stepper like the campaign wizard):
1. Upload: drag & drop .xlsx/.xls/.csv (max 10 MB), "Download sample template" link (generate a CSV template).
2. Map columns: auto-match Petpooja headers (Name/Customer Name, Mobile/Phone/Contact, Email, Branch/Outlet,
   Birthday/DOB, Anniversary, Total Spent, Orders) with dropdown overrides; required: Name, Mobile.
   Branch column values are matched to branches (fuzzy: "Rajahmundry", "RJY", "Main" → B1); unmatched rows go to
   a chosen default branch. Branch users can only import into their own branch.
3. Validate: normalise phones (strip spaces, +91, leading 0); flag Invalid (not 10 digits / not starting 6–9),
   Duplicate in file, Already exists (same phone in DB → will update, not create). Consent column if present,
   otherwise a choice: "Customers have given consent" checkbox with source "petpooja_import".
4. Review report: counts (Total, Will create, Will update, Duplicates skipped, Invalid skipped) + table with
   filters per status + "Download report CSV".
5. Import: progress bar, batches of 500, final summary. Save an import batch record.
Import history: a link "Import history" showing past batches (file, user, date, counts).

API: GET /customers (page, pageSize, search, branchId, consent, type, status, filters), GET /customers/{id},
POST /customers, PATCH /customers/{id}, DELETE /customers/{id}, POST /customers/bulk-upsert (import batch),
GET /customers/counts, GET /imports, GET /imports/{id}.
Self-check: import a test file of 50 rows with 3 invalid and 2 duplicate phones → report 45/2/3; re-import
creates 0 new; Branch 1 user sees only Branch 1; tab counts match table.

---

## Phase 4 — Content Library (Super Admin)

Route `/content` (sidebar under Customer Engagement as "Content Library", admin only) with tabs:
**Media**, **Templates**, **Segments**.

Media: grid of image cards (thumbnail, title, kind pill: Offer / New Arrival / Festival / Greeting, date).
Upload modal: image (jpg/png/webp, ≤ 5 MB, preview), title, kind. Mock stores images as data URLs.
Templates: table + editor drawer: name, category (Promotional, Greeting, Festival, Birthday, Anniversary,
Announcement, Loyalty), body with variable chips {{customer_name}} {{branch_name}} {{offer_text}}, optional
header image, CTA button text + URL, Meta template name, Meta status pill (Pending/Approved/Rejected).
Live WhatsApp-style preview on the right (same bubble style as 05-campaigns-wizard.png). Only Approved templates
can be used for sending (mock: allow admin to set status).
Segments: list + rule builder (branch, birthday month, anniversary month, new vs existing, customer type,
last interaction before/after, opted-in only — always on for promotional) with live matching count per branch.
Seed: 6 media, 8 templates (Winter Collection Launch, Festive Offer Flat 20%, New Arrivals Formal Shirts,
Birthday Wish, Anniversary Wish, Diwali Greetings, Loyal Customer Reward, Store Opening Hours), 5 segments.

API: GET/POST/DELETE /media, GET/POST/PATCH/DELETE /templates, GET/POST/PATCH/DELETE /segments,
POST /segments/preview-count.
Self-check: upload poster → visible; segment "Birthday in December" count = manual count of mock data;
branch users cannot open /content.

---

## Phase 5 — WhatsApp Campaigns (connector #2)

Design: `docs/design/05-campaigns-wizard.png`. Route `/campaigns`. Mock: 12 campaigns.

Page:
- Header "WhatsApp Campaigns" / "Create and manage WhatsApp marketing campaigns across branches", "+ Create Campaign".
- 5 stat cards: Total Campaigns, Messages Sent, Delivered %, Read %, Failed (for current filters).
- Tabs: All Campaigns · Drafts · Scheduled · Sent (counts). Search, Branch filter, Status filter, Filters.
- Table: checkbox, Campaign Name, Type pill (Promotional mint, Announcement blue, Loyalty purple, Greeting amber),
  Branches ("B1, B2, B3, B4" monospace), Audience, Status pill (Draft grey, Scheduled amber, Sending blue,
  Sent green, Failed red), Date, ⋮ (View report, Duplicate, Edit draft, Cancel schedule, Delete draft).

Create Campaign drawer (right side, wide, with the live phone preview column exactly like the design):
Stepper 1 Details → 2 Audience → 3 Content → 4 Review.
1. Details: Campaign Name*, Campaign Type*, Message Template* (approved only).
2. Audience: "Select Branches (Independent ON/OFF)" — one row per branch with checkbox + toggle + name;
   optional Segment; per-branch audience count shown live, computed as: customers of that branch matching the
   segment, consent = yes, not opted out, valid phone. Show excluded counts (no consent / opted-out / invalid).
3. Content: pick image from Media library (or upload), fill template variables, CTA; preview updates live with
   personalisation using a sample customer.
4. Review: summary, per-branch counts, total, cost estimate line ("Messaging charges billed by Meta"),
   "Send now" or "Schedule" (date-time picker, must be future). Confirm dialog before sending.
Branch users: see campaigns released to their branch (read-only reports). Admin setting
"Allow branch users to create campaigns" (default OFF); when ON, branch users can create campaigns for their own
branch only (no branch toggles shown).

Campaign report page `/campaigns/:id`: header with status, per-branch table (audience, sent, delivered, read,
failed), funnel bar, recipients table (customer, branch, status pill, time, error) with status filter and CSV export,
"Retry failed" button.

Mock sending simulation: on send, create one message per recipient with status "queued"; a timer advances
statuses over ~10 seconds (queued → sent → delivered → read, ~3% failed with an error text like
"Number not on WhatsApp"); scheduled campaigns start when their time passes (check every 30s while app is open).
Opt-out: in the customer drawer, "Mark opted-out"; opted-out customers are excluded from future audiences.

API: GET /campaigns, GET /campaigns/{id}, POST /campaigns (draft), PATCH /campaigns/{id},
POST /campaigns/{id}/audience-preview, POST /campaigns/{id}/send, POST /campaigns/{id}/schedule,
POST /campaigns/{id}/cancel, POST /campaigns/{id}/retry-failed, GET /campaigns/{id}/messages,
GET /campaigns/stats, GET/PATCH /settings/campaigns.
Backend-only (document in the contract, frontend never calls): POST /webhooks/whatsapp — receives Meta status
updates and inbound messages; "STOP"/"UNSUBSCRIBE" replies set opted_out_at; sending uses WhatsApp Cloud API
approved templates with image header, batched within account messaging limits.
Self-check: B1 ON, B2 ON, B3 OFF, B4 OFF → only B1+B2 recipients created; no-consent/opted-out never included;
scheduled campaign starts on time; statuses animate to delivered/read; report CSV exports.

---

## Phase 6 — Lead Generation

Designs: `docs/design/06-leads-kanban-drawer.png`, `06-leads-filter-panel.png`, `06-leads-table.png`.
Route `/leads`. Mock: 60 leads across stages, branches and sources.

- Header "Lead Generation" / "Track and manage potential customers". Toggle Kanban | Table (primary filled when active).
  Search "Search leads, name or phone…", "Filters" button, "+ Add Lead".
- Kanban columns with tinted headers and counts: New (blue tint), In Progress (yellow), Follow-up (orange),
  Converted (green); "Show Lost" toggle adds a Lost column (red tint). Cards: name (truncated), stage pill,
  enquiry line, branch icon + "Branch N", clock + relative time / follow-up date. Drag & drop between columns
  (dnd-kit) updates the stage; selected card has a dark green border.
- Table view: Lead ID (mono), Customer (sortable), Contact (phone icon), Enquiry, Branch, Stage pill, Updated, chevron.
- Filter Leads panel (popover exactly like the design): Store Branch select, Priority segmented
  (All / High / Medium / Low), Enquiry Source select (All, Website Chat, WhatsApp, Campaign Reply, Enquiry Form,
  Walk-in, Manual), Follow-up (Overdue, Today, This week); Clear / Cancel / Apply. Active filter count on the button.
- Lead Details drawer: avatar, name, stage pill, Lead ID; phone (click-to-call link + WhatsApp link), branch,
  interest tags, Follow-up date picker, Lead Stage select, Priority select, Source, Assigned to,
  AI Summary card (summary, category, suggested priority — labelled "AI suggestion", with "Accept" and editable),
  Notes timeline with "Add note", Activity log (stage changes with user and time).
- Add Lead form: name*, phone*, enquiry*, interest tags, source, preferred branch (auto-assign: preferred branch,
  else the branch of an existing customer with that phone, else B1 — note rule in BUILD_LOG), priority,
  follow-up date, consent checkbox.
- Stage → Converted: confirm dialog "Add to customer database?" → creates the customer in the lead's branch
  (or links an existing customer with the same phone, no duplicate), copies consent.
- Stage → Lost: requires a reason (Not interested, Price, Out of stock, No response, Other).
- Notifications: bell shows follow-ups due today/overdue; clicking opens the lead.

API: GET /leads (filters, paging), GET /leads/{id}, POST /leads, PATCH /leads/{id}, PATCH /leads/{id}/stage,
POST /leads/{id}/notes, GET /leads/{id}/activity, POST /leads/{id}/convert, POST /leads/{id}/ai-classify
(backend calls the AI model), GET /leads/counts, GET /notifications, PATCH /notifications/{id}/read.
Self-check: drag to Follow-up → refresh → persists; kanban counts = table counts; converting creates exactly
one customer; Branch 2 user sees only Branch 2 leads; filters + search combine correctly.

---

## Phase 7 — AI Chatbot: Inbox, Knowledge Base, Website Widget (connector #3)

Designs: `docs/design/07-chatbot-admin.png`, `07-chatbot-branch-images.png`. Route `/chatbot`.
Mock: 15 conversations (website + WhatsApp), with messages, some with product image cards.

Inbox (3 columns exactly like the design):
- Header "AI Chatbot" / "Customer conversations • All branches"; Online/Offline status dropdown (green dot).
- Left: tabs All · Open · Pending · Closed with counts, search, conversation list (avatar or person icon,
  name, last message, relative time, unread green dot, channel icon Website/WhatsApp/Instagram).
- Middle: header (avatar, name, "Channel • Branch N", info, open-in-new, ⋮ menu: Close, Reopen, Assign branch,
  Mark pending). Messages: customer bubbles grey left, AI/staff bubbles mint right with time + double tick;
  AI messages carry a small "AI" label; image-card messages show a row of product images;
  system lines (e.g. "Handed over to staff"). Composer: attach, "Type a message…", send button.
  When a staff member replies, the conversation switches to human mode (AI paused) with a "Resume AI" button.
- Right: Lead Details (Name, Phone, Branch, Interest pills, Lead Status select, Follow-up date) with
  "+ Create Lead" (or "View Lead" if linked), and Conversation Context bullets (AI summary).
- Pending = customer asked for a human. Badge count in sidebar for Pending.
- Branch users see only conversations of their branch.

Knowledge Base (tab or sub-page "Knowledge Base", admin only): articles (title, content, branch = all or one,
active toggle) — seed: store locations & addresses for 4 branches, timings, exchange & return policy, current
offers, size guide, contact numbers, payment modes. Chat settings: welcome message, AI on/off, offline message,
handover message, "AI cannot promise stock/price/delivery" rule text (shown, not editable).
Transcript review: admin can open any closed conversation.

Mock AI (until backend is ready): a function that matches the visitor's message against KB article keywords and
replies with that article's text; if nothing matches → "I'm not sure about that. Would you like me to connect you
with our store team?"; stock/price/delivery questions → never confirms, offers handover. Replies arrive after
~1s with a typing indicator. After 3+ customer messages or on "Create Lead", generate a summary + category
(Wedding/Occasion wear, Bulk/Corporate order, Product enquiry, Store info, Other) + priority by simple rules.

Website chat widget:
- The floating "Website Chat" button opens a 380×600 chat panel (also usable on mobile full-screen) styled like the
  app: header with logo + "RS Mens World Assistant" + "AI" badge + close; pre-chat form (name*, phone*, preferred
  branch*, consent checkbox "I agree to be contacted on WhatsApp"); then the chat with quick-reply chips
  (Store timings, Nearest branch, Current offers, Talk to staff).
- New widget chats appear live in the inbox (shared mock store + event); a lead is created automatically when
  the visitor gives purchase intent or asks for staff.
- Also build it as a standalone embeddable bundle in `widget/` (Vite library build → `dist-widget/rs-chat.js`)
  with usage documented: `<script src=".../rs-chat.js" data-api="https://api..." data-branch="B1"></script>`.

API: GET /conversations (status, branch, search), GET /conversations/{id}, GET /conversations/{id}/messages,
POST /conversations/{id}/messages (staff reply), PATCH /conversations/{id} (status, branch, ai_paused),
POST /conversations/{id}/create-lead, GET/POST/PATCH/DELETE /kb-articles, GET/PATCH /settings/chat,
Public (widget, no login): POST /public/chat/start, POST /public/chat/{id}/message (returns AI reply),
GET /public/chat/{id}/messages. Real-time: document a WebSocket or SSE channel /ws/conversations for new messages.
Backend-only notes: AI replies must answer only from KB articles, label AI, never promise stock/price/delivery,
API key server-side; WhatsApp inbound messages arrive via the webhook into the same conversations.
Self-check: "What are your timings?" → correct KB answer; unknown question → handover offer; "Is this in stock?" →
no promise; "Talk to staff" → Pending; staff reply appears in widget; Create Lead fills name/phone/branch/summary.

---

## Phase 8 — Dashboard & Reports

Dashboard `/dashboard` (respects branch + date filters):
- KPI cards with icon tiles and change vs previous period: Total Customers, New Customers, Opted-in %,
  Campaigns Sent, Messages Delivered %, Read %, New Leads, Conversion %, Open Chats, Pending Handovers.
- Charts (Recharts, palette colours only): Messages sent/delivered/read over time (line), Leads by stage (bar),
  Leads by source (donut), Customers by branch (bar — admin only), Chat volume by day (area).
- Lists: Follow-ups due today (click → lead), Recent campaigns (status), Recent conversations.
- Branch user sees their branch only; admin "All Branches" sees branch comparison table.

Reports `/reports` with tabs: Campaign · Customer · Lead · Chat (exactly the SOW list):
- Campaign: per campaign and per branch — sent, delivered, read, failed.
- Customer: customers by branch, opt-in status, newly added in range, source.
- Lead: new leads, by source, by branch, by stage, follow-ups due, conversion rate.
- Chat: chat enquiries, handover requests, leads captured from chat, by channel and branch.
Each: filters (branch, date range, extra per tab), summary cards, table, "Export CSV" (UTF-8 with BOM so Excel opens
it correctly; ₹ amounts and dates formatted).

API: GET /dashboard/summary, GET /dashboard/charts, GET /reports/{campaigns|customers|leads|chats}
(filters) and the same with `?format=csv`.
Self-check: report totals equal counts from mock data for the same filters; branch user sees own branch only;
CSV opens correctly in Excel.

---

## Phase 9 — Settings, Audit Log, Hardening, Handover

- Settings `/settings` (admin): Business profile (name, logo upload, support phone), Campaign settings
  (allow branch campaigns, quiet hours e.g. no sends 9pm–9am, default consent source), Chat settings link,
  WhatsApp connection status card (mock: "Connected — +91 ….", "Business verified"), AI provider status card,
  "Reset demo data" (mock only).
- Audit log `/settings/audit` (admin): table of actions (login, import, campaign send/schedule/cancel, lead stage
  change, user changes, KB edits) with user, branch, time, details; filters; recorded by the services layer.
- Notifications dropdown (bell): follow-ups due, campaign finished, import finished, new pending chat.
- Help (?) opens a small "How to" panel with links for each module.
- Global: 404 page, error boundary page, session-expired handling, toasts consistent, page titles in browser tab.
- Responsive pass on every page at 1366/1024/768/390; fix overflow and touch targets ≥ 40px.
- Performance: route-level code splitting (React.lazy), table virtualization not needed below 1,000 rows.
- Handover:
  - `docs/API_CONTRACT.md` complete and consistent (one section per module, shared models section, error codes,
    paging, auth, branch-isolation rule stated on every endpoint).
  - `README.md`: setup, scripts, env vars (VITE_USE_MOCKS, VITE_API_BASE_URL, VITE_SHOW_DEMO_LOGINS),
    folder structure, how to switch a service from mock to real API, demo logins, widget embed instructions.
  - `docs/TEST_CHECKLIST.md`: every self-check from all phases + the SOW acceptance criteria below, as a checklist.

SOW acceptance criteria (final self-check):
- Petpooja customers imported and assigned to correct branches; duplicates and invalid numbers reported.
- Super Admin uploads an image with an offer/wish and sends it only to branches switched ON.
- Switched-OFF branches and customers without consent receive nothing.
- Each branch user sees only their own customers, campaigns and leads.
- AI chat answers from approved information, says when it cannot answer, offers hand-over.
- Chat leads captured with correct details, classified, assigned to the right branch.
- Reports match the underlying campaign, customer and lead records.

Final step: `npm run build` clean, commit, tag `v1.0-frontend`, and write a final summary in BUILD_LOG.md
listing anything incomplete.
