# Technical Design: Phase 1 AI Chatbot, Lead Generation & Dashboard

## Context

RS Mens World requires a digital customer engagement application that unifies customer enquiries, AI-assisted lead management, Petpooja customer data imports, and branch-specific promotional messaging. Phase 1 targets frontend architecture, UI workflows, and service interfaces for customer acquisition, excluding legacy retail modules (POS, inventory, billing, accounting). See `proposal.md` for business motivation and scope boundaries.

The requirements derive from the PRD, Technical Specification, and UI/UX Design Specification documents, adapted from client-accepted reference workflows.

## Goals / Non-Goals

**Goals:**
- Deliver a modern React + Vite single-page application with modular component architecture and responsive design across desktop (1440px), tablet (768px), and mobile (390px).
- Provide a clean Service Adapter pattern (`src/services/` and `src/mocks/`) allowing seamless switching between local mock services and future backend APIs via `VITE_USE_MOCKS=true`.
- Implement an AI Chatbot experience featuring approved FAQ answers, visible AI disclosure, contact & consent capture, and human staff escalation.
- Implement an AI-assisted Lead Pipeline with 6-stage Kanban and table views, automated category/priority suggestions with staff manual override, and follow-up scheduling.
- Implement a 4-step Petpooja customer import wizard with column mapping, 10-digit mobile validation, duplicate detection, and consent tagging.
- Implement a 4-step Campaign Console with template preview, independent 4-branch toggles, and consent-filtered audience calculation.
- Deliver an executive overview dashboard with KPI cards, trend visualization, branch/date filtering, and CSV report export.
- Implement 4 configurable branches (with Rajahmundry as confirmed B1, plus B2–B4 configurable slots) with role-aware scoping (Super Admin vs. Branch User).

**Non-Goals:**
- Billing, POS checkout, cash drawers, and barcode scanning.
- Inventory tracking, stock levels, stock transfers between stores, and purchase orders.
- Accounting, ledgers, GST tax filing, and retail financial management.
- Live direct browser connections to LLM providers (OpenAI/Anthropic) or WhatsApp Cloud API (all external AI and messaging integrations are strictly handled by the backend).
- Real database persistence or user authentication beyond mock session state in Phase 1.

## Decisions

### 1. Frontend Architecture and Component Structure
- **Decision**: Build using React 18+, Vite, React Router v6, and modular layout components.
- **Directory Layout**:
  ```text
  src/
  ├── app/             # Router, providers, and layout shell (Sidebar, TopBar)
  ├── components/
  │   ├── chat/        # Website chat widget preview, staff chat inbox, transcript viewer
  │   ├── leads/       # Kanban board, lead cards, table view, lead details drawer/modal
  │   ├── customers/   # Customer directory, Petpooja import wizard
  │   ├── campaigns/   # 4-step campaign creator, template preview, audience calculator
  │   ├── dashboard/   # Metric KPI cards, trend charts, activity feed
  │   └── shared/      # Modal, Drawer, Button, Input, Select, Badge, Toast, Table
  ├── context/         # AuthContext (roles), BranchContext (active branch), ThemeContext
  ├── hooks/           # useLeads, useChats, useCampaigns, useCustomers, useDebounce
  ├── mocks/           # Mock data generators, seed datasets, localStorage adapters
  ├── services/        # Service interfaces (apiClient, chatService, leadService, etc.)
  ├── types/           # Provisional TypeScript/JSDoc entity contracts
  └── utils/           # CSV export, date formatters, phone validators, AI heuristics
  ```
- **Rationale**: Strict component isolation ensures maintainability and simplifies unit testing.
- **Alternatives Considered**: Next.js (unnecessary server complexity for an internal/portal SPA) or single-file HTML/JS (unmaintainable).

### 2. Service Layer and Mock Adapter Pattern
- **Decision**: Abstract all data access behind standardized service modules (`chatService`, `leadService`, `customerService`, `campaignService`, `branchService`, `reportService`). When `VITE_USE_MOCKS=true`, services route to in-memory/localStorage adapters with simulated network latency (150–300ms). When `false`, requests route through `apiClient` using standard `fetch`.
- **Rationale**: Isolates UI code from API implementation details, allowing complete frontend verification and demo presentation before backend delivery.
- **Alternatives Considered**: Mock Service Worker (MSW) — rejected to avoid service worker registration complexity across environments.

### 3. State Management and Context
- **Decision**: Use React Context for global application concerns (`BranchContext` for active branch selection, `AuthContext` for demo user roles: Super Admin vs. Branch User, `ToastContext` for feedback notifications) combined with custom hooks for entity state.
- **Rationale**: Eliminates external state management libraries (Redux/Zustand), reducing bundle size and cognitive overhead for Phase 1.
- **Alternatives Considered**: Redux Toolkit (overkill for prototype scope).

### 4. Styling and Design System
- **Decision**: Tailwind CSS customized with client-accepted menswear design tokens:
  - Deep Navy primary (`#141b2d`) for navigation and structural headers
  - Warm Cognac accent (`#9c5a24`) for primary calls-to-action, highlights, and active states
  - Light Slate work surface (`#f3f4f7`) for background contrast
  - Typography: Bodoni Moda (display/headings), Archivo (body text), IBM Plex Mono (tabular data and IDs)
- **Rationale**: Aligns directly with client-approved design specifications while ensuring accessibility and responsive breakpoints (desktop: 1440px, tablet: 768px, mobile: 390px).

### 5. Multi-Branch Configuration (4 Branches)
- **Decision**: Model four branch entities:
  - `B1`: Rajahmundry (Main Store, Confirmed)
  - `B2`: Kakinada (Configurable Branch 2)
  - `B3`: Vijayawada (Configurable Branch 3)
  - `B4`: Guntur (Configurable Branch 4)
  Super Admin can select "All Branches" or filter to any single branch. Branch User is locked to their assigned branch.
- **Rationale**: Resolves the scope discrepancy between earlier 3-branch notes and newer SOW 4-branch requirements.

### 6. AI Simulation & Knowledge Retrieval Engine
- **Decision**: Implement lightweight client-side knowledge matching in mock mode:
  - FAQ keyword and semantic intent matcher against verified store knowledge (hours, location, categories, policies).
  - Lead classifier heuristic that analyzes raw visitor enquiry text and assigns appropriate category (Wedding Wear, Suits & Blazers, Casuals, Alterations), priority score (Low, Medium, High, Urgent), and summary.
  - Clear AI participation disclosure on all generated outputs, with staff override flags.
- **Rationale**: Allows immediate, realistic demonstration of AI value without incurring LLM API costs or token exposure in client code.

## Risks / Trade-offs

- **[Risk] Mock Data Schema Drift**: Mock data shapes may diverge from backend team's final implementation.
  → *Mitigation*: Base all mock entities strictly on the provisional API contracts defined in Section 3 of the Technical Specification; provide clean schema documentation.
- **[Risk] Prototype Data Loss on Browser Clear**: LocalStorage-backed changes may be lost if browser cache is cleared.
  → *Mitigation*: Provide a "Reset Seed Data" utility button in Settings, allowing instant regeneration of realistic demonstration records.
- **[Risk] Accidental Messaging to Non-Consenting Contacts**: Campaigns could inadvertently target unverified contacts.
  → *Mitigation*: Enforce a strict filter in `campaignService` requiring `marketingOptIn === true` and valid 10-digit mobile before including any contact in audience counts.
- **[Risk] Performance with Large CSV Uploads**: In-browser parsing of 10,000+ customer records may freeze UI thread.
  → *Mitigation*: Implement chunked processing and batch preview (first 50 records) with total tally validation.

## Migration Plan

1. **Phase 1 Prototype**: Run entirely in client-side mock mode (`VITE_USE_MOCKS=true`) with seed data for demonstration and usability review.
2. **Backend API Readiness**: Backend team delivers endpoints matching provisional contracts (`/api/branches`, `/api/chats`, `/api/leads`, `/api/customers`, `/api/campaigns`, `/api/reports`).
3. **Cutover**: Toggle `VITE_USE_MOCKS=false` and configure `VITE_API_BASE_URL` in `.env`. Validate authentication, CSRF tokens, and live pagination.

## Open Questions

- Final confirmed branch names, street addresses, and operating hours for branches B2, B3, and B4.
- Selection of WhatsApp Business Solution Provider (BSP) for backend webhook configuration.
- Client approval on final brand assets and approved FAQ knowledge base text.
