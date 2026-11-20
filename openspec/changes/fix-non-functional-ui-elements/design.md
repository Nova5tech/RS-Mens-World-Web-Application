# Design

## Context

The RS Mens World frontend application has implemented the visual design for all Customer Engagement pages (AI Chatbot, Lead Generation, Customers, WhatsApp Campaigns). However, several interactive controls are decorative or fail to trigger expected behaviors due to missing click handlers, lack of state management for drawers/modals, or disconnected mock storage calls. See `proposal.md` for motivation.

## Goals / Non-Goals

**Goals:**
- Implement the 5 marked AI Chatbot interactive controls: TopBar user profile dropdown, Conversation Info drawer, Expand conversation modal, 3-dot contextual action menu, and Follow-up date picker in Lead Details.
- Ensure all visible buttons, dropdowns, switches, modals, and drawers across the 4 Customer Engagement modules respond predictably with state updates, toast notifications, and mock service persistence.
- Maintain reactive cross-module data flow: Chatbot lead capture → Lead Generation pipeline, Lead follow-up rescheduling → Lead service, and Branch toggles → WhatsApp campaign audience calculation.
- Maintain strict backward compatibility and preserve all completed Retail ERP code (POS, Inventory, Accounting, Stock Transfers, Returns).
- Produce a structured audit report in `docs/CUSTOMER_ENGAGEMENT_INTERACTION_AUDIT.md`.

**Non-Goals:**
- Visual redesigns or altering approved Mint Green (`#A8F0D0` / `#48d597`) + Deep Teal (`#004F4C` / `#062b24`) themes.
- Developing live backend servers, live database connections, real WhatsApp Cloud API dispatches, or third-party telephony integrations (all remain in simulated/mock mode).
- Modifying Retail ERP module logic or interfaces.

## Decisions

### 1. TopBar Profile Avatar Dropdown Architecture
- **Decision**: Add an accessible dropdown menu directly in `TopBar.jsx` controlled by `isProfileMenuOpen` state, with an `useEffect` document listener for outside clicks and Escape key dismissals.
- **Rationale**: Keeps the profile menu accessible from all pages across the platform without altering the header's outer styling.
- **Actions**: Profile (opens a lightweight user profile details modal with role, branch, and contact email), Settings (routes to `/settings`), and Sign Out (invokes `logout()` from `AuthContext` and redirects to `/login`).

### 2. Conversation Info & Expand Modals in StaffChatInbox
- **Decision**: Introduce dedicated modal/drawer subcomponents: `ConversationInfoDrawer.jsx` and `ConversationExpandModal.jsx` in `src/components/chat/`.
- **Rationale**: Isolates drawer and modal state from the complex message stream in `StaffChatInbox.jsx`, preventing re-render slowdowns and maintaining clean component responsibilities.
- **Fallback**: Gracefully handle missing customer fields (e.g. unknown email or branch) using fallbacks.

### 3. Contextual 3-Dot Conversation Menu
- **Decision**: Implement an inline action popover in `StaffChatInbox.jsx` triggered by the three-dots button.
- **Rationale**: Allows immediate status transitions (*Resolve*, *Reopen*, *Request Handover*) and triggers lead creation directly from chat context while automatically refreshing conversation list filters.

### 4. Native & Styled Follow-up Date Picker in Lead Details
- **Decision**: Use a styled wrapper around standard `<input type="date">` with an explicit calendar button trigger, combined with immediate persistence through `leadService.updateLead(lead.id, { followUpDate })`.
- **Rationale**: Native date inputs provide seamless accessibility, cross-browser compatibility, and zero extra bundle dependencies while ensuring date formatting is localized and timezone-safe.
- **Guard**: If a conversation has no linked lead, prompt the user to "Create Lead First" via a modal rather than silently failing.

### 5. Shared Mock Storage Synchronization
- **Decision**: Rely on `src/mocks/mockStorage.js` as the single source of truth for in-memory and local storage data across all 4 modules.
- **Rationale**: Guarantees that actions taken in one screen (e.g. creating a lead in Chatbot) immediately reflect when navigating to another screen (e.g. Lead Generation Kanban).

## Risks / Trade-offs

- **[Risk] State desynchronization between Chatbot and Leads**: Creating a lead in Chatbot may not immediately update if the Leads page has cached static initial state.
  - *Mitigation*: Ensure `leadService.createLead` writes to `mockStorage`, and `LeadsPage.jsx` fetches fresh data on mount and branch change.
- **[Risk] Modal clipping / z-index conflicts**: Drawers or date pickers could be hidden under fixed headers or sidebar containers.
  - *Mitigation*: Use appropriate Tailwind z-index classes (`z-50`, `fixed inset-0`) and modal backdrops with pointer-events protection.
- **[Risk] Unintentional edits to Retail ERP modules**:
  - *Mitigation*: Limit file edits strictly to shared layout components (`TopBar.jsx`), Customer Engagement components, and documentation.
