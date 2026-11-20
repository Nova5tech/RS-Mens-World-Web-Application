# Tasks: Fix Customer Database Branch-Wise Access & Interactive Controls

## 1. Strict Authenticated Branch Access in CustomersPage

- [x] 1.1 Update `src/pages/CustomersPage.jsx` to read authenticated user role and assigned branch ID from `useAuth()`.
- [x] 1.2 Implement strict branch scoping for branch users: filter `customerList` to match `currentUser.assignedBranchId` or assigned branch name, excluding customers belonging to other branches.
- [x] 1.3 Hide the `Branch: All` option for branch users and render a read-only store pill/badge displaying their assigned store (e.g., `Rajahmandary Main Branch`).
- [x] 1.4 Retain full `All Branches` and multi-store dropdown options for Super Admin.

## 2. Dynamic Customer Status Tabs & Accurate Counts

- [x] 2.1 Wire the `All Customers`, `New`, `Active`, and `Inactive` status tabs to reactively filter visible customer rows.
- [x] 2.2 Calculate dynamic counts for each tab from the branch-authorized customer dataset rather than using static hardcoded numbers.
- [x] 2.3 Ensure customers with `status === 'New'`, `status === 'Active'`, and `status === 'Inactive'` filter correctly.

## 3. Customer Row Three-Dot Contextual Action Menu

- [x] 3.1 Implement an accessible floating context menu on clicking the `MoreVertical` three-dot button in each table row.
- [x] 3.2 Add `View Details` action that selects the customer and opens the docked Customer Details panel.
- [x] 3.3 Add `Edit Customer` action that opens `AddCustomerModal` in edit mode with prefilled values.
- [x] 3.4 Add `Toggle Status` action that switches customer status between `Active` and `Inactive` with toast notification and immediate table update.
- [x] 3.5 Implement click-outside and Escape key dismissal with proper event isolation.

## 4. Verification, Testing & Build Validation

- [x] 4.1 Run `npm.cmd run build` to verify 0 compilation or bundling errors.
- [x] 4.2 Test Branch 1 User login and verify only Rajahmandary Main Branch customers are visible.
- [x] 4.3 Test status tabs filtering (`All Customers`, `New`, `Active`, `Inactive`) and count accuracy.
- [x] 4.4 Test the three-dot action menu for multiple customers (View Details, Edit, Change Status).
- [x] 4.5 Test Super Admin login and verify All Branches access.
