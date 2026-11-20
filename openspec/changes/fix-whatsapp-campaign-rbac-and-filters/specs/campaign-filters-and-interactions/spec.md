# Specification: Campaign Filters & Interactive Controls

## Requirements

### Requirement 1: Filters Popover / Drawer
1. Clicking the `Filters` button in the filter bar SHALL open a modal or popover containing advanced filter controls.
2. The filters SHALL include:
   - Campaign Status (`All`, `Sent`, `Scheduled`, `Draft`)
   - Campaign Type (`All`, `Promotional`, `Announcement`, `Loyalty`, `Event`, `Engagement`)
   - Date Range (`All`, `Today`, `This Week`, `This Month`, `Last 30 Days`)
   - Message Template (`All`, and each template name)
   - Store Branch (visible and selectable for Super Admin only; locked/hidden for Branch Users)
3. The drawer SHALL provide:
   - `Apply Filters` button: commits pending filter choices and updates the table.
   - `Clear Filters` button: resets all advanced filter criteria to default (`All`).
   - `Close` button / click-outside / Escape key: dismisses drawer.
4. When 1 or more advanced filters are active, the `Filters` trigger button SHALL show an active indicator badge (e.g., `Filters (2)`).

### Requirement 2: Status Tabs & Dynamic Statistics
1. The 4 status tabs (`All Campaigns`, `Drafts`, `Scheduled`, `Sent`) SHALL dynamically derive their counts from the branch-authorized dataset.
2. Clicking a tab SHALL filter the campaign table reactively.
3. Top KPI cards (Total Campaigns, Sent, Scheduled, Eligible Audience, Avg. Delivery) SHALL update dynamically based on the branch-authorized data.
4. Table pagination and row selection SHALL operate synchronously on the filtered results.
