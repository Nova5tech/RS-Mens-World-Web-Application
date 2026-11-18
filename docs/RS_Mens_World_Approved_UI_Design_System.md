# RS Mens World — Approved UI/UX Design System Specification

**Status:** Approved Authority (Supersedes previous Navy/Cognac/Bodoni guidelines)  
**Version:** 2.0 (Phase 1 Master Design System)  
**Date:** November 2026  
**Primary Brand Identity:** Deep Teal & Mint Green Multi-Branch Customer Engagement Platform  

---

## 1. Executive Summary & Design System Resolution

The original `RS_Mens_World_UIUX_Design_Specification.docx` document specified an atelier-inspired aesthetic based on Deep Navy (`#141b2d`), Warm Cognac (`#9c5a24`), and serif display typography (Bodoni Moda / Playfair Display).

As confirmed and authorized by executive leadership through approved visual reference screenshots, **that visual direction is formally superseded by the Mint Green + Teal Blue Master Design System**.

All functional specifications, accessibility mandates, DPDP Act 2023 consent rules, role-based access controls, and multi-branch isolation requirements from the original PRD and Technical Specification remain in full force. This document serves as the single source of truth for the visual hierarchy, layout architecture, and styling rules across the entire RS Mens World application.

---

## 2. Master Color Tokens & Palette Architecture

| Token Name | Hex Code | Tailwind / CSS Variable | Primary Applications |
|---|---|---|---|
| **Deep Forest Teal** | `#004F4C` / `#062b24` | `deepTeal.DEFAULT` / `bg-[#004F4C]` | Sidebar background, primary brand headers, active tab pills, dark CTA buttons |
| **Deep Teal Hover** | `#003d3a` / `#083b32` | `deepTeal.hover` | Hover states on primary teal buttons and active sidebar items |
| **Primary Teal** | `#008C83` / `#0f766e` | `primaryTeal.DEFAULT` | Secondary action buttons, active icons, focus rings, progress bars |
| **Mint Green Active** | `#A8F0D0` / `#48d597` | `mintGreen.DEFAULT` / `mintGreen.active` | Active navigation pills, checkmark badges, live online indicators, status highlights |
| **Mint Tint Surface** | `#e6f7f2` / `#eefaf6` | `mintGreen.bg` | Table status pills (`Regular`), purchase summary card background, import button background |
| **Pearl Off-White** | `#F5FAFA` / `#f0f7f5` | `bgOffWhite.DEFAULT` | Application viewport background, layout frame |
| **Pure White** | `#FFFFFF` | `white` | Data tables, cards, floating modals, slide-over panels |
| **Primary Crisp Text** | `#102333` | `primaryText` / `text-[#102333]` | High-contrast body text, customer names, numerical metrics |
| **Secondary Slate Text** | `#526878` | `secondaryText` / `text-[#526878]` | Subtitles, meta-tags, field labels, timestamps |
| **Hairline Border** | `#D9E9E8` / `#e2e8f0` | `borderTeal.DEFAULT` | Table row dividers, card borders, search & dropdown input outlines |

### Semantic Status Badges
- **Active / Consented / Regular**: Mint green surface `#e6f7f2`, dark teal/emerald text `#008C83` or `#065f46`, border `#A8F0D0`.
- **VIP Customer**: Warm champagne amber surface `#fffbeb`, dark amber text `#b45309`, border `#fde68a`.
- **Repeat Customer**: Soft icy blue surface `#eff6ff`, royal blue text `#1d4ed8`, border `#bfdbfe`.
- **Inactive / Non-Consented**: Soft rose/gray surface `#fef2f2`, dark crimson text `#b91c1c`, border `#fecaca`.

---

## 3. Typography Standards

- **Primary Font Family**: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `'Segoe UI'`, `Roboto`, `sans-serif`.
- **Secondary Display Family**: `Plus Jakarta Sans`, `sans-serif` (for high-impact brand headlines).
- **Tabular & Code Family**: `ui-monospace`, `SFMono-Regular`, `Menlo`, `Monaco`, `Consolas`, `monospace`.
- **Typographic Rules**:
  - Elimination of all serif display fonts (Bodoni Moda, Playfair Display) across headers.
  - Page titles: `text-xl` to `text-2xl` (`20px–24px`), font-extrabold (`font-extrabold`), tracking tight (`tracking-tight`), text `#102333`.
  - Section subtitles: `text-xs` (`12px`), font-normal, text `#526878`.
  - Table headers: `text-[11px]`, font-semibold, uppercase, tracking-wider, text `#526878`.
  - Table cell content: `text-xs` (`12px`), font-medium, text `#102333`.
  - Detail labels: `text-[11px]`, font-semibold, text `#526878`.

---

## 4. Layout Architecture & Dimensions

### 4.1. Desktop Layout (1440px Viewport)
- **Sidebar**:
  - Fixed width: `w-64` (`256px`).
  - Background: `#062b24` (Deep Forest Teal).
  - Brand header: RS Mens World coat hanger logo in `#48d597` (Mint Green).
  - Branch Selector: `Head Office` dropdown in `#083b32` with `#0d453b` border.
  - Nav sections: `OVERVIEW`, `CUSTOMER ENGAGEMENT`, `INSIGHTS`, `ADMINISTRATION`.
  - Active navigation state: Rounded-xl pill in solid Mint Green (`bg-[#48d597]` or `#A8F0D0`) with dark forest teal text (`text-[#062b24]`) and bold font weight.
  - User footer: Fixed bottom user profile card (`Super Admin`, `Head Office`) with logout action.
- **Top Header Bar**:
  - Height: `h-18` to `h-20` (`72px–80px`).
  - Background: Transparent / `#F5FAFA`.
  - Left: Dynamic page title and descriptive subtitle.
  - Right: Store context dropdown (`All Branches`), Date period selector (`This Month`), Notification bell with red badge dot, Help icon (`?`), and user circle avatar (`B`).
- **Main Content Area**:
  - Background: `#F5FAFA` (Soft pearl off-white).
  - Padding: `p-6 lg:p-8`.
  - Max width: `max-w-7xl` (`1280px`) or full-width fluid grid where detail panels are docked.

### 4.2. Tablet & Mobile Layouts (768px & 390px)
- Sidebar collapses into an animated slide-over drawer triggered by the hamburger menu icon in the top header.
- Multi-column tables retain horizontal scroll (`overflow-x-auto`) with fixed column padding.
- Right-side detail panels switch from docked inline columns to slide-over drawers or bottom sheets.

---

## 5. Page-Specific Layout Guidelines

### 5.1. Login Page (`/login`) — Reference Screenshot 1
- **Background**: Dark forest teal `#07352d` with decorative mint geometric waves at the bottom.
- **Left Column**: Brand coat hanger logo, "RS Mens World", subtitle "MULTI-BRANCH RETAIL & CUSTOMER ENGAGEMENT", 4 feature badges (AI Chatbot, Lead Generation, WhatsApp Campaigns, Reports & Insights), and trust markers.
- **Right Column**: Floating `rounded-3xl` pure white card (`#FFFFFF`) with shadow.
  - 2-column Account Selector: Super Admin + 4 branch accounts with crown / store icons, hover states, and green checkmark.
  - PIN / Password input with visibility eye toggle.
  - Primary button: Deep teal `#004F4C` / `#064e43` with white text and `Sign In` icon.
  - Prototype demo credential hint box.

### 5.2. Head Office Dashboard (`/`) — Reference Screenshot 2
- **5 Top Metric Cards**: `Total Leads`, `New Enquiries`, `Follow-ups Due`, `Converted Leads`, `Campaign Reach` with percentage badges.
- **Lead Activity Trend**: Stacked bar chart showing daily/weekly inquiry trends and conversion ratios.
- **Branch-wise Leads Distribution**: Horizontal progress bars benchmarked across all 4 store locations.
- **Recent Lead Activity**: Compact table with customer name, source, branch pill, stage badge, and timestamp.
- **2x2 Quick Actions Grid**: Direct shortcuts for Create Lead, Petpooja Import, WhatsApp Broadcast, and Export Reports.

### 5.3. Lead Generation (`/leads`) — Reference Screenshot 3
- **Header**: Title "Lead Generation", subtitle "Track and manage potential customers".
- **View Toggle**: `Kanban` vs. `Table` segmented toggle button.
- **Kanban Board**: 4 visual columns:
  - `New (12)`: Soft blue column header pill.
  - `In Progress (8)`: Soft amber/yellow column header pill.
  - `Follow-up (5)`: Soft peach/orange column header pill.
  - `Converted (4)`: Soft emerald/mint column header pill.
- **Lead Card**: White card with customer name, enquiry text, branch tag, elapsed time pill, and stage badge.
- **Docked Right Lead Details Panel**:
  - Customer name, ID (`L-3816`), stage pill.
  - Phone, preferred branch, interest tags.
  - Lead stage dropdown selector.
  - Notes field with latest follow-up context.
  - Actions: `Send WhatsApp` (`bg-[#004F4C] text-white`), `Edit Lead` (white outline), `Mark as Converted` (white outline).

### 5.4. Customer Database (`/customers`) — Reference Screenshot 4 (Latest Authority)
- **Header**: Title "Customer Database", subtitle "Manage customers and import from Petpooja".
- **Status Tabs**:
  - `All Customers (2,486)`: Active deep teal pill `bg-[#004F4C] text-white` with `Users` icon.
  - `+ New (684)`: White outline pill with `PlusCircle` icon.
  - `Active (1,642)`: White outline pill with `CheckCircle2` icon.
  - `Inactive (160)`: White outline pill with `PauseCircle` icon.
- **Right Action Buttons**:
  - `Import (Petpooja)`: Light mint button `bg-[#e6f7f2] text-[#004F4C] border border-[#A8F0D0]` with download/import icon.
  - `+ Add Customer`: Deep teal button `bg-[#004F4C] text-white` with plus icon.
- **Horizontal Filter Bar**:
  - Search input: `Search by name, phone or email...` with magnifying glass.
  - Filter dropdowns: `Branch: All`, `Consent: All`, `Customer Type: All`.
  - Filter button: `Filters` with sliders icon.
- **Dense Customer Table**:
  - Checkbox selection column.
  - Columns: `Customer Name`, `Phone`, `Branch`, `Consent` (Yes/No badge), `Last Interaction`, `Customer Type` (Regular/VIP/Repeat), and 3-dots action menu (`:`).
  - Compact row height (`p-3`), high text density.
  - Row click selects active customer for right panel.
- **Right Customer Details Panel**:
  - Customer name, ID (`C-10248`), status pill (`Active`).
  - Contact details: phone, email, branch assignment, customer classification, member since date.
  - **Purchase Summary Card**: Mint surface `bg-[#eefaf6]`, shopping cart icon, Total Purchases, No. of Orders, and Avg. Order Value.
  - Action buttons: `Send WhatsApp` (`bg-[#004F4C] text-white`), `Edit Customer`, `View Purchase History`.
- **Bottom Pagination Bar**:
  - `Showing 1 – 10 of 2,486 customers`
  - `10 per page` selector
  - Page buttons: `<` `1` (active `#004F4C`) `2` `3` `4` `5` `...` `249` `>`

### 5.5. AI Chatbot (`/chat-inbox`)
- 3-column layout:
  - Left: Conversation list with status filters (`All`, `Open`, `Pending`, `Closed`) and search.
  - Center: Message feed with verified store badge, mint assistant bubbles, customer white bubbles, product recommendation cards.
  - Right: Docked lead details and conversation context summary with `Create Lead` action.

### 5.6. WhatsApp Campaigns (`/campaigns`)
- Metric summary cards: Active broadcasts, messages delivered, read engagement rate.
- Campaign list cards with status pills, branch targeting badges, delivery progress bars, and audience tally.
- 4-step modal wizard: Template & copy, Branch selection, Audience preview (strictly consent filtered), and Schedule.

### 5.7. Reports & Insights (`/reports`)
- Date range filter: `Today`, `Last 7 Days`, `Last 30 Days`, `Financial Year`.
- Metric cards: Conversion rate, total inquiries, consented reach, staff response time.
- Conversion funnel visualization and branch benchmarking.
- One-click CSV export center for Leads, Campaigns, and Consent Audit.

### 5.8. Users, Branches & Settings (`/settings`)
- Sub-navigation tabs: `Store Branches`, `Users & Roles`, `AI Knowledge Base`, `WhatsApp & API Services`.
- 4 configurable store branch cards with status toggle and inline editor.
- Role-based access control table with demo PIN hints.
- Verified AI FAQ knowledge base management.

---

## 6. Business Requirements & Invariants

1. **Four Configurable Branches**: `B1` Rajahmundry (confirmed primary store), `B2` Kakinada, `B3` Vijayawada, `B4` Guntur.
2. **Role-Based Access Control**:
   - Super Admin: Cross-branch oversight, branch selector active, settings access.
   - Branch Staff: Scoped strictly to assigned store location.
3. **Strict Opt-in Consent Gate**: Under DPDP Act 2023, marketing communications and campaign targeting strictly require `marketingOptIn === true`.
4. **Service Layer Separation**: All data interactions route through `src/services/` with mock adapters in `src/mocks/` toggled via `VITE_USE_MOCKS`. Live POS or real WhatsApp API keys are never exposed in browser code.
5. **Phase 1 Scope Discipline**: POS billing, stock transfers, barcode scanning, and accounting ledgers are strictly excluded from Phase 1.
