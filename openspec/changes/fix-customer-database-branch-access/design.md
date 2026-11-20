# Design: Fix Customer Database Branch-Wise Access & Interactive Controls

## 1. Architectural Overview & Data Flow

```
   [ Authenticated Session ]
       |
       +--> Super Admin (role: 'admin', assignedBranchId: null)
       |        |
       |        +--> Can view 'ALL' or filter B1, B2, B3, B4
       |        +--> Branch selector displays "Branch: All" + 4 Stores
       |        +--> Tab counts reflect global or selected branch
       |
       +--> Branch User (role: 'branch_user', assignedBranchId: 'B1' | 'B2' | 'B3' | 'B4')
                |
                +--> Hard filter on c.branchId === currentUser.assignedBranchId
                |    (or c.branch === 'Branch 1')
                +--> Branch selector is locked / read-only: "Rajahmandary Main Branch"
                +--> Status tabs calculate counts ONLY from assigned branch
                +--> Action menus & details panel restricted to assigned branch
```

## 2. Customer Visibility & Filter Pipeline

The customer filtering pipeline executes in the following sequence:

1. **Branch Authorization Boundary**:
   - If `isBranchUser`: customer MUST belong to `currentUser.assignedBranchId` (`B1`, `B2`, `B3`, or `B4`) or matching `branch` string (`Branch 1`, `Branch 2`, etc.).
   - If `isAdmin`: customer filtered by `branchFilter` (`ALL` or specific branch ID/label).
2. **Customer Status Tab**:
   - `ALL`: No status filter.
   - `NEW`: Customer `status === 'New'` or `customerType === 'New'` or joined within the last 90 days.
   - `ACTIVE`: Customer `status === 'Active'`.
   - `INACTIVE`: Customer `status === 'Inactive'`.
3. **Search Query**:
   - Case-insensitive substring match across customer `name`, `phone`, `email`, and `id`.
4. **Consent Filter**:
   - `ALL`: Both opted-in and suppressed.
   - `YES`: `consent === true` / `marketingOptIn === true`.
   - `NO`: `consent === false` / `marketingOptIn === false`.
5. **Customer Type Filter**:
   - `ALL` | `Regular` | `VIP` | `Repeat`.

## 3. Dynamic Customer Counts Calculation

Instead of hardcoded strings in the tab labels:
```javascript
const permittedCustomers = customerList.filter(c => {
  if (isBranchUser) {
    const assignedId = currentUser?.assignedBranchId;
    return c.branchId === assignedId || c.branch === `Branch ${assignedId?.replace('B', '')}` || c.branchDetail?.includes(assignedBranchName);
  }
  if (branchFilter !== 'ALL') {
    return c.branchId === branchFilter || c.branch === branchFilter || c.branchDetail?.includes(branchFilter);
  }
  return true;
});

const countAll = permittedCustomers.length;
const countNew = permittedCustomers.filter(c => c.status === 'New' || c.customerType === 'New').length;
const countActive = permittedCustomers.filter(c => c.status === 'Active').length;
const countInactive = permittedCustomers.filter(c => c.status === 'Inactive').length;
```

## 4. Customer Row Action Menu Specification

- **Trigger Button**:
  - `p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer`
  - Position: Right-most table column (`w-10`).
- **Contextual Menu**:
  - `absolute right-2 top-8 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-40 text-xs text-slate-700`
  - Items:
    1. **View Details**: `Eye` icon • opens right docked panel and selects customer.
    2. **Edit Customer**: `Edit3` icon • opens `AddCustomerModal` in edit mode with prefilled values.
    3. **Change Status**: `PauseCircle` / `CheckCircle2` • toggles customer between `Active` and `Inactive`.
- **Keyboard & Click-Outside Handling**:
  - `activeActionMenuId` tracks which customer row has the menu open.
  - Clicking outside or pressing Escape sets `activeActionMenuId(null)`.
