# Spec Delta: Lead Pipeline

## Purpose

Enables automated and manual capture of sales leads, provides AI-assisted enquiry classification and priority scoring with staff override controls, and tracks customer progress across a six-stage pipeline with branch-level assignment.

## ADDED Requirements

### Requirement: Multi-Channel Lead Ingestion
The system SHALL ingest sales leads generated from the AI chatbot, website enquiry forms, or direct staff manual entry, recording customer contact details, source channel, and preferred branch.

#### Scenario: Ingestion from completed chatbot flow
- **WHEN** a website visitor completes the chat lead form with explicit consent
- **THEN** a new lead is created with stage set to "New", source set to "AI Chat", assigned to the visitor's selected branch, and flagged with contact consent.

#### Scenario: Manual lead creation by staff
- **WHEN** a staff user fills out the "Add Lead" modal with customer name, valid phone number, enquiry details, and branch
- **THEN** the system validates required fields and adds the lead to the pipeline with stage "New" and source "Manual".

### Requirement: AI-Assisted Classification and Staff Override
The system SHALL generate an advisory category, summary, and priority recommendation for each incoming enquiry, while allowing authorized staff to manually override any AI-assigned value.

#### Scenario: AI generates enquiry classification
- **WHEN** a new lead with raw enquiry text is created
- **THEN** the system populates an AI summary, suggests an enquiry category (such as Wedding Wear, Casual Shirts, Suits/Blazers, or Alterations), and assigns an initial priority (Low, Medium, High, Urgent).

#### Scenario: Staff modifies AI-suggested priority and category
- **WHEN** a staff member edits the lead details and selects a different priority or category
- **THEN** the system updates the lead record with the staff-chosen values, preserves the original AI suggestion in audit metadata, and marks the values as manually overridden.

### Requirement: Six-Stage Pipeline Management
The system SHALL organize leads across six distinct stages: New, Contacted, Qualified, Follow-up, Converted, and Lost, supporting both a visual Kanban board and an accessible table view.

#### Scenario: Drag-and-drop stage progression on Kanban board
- **WHEN** a user drags a lead card from "New" to "Contacted"
- **THEN** the system updates the lead stage to "Contacted", recalculates stage count totals, and logs the stage change event.

#### Scenario: Switching between Kanban and Table views
- **WHEN** a user toggles the pipeline view control from Kanban to Table
- **THEN** the application renders a filterable, sortable tabular list of leads displaying name, phone, enquiry summary, branch, priority, stage badge, and next follow-up date.

### Requirement: Follow-Up Scheduling and Notes Logging
The system SHALL allow staff to schedule follow-up dates, set reminder notes, and record conversation history within a dedicated lead details drawer.

#### Scenario: Staff schedules next follow-up date
- **WHEN** a user opens a lead details drawer, picks a future follow-up date and time, and enters notes
- **THEN** the system saves the follow-up timestamp, appends the note to the lead activity timeline, and reflects the upcoming date on the lead card.

#### Scenario: Overdue follow-up highlight
- **WHEN** the current system time passes a lead's scheduled follow-up timestamp without stage conversion
- **THEN** the system renders a prominent overdue indicator on the lead card and increments the dashboard's follow-up alert counter.
