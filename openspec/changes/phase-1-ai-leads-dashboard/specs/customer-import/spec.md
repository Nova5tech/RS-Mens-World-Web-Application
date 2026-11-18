# Spec Delta: Customer Import

## Purpose

Provides a multi-step upload and preview wizard for periodic manual Petpooja customer exports (CSV and Excel formats), ensuring data validation, mobile number normalization, duplicate detection, branch assignment, and explicit consent tracking before import confirmation.

## ADDED Requirements

### Requirement: Petpooja Export File Upload
The system SHALL accept manual file uploads of customer export files in CSV and Excel (.xlsx) formats, displaying file metadata and parsed row counts.

#### Scenario: Staff selects valid CSV file
- **WHEN** a user uploads a Petpooja export file in .csv or .xlsx format under 10MB
- **THEN** the system parses the file structure, displays the file name and total detected rows, and advances the user to the column mapping step.

#### Scenario: Staff uploads unsupported file format
- **WHEN** a user uploads an unsupported file format (such as .pdf or .doc)
- **THEN** the system rejects the file with a clear error message indicating that only CSV and Excel spreadsheets are supported.

### Requirement: Flexible Column Mapping
The system SHALL provide an interactive column mapping interface that matches source spreadsheet columns to target system fields (Customer Name, Mobile Number, Branch, Email, Birthday, Anniversary, Marketing Consent).

#### Scenario: Automatic header matching
- **WHEN** source file column headers match standard Petpooja names (e.g., "Customer Name", "Phone", "Store")
- **THEN** the system automatically pre-selects the corresponding target fields and highlights mapped columns.

#### Scenario: Manual column reassignment
- **WHEN** a user alters a mapped field selection using the mapping dropdowns
- **THEN** the system updates the preview mapping immediately and re-evaluates validation rules on the sample rows.

### Requirement: Pre-Import Validation and Duplicate Review
The system SHALL validate all uploaded rows against data hygiene rules and display an itemized breakdown of valid rows, invalid records, duplicate mobile numbers, and consent warnings before committing.

#### Scenario: Mobile number formatting validation
- **WHEN** an uploaded row contains an invalid phone number (fewer than 10 digits or non-numeric characters)
- **THEN** the system flags the row as invalid, displays the specific validation error, and excludes it from the valid import count.

#### Scenario: Duplicate detection against existing customers
- **WHEN** an uploaded row contains a mobile number that already exists in the system or appears earlier in the upload file
- **THEN** the system flags the record in a duplicate review tab with options to skip the duplicate or update the existing customer's metadata.

### Requirement: Import Confirmation and Summary Audit
The system SHALL require explicit user confirmation after displaying the final validation tally, preventing silent ingestion of malformed records and providing an import audit summary.

#### Scenario: User confirms import of validated records
- **WHEN** a user reviews the summary showing valid, duplicate, and invalid counts and clicks "Confirm Import"
- **THEN** the system imports only the validated records into the customer database, tags each with the import timestamp and source ("Petpooja Manual Import"), and displays a completion receipt.
