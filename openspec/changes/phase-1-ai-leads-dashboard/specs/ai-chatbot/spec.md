# Spec Delta: AI Chatbot

## Purpose

Provides a responsive customer-facing website chat interface and conversation management console that delivers approved FAQ answers, discloses AI participation, captures visitor leads with consent, and escalates unresolved questions to human staff.

## ADDED Requirements

### Requirement: AI Disclosure and Welcome Greeting
The chatbot SHALL display a visible AI participation disclosure badge upon initialization and greet visitors with brand-approved options and quick FAQ prompt suggestions.

#### Scenario: Visitor opens chat widget
- **WHEN** a visitor expands the website chat widget
- **THEN** the chat header displays an explicit AI assistance badge, an introductory greeting, and quick query chips for store hours, locations, clothing categories, and current offers.

### Requirement: Approved FAQ Knowledge Retrieval
The system SHALL match visitor enquiries against verified store knowledge and return approved responses without fabricating unapproved policies, discounts, or stock details.

#### Scenario: Visitor asks recognized FAQ question
- **WHEN** a visitor asks a question covered in the approved knowledge base (such as Rajahmundry store hours or exchange policies)
- **THEN** the system returns the verified answer with an approved answer badge and offers relevant follow-up actions.

#### Scenario: Visitor asks unsupported or ambiguous question
- **WHEN** a visitor asks a question that does not match verified knowledge base records
- **THEN** the system states that it cannot confirm the information and presents an option to request a human staff handover or submit a contact enquiry.

### Requirement: Contact and Consent Capture
The chatbot SHALL collect the visitor's name, mobile number, preferred branch, and explicit contact consent prior to creating a sales lead.

#### Scenario: Visitor agrees to staff follow-up
- **WHEN** a visitor chooses to be contacted by store staff
- **THEN** the chat displays an inline lead capture form requiring customer name, 10-digit mobile number, preferred store branch, and an explicit opt-in checkbox for messaging consent.

#### Scenario: Visitor submits invalid mobile number
- **WHEN** a visitor submits a contact form with a mobile number shorter than 10 digits or containing invalid non-numeric characters
- **THEN** the system displays an inline validation error and prevents lead submission until the number is corrected.

### Requirement: Staff Handover Escalation
The chatbot SHALL support flagging an active conversation for human handover when requested by the visitor or when the conversation cannot be resolved by automated responses.

#### Scenario: Visitor triggers human handover
- **WHEN** a visitor clicks the "Talk to Store Staff" button or repeatedly receives fallback responses
- **THEN** the system marks the chat session as pending handover, records the handover request timestamp, and notifies the visitor that staff from the selected branch will respond.

### Requirement: Chat Transcript and Inbox Management
The internal application SHALL provide staff with a conversation inbox displaying active and historical chat sessions with status indicators, transcripts, and attached lead associations.

#### Scenario: Staff views active chat thread
- **WHEN** a store user opens the AI Chat Inbox and selects a conversation
- **THEN** the interface renders the full message history with role labels (visitor, AI, staff), timestamps, AI disclosure tags, assigned branch, and any captured contact details.
