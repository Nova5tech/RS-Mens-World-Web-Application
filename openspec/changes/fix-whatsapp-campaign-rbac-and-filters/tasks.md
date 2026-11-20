# Tasks: Fix WhatsApp Campaigns Role-Based Access and Functionality

## 1. Branch-Based Campaign Access & Data Scoping
- [x] 1.1 Connect `useAuth()` in `src/pages/CampaignsPage.jsx` to access authenticated user role and assigned branch ID.
- [x] 1.2 Implement branch scoping for branch users: filter `campaigns` to only include campaigns targeting `currentUser.assignedBranchId` (e.g., `B1`), excluding campaigns that only target other branches.
- [x] 1.3 Calculate branch-specific audience counts and metrics for branch users (never show combined multi-branch audience totals to a branch user).
- [x] 1.4 Derive dynamic KPI statistics (Top 5 cards and Status tabs) strictly from the branch-authorized campaigns.

## 2. Branch Filter Dropdown RBAC
- [x] 2.1 Replace the `Branch: All` dropdown with a locked, read-only store badge (`Rajahmandary Main Branch`) for Branch Users.
- [x] 2.2 Preserve the interactive branch dropdown with `All Branches` and all 4 individual store branches for Super Admin.

## 3. Filters Button & Filter Drawer
- [x] 3.1 Implement a functional filter popover/drawer triggered by clicking the `Filters` button (`src/components/campaigns/CampaignFiltersDrawer.jsx`).
- [x] 3.2 Add filter options for Campaign Status, Campaign Type, Date Range, Message Template, and (Admin-only) Store Branch.
- [x] 3.3 Add `Apply Filters`, `Clear Filters`, and `Close` actions with click-outside and Escape key dismissal.
- [x] 3.4 Display active filter count indicator on the `Filters` button when filters are engaged.
- [x] 3.5 Ensure filters reactively update visible campaigns and handle empty results gracefully.

## 4. Role-Based Right Panel (Admin Builder vs. Branch User Details)
- [x] 4.1 Hide campaign creation panel, "+ New Campaign" button, editable inputs, image uploads, template pickers, branch ON/OFF switches, and schedule/send buttons for Branch Users.
- [x] 4.2 Render a read-only `Campaign Details` panel for Branch Users displaying the selected campaign's name, type, status, assigned store, branch-specific audience, delivery stats, message preview, and test message preview button.
- [x] 4.3 Preserve full 4-step `Create WhatsApp Campaign` wizard for Super Admin with independent branch toggles, live audience calculation, mock image upload, template selection, and simulated launch/schedule.

## 5. Verification & Testing
- [x] 5.1 Run `@babel/parser` AST check across all source files to verify syntax integrity.
- [x] 5.2 Execute automated test script verifying Branch 1 User scoping, audience isolation, and Admin privileges.
- [x] 5.3 Run `npm.cmd run build` to confirm clean production build with 0 errors.
