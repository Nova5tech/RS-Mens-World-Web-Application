# Proposal: Branch Login UI & Global Branch Names

## Why

The RS Mens World multi-branch retail and customer engagement application requires an exact visual match with the approved Branch Login reference design (`media_1795088943133_750b023d.jpg`) and a centralized, canonical branch configuration across all frontend modules. 

Currently, the login screen displays a multi-card role selector without dedicated Head Office (Admin) vs. Branch Login segmented tabs or an interactive branch dropdown. Furthermore, branch names across different pages, filters, and seed data must be unified under the official store identity:
- **Branch 1** = Rajahmandary Main Branch
- **Branch 2** = Kakinada Branch
- **Branch 3** = Vijayawada Branch
- **Branch 4** = Guntur Branch

This change introduces the exact split-screen authentication experience with responsive tab switching, a custom interactive branch dropdown, strict role-based routing, and a single centralized source of truth for branch configurations across all retail ERP and customer engagement modules.

## What Changes

- **Exact Branch Login Split UI (`LoginPage.jsx`)**:
  - Implement the split-screen layout with dark teal branding on the left (`#003835` / `#004F4C`), boutique store background with dark teal overlay, mint green curved wave ribbons, coat hanger logo, "MULTI-BRANCH RETAIL & CUSTOMER ENGAGEMENT" tagline, and the four feature badges (Branch-wise Access, Leads & Customers, Campaigns, Branch Reports).
  - Implement the floating white card with rounded-3xl corners, featuring segmented tabs for `Head Office (Admin)` (with building icon) and `Branch Login` (with store icon).
  - For Branch Login: provide an interactive custom dropdown displaying the 4 branches with store icons, active mint highlight (`#d1fae5`), and green checkmark; PIN/password input with show/hide toggle; full-width dark teal "Sign In" button; and "← Back to Role Selection" footer.
  - For Head Office (Admin): provide the Super Admin login form, PIN input, and seamless authentication into the all-branch console.
- **Centralized Canonical Branch Configuration (`src/config/branchConfig.js`)**:
  - Establish a single source of truth for branch identities:
    - `B1`: `Rajahmandary Main Branch` (Code: `RJY`, Label: `Branch 1 – Rajahmandary Main Branch`)
    - `B2`: `Kakinada Branch` (Code: `KKD`, Label: `Branch 2 – Kakinada Branch`)
    - `B3`: `Vijayawada Branch` (Code: `BZA`, Label: `Branch 3 – Vijayawada Branch`)
    - `B4`: `Guntur Branch` (Code: `GNT`, Label: `Branch 4 – Guntur Branch`)
  - Expose helper utilities (`getBranchById`, `getBranchDisplayName`, `BRANCH_OPTIONS`).
  - Wire into `branchService.js`, `mockStorage.js`, `seedData.js`, `authService.js`, `BranchContext.jsx`, and all consuming pages/components.
- **Role-Based Authentication & Navigation**:
  - Super Admin (`acc-admin`, PIN `1000`): Full access to all 4 branches, allowed to switch between "All Branches" and individual stores.
  - Branch Users (`acc-b1`–`acc-b4`, PINs `1111`–`4444`): Locked strictly to their assigned branch, unable to switch to "All Branches" or access other stores.
  - Safe data migration for existing `localStorage` keys so demo sessions and cached store names synchronize without data loss or reassigning existing transactions.

## Capabilities

### New Capabilities
- `branch-authentication`: Defines the exact split-screen login layout, segmented tabs (`Head Office (Admin)` and `Branch Login`), custom branch dropdown selector, PIN/password visibility toggle, and role-based redirect.
- `global-branch-configuration`: Centralized canonical branch configuration ensuring identical branch names (`Rajahmandary Main Branch`, `Kakinada Branch`, `Vijayawada Branch`, `Guntur Branch`), codes, and labels across all retail ERP and customer engagement modules.

## Impact

- **Affected Components**:
  - `src/pages/LoginPage.jsx` (complete redesign to exact reference image)
  - `src/config/branchConfig.js` (new canonical configuration module)
  - `src/services/branchService.js` (refactored to consume canonical config)
  - `src/services/authService.js` (synchronized synthetic accounts with exact branch labels)
  - `src/mocks/seedData.js` & `src/mocks/mockStorage.js` (safe data migration and branch unification)
  - `src/context/BranchContext.jsx` (centralized store label resolution)
- **Zero Regression Scope**:
  - All existing retail ERP modules (`/pos`, `/invoices`, `/inventory`, `/transfers`, `/accounting`) and Customer Engagement modules (`/chat-inbox`, `/leads`, `/customers`, `/campaigns`, `/reports`, `/settings`) maintain all operational features with zero business logic regressions.
