# Spec Delta

## Purpose

Defines user interaction contracts, filtering behaviors, column heading integrity, and follow-up date management across Kanban and Table views in the Lead Generation pipeline.

## ADDED Requirements

### Requirement: Multi-Criteria Lead Filtering
The system SHALL provide an interactive filter drawer or popover in the Lead Generation module allowing users to filter leads by branch, stage, priority, and source.

#### Scenario: User applies multi-criteria filter
- **WHEN** user opens the Filters popover, selects Branch "Branch 1" and Stage "New", and clicks "Apply Filters"
- **THEN** system filters the displayed leads in both Kanban and Table views to only matching records and displays an active filter badge

#### Scenario: User clears active filters
- **WHEN** user clicks "Clear Filters" in the filter popover or on the filter badge
- **THEN** system resets all filter criteria and restores the full lead dataset

#### Scenario: Filter yields zero matches
- **WHEN** applied filters do not match any lead records
- **THEN** system presents an empty state message with an option to reset filters

### Requirement: Kanban Stage Column Heading and Focus Behavior
The system SHALL display stage column headings reflecting accurate counts from shared data and allow single-click stage focusing.

#### Scenario: Stage header counts reflect live records
- **WHEN** lead cards are moved, added, or filtered
- **THEN** system updates the count pill in each Kanban column heading to match current matching items

#### Scenario: User toggles single-stage focus
- **WHEN** user clicks a Kanban stage header such as "New"
- **THEN** system focuses or filters to leads in that specific stage, highlighting the active header with a reset toggle

### Requirement: Lead Follow-up Date Scheduling
The system SHALL provide an interactive date picker for scheduling follow-up dates in the Lead Details panel, persisting updates through the lead service.

#### Scenario: User selects a new follow-up date
- **WHEN** user opens the follow-up date picker in Lead Details and selects a new date
- **THEN** system updates the lead record via `leadService.updateLead`, updates the display immediately, shows a success toast, and refreshes corresponding card indicators

### Requirement: Cross-View Filter and Selection Synchronization
The system SHALL preserve applied search, branch, and multi-criteria filters and selected lead state when switching between Kanban and Table views.

#### Scenario: User switches views with active filters
- **WHEN** user toggles between Kanban and Table views while search or filters are active
- **THEN** system retains the exact filtered dataset and selected lead state without resetting
