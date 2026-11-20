# Spec: Customer Branch Access & Boundary Isolation

## ADDED REQUIREMENTS

### Requirement: Strict Authenticated Branch Boundaries
The system MUST isolate customer records based on the authenticated user's role and assigned branch:
- For Branch Users (`role === 'branch_user'`), the customer database MUST only display customers belonging to their assigned store (`assignedBranchId`).
- A user assigned to `Branch 1 – Rajahmandary Main Branch` (`B1`) SHALL NOT see customers belonging to Kakinada (`B2`), Vijayawada (`B3`), or Guntur (`B4`).
- For Super Admin (`role === 'admin'`), the system MUST provide access to all records and permit filtering by `ALL` or any individual store.

### Requirement: Branch Filter Control Visibility
- For Branch Users:
  - The branch selector SHALL NOT display an `All Branches` option.
  - The control SHALL display only the user's assigned branch name (e.g., `Rajahmandary Main Branch`) and MUST be non-editable / read-only.
  - Branch users SHALL NOT be able to circumvent this restriction via URL parameters, localStorage edits, or state inspection.
- For Super Admin:
  - The branch selector SHALL display `Branch: All`, followed by the 4 canonical stores:
    1. `Branch 1 – Rajahmandary Main Branch`
    2. `Branch 2 – Kakinada Branch`
    3. `Branch 3 – Vijayawada Branch`
    4. `Branch 4 – Guntur Branch`
