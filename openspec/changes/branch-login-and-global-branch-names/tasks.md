# Tasks: Branch Login UI & Global Branch Names

## 1. Centralized Canonical Branch Configuration

- [x] 1.1 Create `src/config/branchConfig.js` defining the 4 canonical stores (`Rajahmandary Main Branch`, `Kakinada Branch`, `Vijayawada Branch`, `Guntur Branch`) with helper functions `getBranchById` and `getBranchDisplayName`.
- [x] 1.2 Update `src/services/branchService.js` and `src/services/authService.js` to consume the canonical configuration and synchronize demo accounts.
- [x] 1.3 Implement safe localStorage migration in `src/mocks/mockStorage.js` ensuring existing browser data adopts the official branch names without data loss.

## 2. Split Screen Branch Login UI (`LoginPage.jsx`)

- [x] 2.1 Implement the full-screen split layout with dark teal left column, retail store background image with gradient overlay, organic mint-green wave SVG swooshes, and the four feature badges.
- [x] 2.2 Implement the floating white card with segmented tabs: `Head Office (Admin)` with building icon and `Branch Login` with store icon.
- [x] 2.3 Build the interactive custom Branch selection dropdown matching the reference screenshot with store icons, active mint highlight (`#d1fae5`), and green checkmark.
- [x] 2.4 Build the PIN/Password input with Lock icon and show/hide visibility toggle (`Eye` / `EyeOff`).
- [x] 2.5 Wire the dark teal "Sign In" button, handling loading states, validation, error messages, and role-based redirects.
- [x] 2.6 Add the `← Back to Role Selection` interactive link.

## 3. Global Branch Synchronization Across All Modules

- [x] 3.1 Update `src/components/layout/TopBar.jsx` and `src/components/layout/Sidebar.jsx` to render canonical branch names and enforce branch locking for branch users.
- [x] 3.2 Verify `src/pages/LeadsPage.jsx`, `AddLeadModal.jsx`, and `LeadDetailsPanel.jsx` display canonical branch names and preserve branch user restrictions.
- [x] 3.3 Verify `src/pages/CustomersPage.jsx` and `AddCustomerModal.jsx` display canonical branch names in filters and modals.
- [x] 3.4 Verify `src/pages/CampaignsPage.jsx` and `CampaignWizardModal.jsx` use canonical branch names in targeting.
- [x] 3.5 Verify `src/pages/ReportsPage.jsx` and `SettingsPage.jsx` display the 4 official Andhra Pradesh stores.

## 4. Verification & Testing

- [x] 4.1 Run `npm.cmd run build` to verify 0 compilation or bundling errors.
- [x] 4.2 Test Branch Login in the browser for all 4 branches (`acc-b1` to `acc-b4` with PINs `1111` to `4444`) and verify branch isolation.
- [x] 4.3 Test Head Office login (`acc-admin` with PIN `1000`) and verify all-branch access.
- [x] 4.4 Verify page refresh maintains active session and logout returns to login screen.
