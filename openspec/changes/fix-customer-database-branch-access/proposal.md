# Proposal: Fix Customer Database Branch-Wise Access & Interactive Controls

## Why

In the RS Mens World customer database module (`/customers`), branch users (e.g. Branch 1 User assigned to Rajahmandary Main Branch) are currently able to view customer records from other branches (Kakinada, Vijayawada, Guntur) because the page initializes with an unbounded `Branch: All` filter and does not enforce authenticated branch boundaries. Furthermore, key user interactions identified in user testing are non-functional:
1. Customer status tabs (`All Customers`, `New`, `Active`, `Inactive`) display hardcoded numbers and do not filter records when clicking `New`.
2. The branch filter dropdown displays `Branch: All` and allows branch users to see and select other stores.
3. The three-dot action button on each customer row lacks an action menu, preventing quick details viewing, editing, or status changing.

To guarantee data segregation, role-based compliance, and operational fluidity, we must enforce strict authenticated branch boundaries, make customer status tabs dynamic and reactive, and activate functional row-level action menus without altering the approved Mint Green + Deep Teal visual hierarchy.

## What Changes

- **Strict Authenticated Branch-Based Access**:
  - Determine user role and assigned branch from `useAuth()` (`currentUser.assignedBranchId`).
  - For **Branch Users** (e.g. Branch 1 User, `B1`):
    - Restrict initial and filtered customer records strictly to their assigned branch (`B1` / `Rajahmandary Main Branch`).
    - Exclude customers belonging to other branches (`B2`, `B3`, `B4`).
    - Hide the `Branch: All` option; lock the branch selector to the assigned store name or display it as a read-only pill.
    - Block attempts to view other branches' customers in the details panel.
  - For **Super Admin**:
    - Retain full access to `All Branches` and individual branches (`Rajahmandary Main Branch`, `Kakinada Branch`, `Vijayawada Branch`, `Guntur Branch`).
- **Dynamic Customer Status Tabs**:
  - Make all 4 status tabs functional: `All Customers`, `New`, `Active`, and `Inactive`.
  - Calculate dynamic customer counts derived strictly from the permitted, branch-scoped dataset (e.g. for Branch 1, counts reflect only Branch 1 customers).
  - Implement explicit filtering for `New` (customers created/joined recently or with status `New`), `Active` (`status === 'Active'`), and `Inactive` (`status === 'Inactive'`).
- **Functional Row-Level Three-Dot Actions Menu**:
  - Clicking the `MoreVertical` button opens a floating context menu for that customer row.
  - Actions supported:
    - **View Details**: Selects the customer and opens the right-docked Customer Details panel.
    - **Edit Customer**: Opens `AddCustomerModal` in edit mode with prefilled data.
    - **Toggle Status**: Changes status between `Active` and `Inactive` with instant feedback.
  - Includes click-outside and Escape key dismissal with proper z-index and event propagation isolation.
- **Service Integration & Data Persistence**:
  - Load and synchronize customers through `customerService.getCustomers()` backed by `mockStorage`.
  - Add/Edit/Status changes persist to `mockStorage` and update the view immediately.

## Capabilities

### New Capabilities
- `customer-branch-access`: Enforces strict branch data isolation for branch users, locking records, dropdowns, and statistics to the authenticated branch.
- `customer-table-interactions`: Implements dynamic status tab filtering and counts, contextual row action menus, and modal edit flows.

## Impact

- **Affected Components**: `src/pages/CustomersPage.jsx`, `src/components/customers/AddCustomerModal.jsx`, `src/services/customerService.js`, `src/mocks/seedData.js`.
- **Zero Regression Scope**: Zero impact or modifications to Retail ERP modules (`/pos`, `/invoices`, `/inventory`, `/transfers`, `/accounting`) and Customer Engagement companions (`/chat-inbox`, `/leads`, `/campaigns`, `/reports`).
