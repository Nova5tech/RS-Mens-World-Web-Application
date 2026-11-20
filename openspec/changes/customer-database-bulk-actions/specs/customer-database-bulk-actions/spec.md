# Spec Delta

## Purpose

Enables multi-record selection and bulk operations in the Customer Database with strict role-based access control and marketing consent protection.

## ADDED Requirements

### Requirement: Floating Bulk Action Toolbar Display
The system SHALL display a floating bulk action toolbar at the bottom of the customer table whenever one or more customer records are selected.

#### Scenario: User selects one or more customers
- **WHEN** the user checks one or more customer selection checkboxes
- **THEN** the system displays the floating bulk action bar with the exact count of selected customers and quick action buttons

#### Scenario: User deselects all customers
- **WHEN** the user unchecks all customer selection checkboxes or clicks Deselect All
- **THEN** the system hides the floating bulk action bar and clears the selection state

### Requirement: Bulk Customer Export to CSV
The system SHALL allow authorized users to export all currently selected customer records to a standard CSV file format.

#### Scenario: Super Admin exports selected records across branches
- **WHEN** a Super Admin selects multiple customers across branches and clicks Export Selected
- **THEN** the system downloads a CSV file containing all selected records with their customer details and purchase summaries

#### Scenario: Branch User exports selected records
- **WHEN** a Branch User selects customers from their assigned branch and clicks Export Selected
- **THEN** the system downloads a CSV file containing only the selected records belonging to their assigned branch

### Requirement: Role-Gated WhatsApp Campaign Audience Addition
The system SHALL restrict the action of adding selected customers to a WhatsApp Campaign Audience strictly to Super Admins.

#### Scenario: Super Admin adds customers to campaign audience
- **WHEN** a logged-in Super Admin selects customers and clicks Add to Campaign Audience
- **THEN** the system opens the Campaign Audience modal showing audience group selection and consent validation

#### Scenario: Branch User attempts audience addition
- **WHEN** a logged-in Branch User views the bulk action bar
- **THEN** the Add to Campaign Audience action is hidden or disabled with an RBAC restriction notice

### Requirement: Marketing Consent Verification for Campaign Audiences
The system SHALL verify customer marketing consent before adding any selected customer to a promotional campaign audience.

#### Scenario: Adding a mix of consented and unconsented customers
- **WHEN** a Super Admin selects customers where one or more have consent set to false and confirms adding them to a campaign
- **THEN** the system automatically filters out unconsented records, alerts the user of excluded contacts, and adds only consented customers

#### Scenario: Adding only opted-out customers
- **WHEN** all selected customers have marketing consent set to false
- **THEN** the system prevents audience creation and displays an alert indicating no eligible opted-in recipients

### Requirement: Bulk Customer Category Update
The system SHALL allow authorized users to update the customer classification category for all selected customer records simultaneously.

#### Scenario: Updating selected customers to VIP category
- **WHEN** the user selects multiple customers, opens Update Category, selects VIP, and confirms
- **THEN** the system updates the category to VIP for all selected customers, updates local storage, refreshes table badges, and displays a success notification
