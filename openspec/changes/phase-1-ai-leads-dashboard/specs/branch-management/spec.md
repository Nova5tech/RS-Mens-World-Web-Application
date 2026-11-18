# Spec Delta: Branch Management

## Purpose

Provides multi-branch configuration supporting four configurable branches (with Rajahmundry as the primary confirmed location), enforces role-based branch data scoping, and provides independent operational toggles across branches.

## ADDED Requirements

### Requirement: Four Configurable Branch Profiles
The system SHALL support configuration of four store branches (designated B1 through B4, with Rajahmundry confirmed as B1 and three configurable slots for expanding locations), storing store name, address, operating hours, and operational status.

#### Scenario: Admin views branch configuration list
- **WHEN** a Super Admin navigates to the Branch Settings screen
- **THEN** the system displays all four branch slots with their IDs, names, addresses, business hours, and active/inactive status badges.

#### Scenario: Admin updates branch details
- **WHEN** an administrator edits the details of branch B2 and saves changes
- **THEN** the system validates that store name and contact details are non-empty and updates the branch profile throughout the application.

### Requirement: Role-Based Branch Data Scoping
The system SHALL provide global multi-branch filtering for Super Admin users while strictly restricting Branch Users to data belonging to their assigned store branch.

#### Scenario: Super Admin switches active branch filter
- **WHEN** a Super Admin selects "Rajahmundry" from the global top-bar branch dropdown
- **THEN** all dashboard statistics, lead pipeline records, customer lists, and campaign metrics update immediately to show only Rajahmundry data.

#### Scenario: Super Admin selects "All Branches"
- **WHEN** a Super Admin selects the "All Branches" view option
- **THEN** the application displays consolidated metrics across all active branches with clear branch-identifying tags on each record.

#### Scenario: Branch User access restriction
- **WHEN** an authenticated Branch User assigned to Branch B1 accesses the application
- **THEN** the branch selector is locked to Branch B1, and records from branches B2, B3, and B4 are completely excluded from the user interface and data queries.

### Requirement: Independent Branch Operational Toggles
The system SHALL provide independent enable/disable toggles for each branch that govern participation in customer campaign messaging and routing.

#### Scenario: Admin disables a branch for campaign operations
- **WHEN** an administrator toggles branch B4 to "Disabled"
- **THEN** branch B4 is marked inactive for new campaign dispatches, automatically excluded from audience counts, and flagged as unavailable in the customer branch selection menus.
