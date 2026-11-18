# Proposal: Phase 1 AI Chatbot, Lead Generation & Dashboard

## Why

RS Mens World operates multi-branch menswear retail stores (with Rajahmundry confirmed and up to four configurable branches) and requires a modern digital customer engagement platform. Currently, customer enquiries across store locations, campaign messaging, and Petpooja customer records lack unified lead capture, systematic pipeline tracking, and intelligent conversational assistance.

Phase 1 establishes a responsive React + Vite web application focused specifically on customer acquisition and engagement—delivering an AI Chatbot with human staff escalation, an AI-augmented Lead Pipeline, Petpooja customer data import, multi-branch campaign targeting, and a responsive operations dashboard. Core operational retail functions (POS, billing, inventory, stock transfers, and accounting) are explicitly excluded from this phase to rapidly validate and deploy customer-facing messaging and lead generation workflows.

## What Changes

- **Web Application Foundation**: Initialize a React + Vite frontend structured with modular components, Tailwind CSS styling, Lucide icons, and responsive layouts for desktop (1440px), tablet (768px), and mobile (390px).
- **Service Layer & Mock Adapters**: Implement clean service abstractions (`chatService`, `leadService`, `customerService`, `campaignService`, `branchService`, `reportService`) backed by realistic mock data and mock latency toggled via `VITE_USE_MOCKS=true`, ensuring zero client-side credential exposure and clean future backend handoff.
- **AI Chatbot Experience**: Provide a customer-facing website chat interface with approved FAQ knowledge responses (store locations, hours, policies, contacts), visible AI disclosure, automated contact & consent capture, and seamless human staff handover flagging.
- **AI-Assisted Lead Management**: Build a 6-stage Kanban and table pipeline (New, Contacted, Qualified, Follow-up, Converted, Lost) with AI-suggested lead categorization, priority scoring, enquiry summarization (with manual override), notes, follow-up scheduling, and branch assignment.
- **Multi-Branch Configuration (4 Branches)**: Deliver branch configuration supporting four configurable branches (Rajahmundry confirmed B1, plus B2–B4), role-aware switching (Super Admin view across all branches vs. Branch User view restricted to assigned branch), and independent branch toggles.
- **Petpooja Customer Import Console**: Implement a multi-step upload wizard (File Selection → Column Mapping → Validation & Duplicate Review → Confirmation) for periodic CSV/Excel exports from Petpooja, validating mobile numbers, branch tags, and explicit marketing consent.
- **Branch-Targeted Campaign Console**: Provide a 4-step campaign creator (Content/Template → 4-Branch Independent Toggles → Consent-Filtered Audience Preview → Confirmation/Schedule) ensuring excluded branches target strictly zero recipients.
- **Executive & Branch Dashboard**: Deliver responsive overview metric cards (Active Chats, Captured Leads, Follow-ups Due, Pending Handovers), recent activity feeds, trend charts, branch/date range filtering, and CSV report export.
- **Explicit Scope Boundaries**: POS, billing, live two-way Petpooja synchronization, inventory tracking, stock movements, and accounting modules are excluded from UI navigation and code.

## Capabilities

### New Capabilities
- `ai-chatbot`: Customer website chat widget and transcript management with approved FAQ responses, clear AI disclosure, contact & consent capture, and staff handover escalation.
- `lead-pipeline`: Lead capture, AI-suggested categorization/priority/summary with manual override, 6-stage Kanban and table tracking, follow-up scheduling, and branch assignment.
- `branch-management`: Configuration and role-based filtering for four branches (Rajahmundry confirmed, B1–B4 configurable), supporting Super Admin multi-branch switching and Branch User isolation.
- `customer-import`: Stepper wizard for uploading and previewing Petpooja customer CSV/Excel files with column mapping, mobile validation, duplicate detection, and marketing consent tracking.
- `campaign-console`: Campaign composition wizard featuring template/image selection, independent four-branch toggle controls, consent-filtered audience calculation preview, and dispatch scheduling.
- `dashboard-reporting`: Operations overview dashboard with KPI cards, trend visualization, activity audit lists, branch/date filtering, and CSV export capabilities.

### Modified Capabilities
*(None - this is the initial Phase 1 specification for the project)*

## Impact

- **Frontend Codebase**: Creates new React + Vite project structure under `src/` (`components/`, `pages/`, `services/`, `mocks/`, `context/`, `utils/`).
- **External Dependencies**: Installs React, Vite, React Router, Tailwind CSS, Lucide React, and utility libraries (e.g., date-fns, clsx/tailwind-merge).
- **Backend / Integration Contract**: Establishes strict provisional REST API contracts (`/api/branches`, `/api/chats`, `/api/leads`, `/api/customers`, `/api/campaigns`, `/api/reports`) designed for smooth migration from mock adapter to live backend services.
- **Security & Compliance**: Eliminates browser-side storage of third-party API keys (OpenAI/Claude/WhatsApp); mandates explicit user consent collection for marketing communications.
