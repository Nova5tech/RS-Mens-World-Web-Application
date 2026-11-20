# Specification: Campaign RBAC & Branch Scoped Visibility

## Requirements

### Requirement 1: Branch Isolation for Branch Users
1. The application SHALL read the authenticated user session via `useAuth()`.
2. When `isBranchUser` is true:
   - The campaign list MUST include only campaigns where `campaign.branches.includes(currentUser.assignedBranchId)`.
   - Campaigns targeting only other branches (e.g., `['B2', 'B4']` when user is `B1`) MUST NOT be visible.
   - Combined multi-branch audience counts MUST NOT be shown; only the user's branch audience count SHALL be displayed.
   - The branch filter dropdown in the filter bar MUST be replaced with a locked store badge showing the user's assigned branch name.

### Requirement 2: Super Admin Global Access
1. When `isAdmin` is true:
   - All campaigns across all branches SHALL be visible.
   - The branch filter dropdown SHALL offer `All Branches`, `Branch 1 – Rajahmandary Main Branch`, `Branch 2 – Kakinada Branch`, `Branch 3 – Vijayawada Branch`, and `Branch 4 – Guntur Branch`.
   - Selecting any branch SHALL filter campaigns accordingly.
   - Consolidated cross-branch audience metrics SHALL be displayed.

### Requirement 3: Right Panel Role Differentiation
1. When `isBranchUser` is true:
   - Campaign creation wizard MUST NOT be rendered.
   - Create campaign buttons, editable form inputs, image upload buttons, template pickers, branch ON/OFF toggles, and send/schedule buttons MUST NOT be rendered.
   - A read-only `Campaign Details` panel SHALL be displayed for the active/selected campaign.
2. When `isAdmin` is true:
   - Full 4-step `Create WhatsApp Campaign` wizard SHALL be rendered with full functionality: Details, Audience, Content, Review.
   - 4 independent branch ON/OFF toggles MUST recalculate eligible audience reach in real-time.
