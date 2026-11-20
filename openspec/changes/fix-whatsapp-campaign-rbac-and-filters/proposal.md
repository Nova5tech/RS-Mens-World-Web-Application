# OpenSpec Proposal: Fix WhatsApp Campaigns Role-Based Access and Functionality

## Problem Statement
When logged in as a Branch User (e.g., Branch 1 User for Rajahmandary Main Branch):
1. **Branch Scoping Leakage**: Campaigns not targeting Branch 1 (such as campaigns targeting B2 & B4 only) appear in the table.
2. **Multi-Branch Aggregated Audiences**: The Branch User sees cross-branch audience totals (e.g., 8,420 combined patrons across 4 stores) rather than branch-specific audience metrics.
3. **Branch Filter Selector**: Displays "Branch: All" and permits selecting other branches, violating data segregation.
4. **Unauthorized Campaign Builder Access**: The right column displays the full "Create WhatsApp Campaign" wizard with editable forms, image uploads, template controls, and branch ON/OFF toggles.
5. **Non-Functional Filters Button**: Clicking the "Filters" button does not open a filter drawer/popover.

## Goals & Objectives
1. **Strict Branch Scoping for Branch Users**:
   - Filter visible campaigns to only those targeting `currentUser.assignedBranchId` (e.g., `B1`).
   - If a campaign targets multiple branches (e.g., B1, B2, B3), show only the B1-specific audience and delivery metrics to the B1 user.
   - Replace the branch dropdown filter with a locked, read-only store pill (`Rajahmandary Main Branch`) for branch users.
2. **Super Admin Campaign Management**:
   - Super Admin retains full cross-branch visibility, "All Branches" dropdown filter, branch-level filtering, and full access to the 4-step campaign creation wizard.
   - Super Admin can independently toggle each of the 4 branches ON/OFF, recalculating eligible audiences dynamically.
   - Super Admin can upload/preview mock campaign images, select templates, and save drafts or schedule/broadcast.
3. **Branch User Read-Only Campaign Details**:
   - For branch users, remove all campaign creation buttons, editable forms, image uploads, template editors, and branch ON/OFF switches.
   - Render a read-only **Campaign Details** panel showing campaign name, type badge, status, assigned branch, branch-specific audience, delivery summary, date, and WhatsApp message preview.
4. **Interactive Filters Drawer**:
   - Clicking the "Filters" button opens a dedicated popover/drawer supporting:
     - Campaign Status (All, Sent, Scheduled, Draft)
     - Campaign Type (All, Promotional, Announcement, Loyalty, Event, Engagement)
     - Date Range (All, Today, This Week, This Month, Last 30 Days)
     - Message Template (All + templates)
     - Branch (Super Admin only)
   - Apply Filters, Clear Filters, Close, active filter count badge, and clean empty results state.
5. **Dynamic Top Stats**:
   - Derived reactively based on branch-authorized campaigns (Branch 1 stats for Branch 1 user, consolidated stats for Super Admin).
