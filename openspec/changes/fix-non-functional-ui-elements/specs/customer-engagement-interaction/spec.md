# Spec Delta

## Purpose

Defines user interaction contracts, contextual menus, modal dialogues, follow-up scheduling, and reactive cross-module data synchronization for the RS Mens World Customer Engagement platform.

## ADDED Requirements

### Requirement: Top-Level Profile Avatar Menu
The system SHALL display an interactive user menu when the top-right profile avatar is clicked, showing current user identity and operational actions.

#### Scenario: User opens and navigates profile menu
- **WHEN** user clicks the circular profile avatar in the top header
- **THEN** system displays a dropdown with user name, role, Profile, Settings, and Logout options

#### Scenario: User signs out via profile menu
- **WHEN** user clicks "Sign Out" in the profile menu
- **THEN** system clears the active session and navigates to the login screen

### Requirement: Conversation Information Drawer
The system SHALL provide a conversation information modal or drawer in AI Chatbot that displays comprehensive metadata for the selected conversation.

#### Scenario: User opens conversation info
- **WHEN** user clicks the info icon in the active conversation header
- **THEN** system opens a drawer showing customer contact, channel, branch, timestamps, and linked lead status

### Requirement: Fullscreen Conversation View
The system SHALL allow users to expand the active chat thread into a dedicated modal or enlarged view without losing state.

#### Scenario: User expands active chat thread
- **WHEN** user clicks the expand icon in the chat header
- **THEN** system presents the complete thread history in an expanded overlay while preserving current selection

### Requirement: Contextual Conversation Actions
The system SHALL display a contextual action menu on clicking the conversation three-dots icon, allowing status updates and lead creation.

#### Scenario: User closes an active conversation
- **WHEN** user selects "Mark as Resolved" from the conversation three-dot menu
- **THEN** system updates the conversation status to resolved, moves it to the Closed filter, and refreshes the inbox

#### Scenario: User triggers staff handover
- **WHEN** user selects "Request Handover" from the conversation menu
- **THEN** system updates status to handover pending and notifies store staff

### Requirement: Lead Follow-up Date Scheduling
The system SHALL provide a responsive date picker to schedule follow-up dates in the Lead Details panel and persist changes through the lead service.

#### Scenario: User reschedules follow-up date
- **WHEN** user clicks the follow-up date input or calendar icon and picks a new date
- **THEN** system updates the lead record, persists the change in storage, and displays a success notification

### Requirement: Chatbot Lead Capture Synchronization
The system SHALL synchronize leads generated from AI Chatbot conversations into the Lead Generation pipeline immediately.

#### Scenario: Lead created from chat appears in pipeline
- **WHEN** user clicks "Create Lead" from an active conversation and submits customer details
- **THEN** system records the lead in `leadService` and navigates to `/leads` with the new lead visible in the New column

### Requirement: Customer Management and History Deep Linking
The system SHALL allow full editing of customer records and deep-link directly to purchase transactions.

#### Scenario: User navigates to customer purchase history
- **WHEN** user clicks "View Purchase History" in the customer details drawer
- **THEN** system navigates to `/invoices` with the customer name pre-filtered in the search query

### Requirement: WhatsApp Campaign Audience Calculation
The system SHALL dynamically calculate eligible campaign audience based on independent branch switches and DPDP marketing consent.

#### Scenario: Branch toggle updates eligible audience
- **WHEN** user toggles branch B4 OFF while B1, B2, B3 remain ON in the campaign builder
- **THEN** system updates the eligible audience count from 24,560 to 21,530 reflecting consented customers in active branches
