# Design

## Context

The RS Mens World Lead Generation page (`src/pages/LeadsPage.jsx`) provides both Kanban and Table views with an approved Mint Green + Deep Teal aesthetic. While the core data flows through `src/services/leadService.js` and `src/mocks/mockStorage.js`, the Filters action currently triggers only an informational toast rather than a filter panel, Kanban stage header clicks lack clear focus behavior, and the follow-up date picker in the details panel requires hardened accessibility and reactive card propagation. See `proposal.md` for motivation.

## Goals / Non-Goals

**Goals:**
- Provide a functional, accessible filter popover/drawer for Lead Generation with Branch, Stage, Priority, and Source criteria.
- Support "Apply Filters", "Clear Filters", "Close", and active filter chip indicators.
- Enable stage focus toggling from Kanban column headers with visible active highlights and an easy reset mechanism.
- Ensure stage counts in column headers are computed dynamically from live filtered data.
- Harden the follow-up date picker in `LeadDetailsPanel.jsx` with direct calendar selection, `leadService` persistence, and instant card reflection.
- Ensure zero loss of filter criteria or selected lead state when switching between Kanban and Table views.
- Provide clean empty states when filter combinations yield zero records.

**Non-Goals:**
- Altering the approved visual layout, typography, or Mint Green (`#A8F0D0`) + Deep Teal (`#004F4C`) color palette.
- Renaming or mutating underlying API stages in ways that break backward compatibility.
- Modifying backend server logic or external CRM integrations.
- Editing Retail ERP or other Customer Engagement screens.

## Decisions

### 1. Dedicated Filter Popover/Drawer (`LeadFiltersDrawer.jsx` or Popover in `LeadsPage.jsx`)
- **Decision**: Implement a sleek filter popover/drawer anchored to the "Filters" button, containing:
  - Branch Selector (All Branches, Branch 1 Anna Nagar, Branch 2 T. Nagar, Branch 3 Velachery, Branch 4 Adyar)
  - Lead Stage Selector (All, New, In Progress, Follow-up, Converted, Lost)
  - Priority Selector (All, High, Medium, Low)
  - Source Selector (All, WhatsApp / AI Chat, Walk-in, Website, Phone Enquiry)
- **Rationale**: Keeps filter state cleanly consolidated, avoids layout shifts, and matches the design standards established across the application.
- **Alternatives Considered**: Direct inline toolbar dropdowns (crowds the header bar on mobile/tablet screens).

### 2. Kanban Stage Header Behavior and PRD Stage Mapping
- **Decision**: Retain the 4 approved columns (*New*, *In Progress*, *Follow-up*, *Converted*). Stage counts are dynamically computed from active filtered records. Clicking a stage header toggles a focused view for that stage across the board, with an active ring indicator and a "Reset Stage Focus" badge.
- **Stage Mapping**:
  - The PRD lists: `New`, `Contacted`, `Qualified`, `Follow-up`, `Converted`, `Lost`.
  - The UI columns display: `New`, `In Progress`, `Follow-up`, `Converted`.
  - Stored records with `Contacted` and `Qualified` map visually to the `In Progress` column, preserving data integrity and existing API contracts without altering stored values.

### 3. Follow-up Date Picker Reliability
- **Decision**: In `LeadDetailsPanel.jsx`, provide an explicit calendar trigger button paired with an accessible native `<input type="date">` that reliably opens the OS date picker via `showPicker()` API (with standard overlay fallback). Immediately persists changes via `leadService.updateLead(lead.id, { followUpDate, followUpDateFormatted })`.
- **Rationale**: Ensures cross-browser compatibility on Windows, macOS, Android, and iOS while preventing pointer-event capture or overflow clipping issues.

### 4. Cross-View State Synchronization
- **Decision**: Maintain all filter parameters (`searchTerm`, `branchFilter`, `stageFilter`, `priorityFilter`, `sourceFilter`, `focusedStage`) in `LeadsPage.jsx`. Compute a single memoized `filteredLeads` list that feeds both `LeadKanbanBoard` and `LeadTableView`.
- **Rationale**: Guarantees identical records and seamless transitions between Kanban and Table views.

## Risks / Trade-offs

- **[Risk] Strict filtering producing zero matches**:
  - *Mitigation*: Render an attractive empty state ("No leads match the selected filters") with a one-click "Reset All Filters" button.
- **[Risk] Selected lead disappearing if filtered out**:
  - *Mitigation*: If the active `selectedLead` no longer passes the active filters, automatically select the first matching lead or close the panel cleanly without runtime errors.
- **[Risk] Date timezone offsets when selecting dates**:
  - *Mitigation*: Parse dates using explicit UTC or localized split components (`YYYY-MM-DD`) to avoid off-by-one date shifts across time zones.
