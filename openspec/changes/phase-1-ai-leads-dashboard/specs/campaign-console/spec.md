# Spec Delta: Campaign Console

## Purpose

Enables creation and scheduling of promotional and informational customer broadcast campaigns with approved templates, independent four-branch audience toggles, strict consent-based recipient filtering, and dispatch status tracking.

## ADDED Requirements

### Requirement: Four-Step Campaign Creation Wizard
The system SHALL guide users through a structured 4-step wizard: Step 1 (Message Content & Template Selection), Step 2 (Branch Selection), Step 3 (Audience Calculation Preview), and Step 4 (Schedule and Final Confirmation).

#### Scenario: User navigates wizard steps
- **WHEN** a user fills in required campaign details and advances through the stepper
- **THEN** each step validates required inputs before permitting progression and provides visual step indicator progress.

#### Scenario: Template and image asset selection
- **WHEN** a user selects an approved message template and provides a promotional banner image URL or file
- **THEN** the system generates a live message preview reflecting how the broadcast appears to recipients.

### Requirement: Independent Four-Branch Audience Toggles
The system SHALL provide four independent toggle switches corresponding to each configured branch, dynamically computing eligible audience numbers for each enabled branch.

#### Scenario: Admin toggles specific branches
- **WHEN** an administrator enables branch B1 (Rajahmundry) and branch B2, while leaving branches B3 and B4 disabled
- **THEN** the audience breakdown displays positive eligible customer counts for B1 and B2, while branches B3 and B4 explicitly display zero targeted recipients.

#### Scenario: All branches disabled validation
- **WHEN** an administrator attempts to advance to the preview step with all four branch toggles switched off
- **THEN** the system halts progression and displays a validation alert requiring at least one active branch to be selected.

### Requirement: Strict Consent and Hygiene Filtering
The system SHALL strictly exclude any customer lacking verified marketing opt-in consent or possessing an invalid mobile number from campaign audience calculations.

#### Scenario: Audience calculation excludes opted-out customers
- **WHEN** the system calculates eligible recipients for an enabled branch
- **THEN** customers with missing contact consent, revoked opt-in status, or flagged invalid phone numbers are filtered out from the final recipient count.

### Requirement: Confirmation and Schedule Dispatch
The system SHALL require an explicit confirmation modal before queuing a campaign, supporting immediate dispatch or future date-time scheduling.

#### Scenario: User confirms campaign dispatch
- **WHEN** a user reviews the final audience tally and clicks "Schedule Campaign" with a designated date and time
- **THEN** the campaign record is created with status "Scheduled", stored with the target branch IDs and snapshot audience count, and queued for execution.
