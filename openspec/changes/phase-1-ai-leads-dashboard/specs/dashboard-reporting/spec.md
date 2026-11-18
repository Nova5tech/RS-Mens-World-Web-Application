# Spec Delta: Dashboard & Reporting

## Purpose

Delivers a responsive operations dashboard displaying primary engagement metrics, enquiry trend visualizations, follow-up alerts, branch/date filtering, and CSV report export capabilities with clear mock-mode transparency.

## ADDED Requirements

### Requirement: Operations Overview Metrics
The dashboard SHALL display real-time metric cards for New Chats, Captured Leads, Follow-ups Due, and Pending Staff Handovers, with comparison indicators against the preceding period.

#### Scenario: Admin views dashboard summary
- **WHEN** an authenticated user opens the overview dashboard
- **THEN** the dashboard renders primary KPI cards showing current counts for active chats, new leads captured, follow-ups scheduled for today or overdue, and pending chat handovers.

### Requirement: Enquiry and Conversion Trend Visualizations
The system SHALL present interactive charts displaying lead volume over time categorized by acquisition source (Chatbot, Website Enquiry, Campaign Reply, Manual) and branch breakdown.

#### Scenario: User inspects acquisition trends
- **WHEN** a user views the acquisition chart
- **THEN** the visualization renders time-series trend lines showing lead volume distribution across the selected time period.

### Requirement: Global Date Range and Branch Filtering
The dashboard and reporting interfaces SHALL update all displayed figures and charts dynamically when the user adjusts active date ranges or branch filters.

#### Scenario: User applies 7-day date filter
- **WHEN** a user changes the date filter from "Today" to "Last 7 Days"
- **THEN** all KPI cards, chart data points, and recent activity logs immediately recalculate based on the 7-day window.

### Requirement: CSV Report Export
The system SHALL enable users to export structured tabular data for leads, campaign delivery performance, and customer consent registries to downloadable CSV files.

#### Scenario: User exports filtered leads list
- **WHEN** a user clicks the "Export CSV" action on the reports or leads screen
- **THEN** the system generates and downloads a well-formatted CSV file containing lead IDs, customer names, mobile numbers, branches, stages, priorities, sources, and creation dates.

### Requirement: Demo Mode and Integration Status Transparency
The application SHALL display a persistent visual badge indicating "Demo Mode" when mock API services are active, and provide an integration status screen detailing service connectivity.

#### Scenario: Running application in mock mode
- **WHEN** the application executes with mock services enabled (`VITE_USE_MOCKS=true`)
- **THEN** the top navigation bar displays a distinct "Demo Mode / Mock Services" badge, preventing any misinterpretation of synthetic data as live customer records.
