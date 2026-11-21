# RS Mens World — Customer Engagement Platform (Frontend)

Enterprise Customer Engagement Platform (CEP) for RS Mens World — multi-branch premium retail menswear chain across Andhra Pradesh (Rajahmundry Main, Kakinada, Vijayawada, Guntur).

Contracted SOW Scope:
- **AI Chatbot**: Grounded retail assistant with zero inventory hallucination, website embed widget, and human handover mode.
- **AI Lead Generation**: 5-stage interactive drag-and-drop Kanban pipeline & table with automated intent classification.
- **WhatsApp Campaigns**: Multi-branch broadcast marketing with independent per-branch ON/OFF toggles and quiet hours compliance.
- **Customer Database**: Unified customer database with 5-step Petpooja POS Excel/CSV importer, phone validation, and consent management.
- **Operations & Engagement Dashboard & Reports**: Real-time KPI tracking, Recharts analytics, and UTF-8 BOM CSV export for Excel.
- **Users & Branches**: Super Admin multi-branch control and strict branch-isolated staff accounts.
- **Settings & Audit Trail**: Business profile, Meta Cloud API status, and tamper-evident security audit logs.

---

## 1. Quick Start & Setup

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd "RS MENS WORLS claude"

# Install dependencies
npm install

# Start local development server
npm run dev
```
The application will launch at `http://localhost:5173/` (or the next available port).

---

## 2. Environment Variables

Create a `.env` file in the root directory (refer to `.env.example` if present):

| Variable | Type | Default | Description |
|---|---|---|---|
| `VITE_USE_MOCKS` | `boolean` | `true` | When `true`, uses persistent localStorage mock adapters. Set `false` to connect to real backend API. |
| `VITE_API_BASE_URL` | `string` | `https://api.rsmensworld.com/api/v1` | Base URL for REST API endpoints when `VITE_USE_MOCKS=false`. |
| `VITE_SHOW_DEMO_LOGINS` | `boolean` | `true` | Controls display of one-click demo credentials beneath login card. |

---

## 3. Demo Accounts & Logins

The application supports both Head Office Super Admin and Branch Staff PIN logins:

### Head Office (Super Admin)
- **Role**: `super_admin` (All branches, all settings, content library, user management, global reports)
- **Email**: `admin@rsmensworld.com`
- **Password**: `Admin@123`

### Retail Branch Logins (Branch Users)
- **Role**: `branch_user` (Strictly scoped to their designated branch data)
- **Branch 1 (Rajahmundry Main)**: Select `Branch 1` • PIN: `1111`
- **Branch 2 (Kakinada)**: Select `Branch 2` • PIN: `2222`
- **Branch 3 (Vijayawada)**: Select `Branch 3` • PIN: `3333`
- **Branch 4 (Guntur)**: Select `Branch 4` • PIN: `4444`

---

## 4. Architecture & Folder Structure

```
src/
├── app/                  Router with lazy loading, providers, ProtectedRoute
├── layouts/              AppShell, Sidebar, Topbar (with notifications & help), WebsiteChatButton
├── components/ui/        Reusable design system components (Button, Pill, Card, Drawer, Modal)
├── features/
│   ├── auth/             LoginPage, useAuth, AuthContext
│   ├── dashboard/        DashboardPage (KPIs, Recharts funnel, branch comparison)
│   ├── customers/        CustomersPage, CustomerDrawer, AddEditCustomerDrawer, ImportWizard
│   ├── leads/            LeadsPage, KanbanBoard, LeadTable, LeadDetailsDrawer, AddLeadDrawer
│   ├── campaigns/        CampaignsPage, CampaignWizard, CampaignReportModal
│   ├── chatbot/          ChatbotPage, ConversationList, ChatArea, KnowledgeBaseModal, WebsiteChatWidget
│   ├── content/          ContentLibraryPage (Media Assets, Message Templates, Audience Segments)
│   ├── reports/          ReportsPage (Campaign, Customer, Lead, Chat reports + CSV export)
│   ├── users/            UsersBranchesPage (Branches & Users tables, Add/Edit drawers)
│   └── settings/         SettingsPage, AuditLogPage
├── services/             ONLY data gateway for screens (customers.ts, leads.ts, campaigns.ts, etc.)
├── mocks/                Mock data seeds & MockStorage adapters with 300ms network delay simulation
├── lib/                  apiClient.ts (Axios), phone.ts (+91/E.164), format.ts, utils.ts
└── types/                models.ts (TypeScript interface contracts matching backend)
docs/
├── API_CONTRACT.md       Handover specification for the backend engineering team
├── BUILD_SPEC.md         Master engineering specification and loop requirements
├── BUILD_LOG.md          Chronological build history, decisions, and self-checks
└── TEST_CHECKLIST.md     Complete manual and automated test criteria checklist
widget/                   Standalone embeddable website chat widget bundle
```

---

## 5. How to Switch from Mock Data to Real Backend API

Every screen and feature in this application communicates exclusively through services (`src/services/*`).
No component accesses mock data directly.

1. Configure `.env`:
   ```ini
   VITE_USE_MOCKS=false
   VITE_API_BASE_URL=https://api.yourdomain.com/api/v1
   ```
2. Each service file (`src/services/customers.ts`, `src/services/leads.ts`, etc.) contains an environment flag:
   ```ts
   export const isUsingMocks = import.meta.env.VITE_USE_MOCKS !== 'false';
   ```
3. When `isUsingMocks === false`, requests automatically route through `apiClient` (`src/lib/apiClient.ts`), which automatically attaches the `Authorization: Bearer <token>` header and handles 401 unauthenticated redirects.
4. All endpoint paths, query parameters, payloads, and response envelopes adhere to `docs/API_CONTRACT.md`.

---

## 6. Standalone Website Chat Widget Embed

To embed the RS Mens World customer assistance widget into any external eCommerce or landing page:

```html
<!-- Include the widget script tag before </body> -->
<script
  src="https://cdn.rsmensworld.com/widget/rs-chat.js"
  data-api="https://api.rsmensworld.com/api/v1"
  data-branch="branch_1"
  data-brand-color="#0F4C3A"
  defer
></script>
```

Refer to `widget/README.md` for full widget configuration options (welcome message, pre-chat form fields, WhatsApp opt-in checkbox).

---

## 7. Available Scripts

- `npm run dev`: Start local Vite development server
- `npm run build`: Type-check with `tsc` and create production bundle in `dist/`
- `npm run preview`: Preview production build locally
- `npm run lint`: Run ESLint checks
