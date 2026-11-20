# RS Mens World — Web Application

**Customer Engagement & Retail ERP Management Platform**

A centralized web application designed for **RS Mens World**, a multi-branch fashion retail business, to manage customer relationships, lead generation, AI-assisted conversations, WhatsApp marketing campaigns and retail business operations.

The platform aims to simplify everyday workflows for store employees, branch managers and administrators through an intuitive, responsive interface.

> **Project Status:** Active Development  
> **Repository:** Private — Internal Project  
> **Application Type:** Multi-Branch Retail Management Web Application

---

## Project Overview

RS Mens World Web Application brings customer engagement and retail management workflows into a single platform.

The application is designed to help the business:

- Maintain centralized customer records.
- Capture, organize and follow up on potential customers.
- Manage customer conversations through an AI Chatbot interface.
- Plan and monitor WhatsApp marketing campaigns.
- Organize retail operations across multiple branches.
- Provide role-based access to business information.
- View operational summaries and reports.

The frontend is being developed with a modular architecture to support future backend API integrations.

## Core Modules

### 1. Dashboard & Analytics

Provides an overview of customer engagement and retail operations.

**Key features:**
- Dashboard summary cards
- Customer and lead statistics
- Branch-wise information
- Campaign performance indicators
- Reports and business insights

### 2. AI Chatbot

A customer conversation management interface designed to support customer engagement and follow-up workflows.

**Key features:**
- Customer conversation inbox
- Conversation search and selection
- Read and unread conversation status
- Customer information panel
- Follow-up date management
- Conversation details and actions
- Integration-ready conversation service layer

**Development note:** AI-powered responses and external messaging capabilities depend on backend and third-party service integration.

### 3. Lead Generation

Helps employees organize potential customers and track their progress through the sales process.

**Key features:**
- Lead creation and management
- Kanban and table views
- Lead status tracking
- Search and filtering
- Follow-up scheduling
- Lead details and activity management
- Branch-based lead visibility

### 4. Customer Database

A centralized customer management module for storing and organizing customer information.

**Key features:**
- Customer records and profiles
- Add and edit customer forms
- Customer search and filters
- Customer categorization
- WhatsApp marketing permission tracking
- Bulk customer selection and actions
- Customer export workflows
- Petpooja import interface
- Branch-wise customer access

### 5. WhatsApp Campaigns

A campaign management interface for planning customer communication and promotional activities.

**Key features:**
- Campaign overview and status tracking
- Campaign creation interface
- Message templates
- Promotional content and image selection
- Branch targeting
- Campaign audience management
- Scheduling interface
- Campaign statistics and filters

**Access model:**
- **Super Admin:** Campaign management and configuration.
- **Branch User:** Read-only access to campaigns relevant to their assigned branch.

**Development note:** Live WhatsApp message delivery requires an authorized messaging provider, backend integration and applicable customer marketing permissions.

### 6. Retail ERP Modules

The application also includes frontend modules for retail operations:

- Billing / Point of Sale (POS)
- Inventory Management
- Invoices and Returns
- Stock Transfers
- Accounting
- Operational Reports

These modules are part of the broader application and may have different implementation and integration statuses.

---

## Multi-Branch Management

The platform is designed to support the following branches:

| Branch ID | Branch Name |
|---|---|
| B1 | Rajahmandary Main Branch |
| B2 | Kakinada Branch |
| B3 | Vijayawada Branch |
| B4 | Guntur Branch |

### Role-Based Access

**Super Admin**
- Access authorized information across branches.
- Manage customer engagement operations.
- Configure WhatsApp campaigns.
- Review branch-level reports and activities.

**Branch User**
- Access information belonging to their assigned branch.
- Manage permitted customer and lead activities.
- View relevant campaign information.
- Cannot manage Super Admin-only campaign settings.

> Frontend access controls improve the user experience but must also be enforced by the backend for production security.

---

## Technology Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend user interface |
| JavaScript | Application logic |
| Vite | Development server and build tooling |
| Tailwind CSS | Styling and responsive design |
| React Router | Application navigation |
| Git & GitHub | Version control and collaboration |
| OpenSpec | Feature specifications and development planning |
| Service Adapters | Frontend data access and API integration |
| Mock Data Services | Development and testing before backend integration |

Additional dependencies can be found in `package.json`.

---

## Project Architecture

The frontend follows a modular, component-based approach.

```text
RS-Mens-World-Web-Application/
│
├── public/
├── src/
│   ├── components/
│   │   ├── campaigns/
│   │   ├── chat/
│   │   ├── customers/
│   │   ├── layout/
│   │   └── leads/
│   │
│   ├── config/
│   ├── mocks/
│   ├── pages/
│   ├── services/
│   └── utils/
│
├── docs/
├── openspec/
├── package.json
└── README.md
```

*The structure above highlights key directories and is not intended as an exhaustive file listing.*

### Architecture Principles

- Reusable React components
- Modular page and feature organization
- Centralized branch configuration
- Role-aware navigation and functionality
- Service-based data access
- Mock-data support during frontend development
- Backend integration readiness
- Consistent UI/UX across modules

---

## Getting Started

### Prerequisites

Install the following tools:

- Node.js
- npm
- Git
- A code editor or supported development environment

### 1. Clone the Repository

```bash
git clone https://github.com/Nova5tech/RS-Mens-World-Web-Application.git
```

```bash
cd RS-Mens-World-Web-Application
```

You must have access to the private repository.

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

If the project includes `.env.example`, copy it to `.env.local` and configure the documented values.

For frontend development using mock services, the project may use:

```env
VITE_USE_MOCKS=true
```

Use the actual environment configuration supported by the application.

Never commit credentials or sensitive environment files.

### 4. Start the Development Server

```bash
npm run dev
```

Open the local URL displayed in the terminal.

### 5. Create a Production Build

```bash
npm run build
```

On Windows PowerShell, if npm command execution is restricted, use:

```powershell
npm.cmd run build
```

---

## UI/UX Design

The application follows a modern retail management interface with:

- Deep teal navigation
- Mint green accents
- Clean dashboard layouts
- Responsive tables and cards
- Searchable customer and lead records
- Forms, filters, dropdowns and detail panels
- Consistent visual components
- Simple labels designed for non-technical business users

The goal is to reduce complexity for store employees while maintaining useful administrative functionality.

---

## Customer Engagement Workflow

The intended workflow connects customer conversations, leads and marketing activities.

```text
Customer Interaction
        |
        v
AI Chatbot / Conversation Inbox
        |
        v
Lead Generation
        |
        v
Customer Database
        |
        v
Follow-up & Customer Management
        |
        v
WhatsApp Campaign Audience
        |
        v
Campaign Management
        |
        v
Reporting & Analytics
```

Customer permission and branch authorization must be checked before including customers in promotional campaigns.

---

## API Integration

The frontend uses service adapters to separate interface logic from data retrieval and updates.

This approach supports:

- Development with mock services
- Future connection to backend APIs
- Consistent data models
- Shared information between modules
- Easier testing and maintenance

Relevant integration documentation is maintained in the `docs/` directory.

Backend responsibilities include authentication enforcement, authorization, persistent data storage, messaging integrations and secure API operations.

---

## Development Workflow

Development follows a feature-oriented workflow:

1. Review business requirements.
2. Define or update OpenSpec specifications.
3. Implement frontend functionality.
4. Integrate with existing service adapters.
5. Test user interactions and branch restrictions.
6. Run the project build.
7. Review changes before merging.

### Git Branching

The project uses feature branches for ongoing development.

Example:

```text
main
  |
  └── feature/frontend-functionality
```

Feature changes should be reviewed and verified before merging into the main branch.

---

## Development Status

| Area | Status |
|---|---|
| Frontend UI/UX | Implemented across multiple modules; ongoing refinement |
| Customer Database | Active development and testing |
| Lead Generation | Active development and testing |
| AI Chatbot Interface | Active development and testing |
| WhatsApp Campaigns Interface | Active development and testing |
| Branch-Based Access | Implementation and verification in progress |
| Retail ERP Interfaces | Existing frontend modules; integration status varies |
| Backend API Integration | Pending integration/verification |
| Production Deployment | Not confirmed |

Status information should be updated as functionality is tested and approved.

---

## Security & Data Handling

- Use private repositories for internal business code.
- Never commit passwords, access tokens or API secrets.
- Do not store production customer data in public sample files.
- Enforce branch-based authorization in backend APIs.
- Respect customer WhatsApp marketing permissions.
- Restrict campaign management to authorized roles.
- Validate imported customer data.
- Review code and dependencies before production deployment.

---

## Documentation

Project-related documentation is maintained in:

```text
docs/
openspec/
```

These directories may include:

- Business and application requirements
- Technical and design specifications
- Development proposals
- Feature acceptance criteria
- Implementation tasks
- Backend handoff documentation
- Interaction audits and progress tracking

---

## Future Enhancements

Planned or potential improvements include:

- Complete backend API integration
- Production-ready authentication and authorization
- Live WhatsApp Business integration
- AI-assisted customer response workflows
- Automated follow-up reminders
- Enhanced customer segmentation
- Advanced campaign analytics
- Cross-module reporting
- Performance and accessibility improvements

These enhancements are subject to project requirements and approval.

---

## Project Ownership

**Organization:** Nova5 Technologies Consulting  
**Project:** RS Mens World Web Application  
**Development:** Collaborative project team  
**Repository Access:** Authorized team members only

---

## License & Confidentiality

This repository contains internal project work intended for authorized development and business use.

All source code, documentation and business information must be handled according to the project owner's policies and agreements.

**© 2026. All rights reserved, subject to applicable project ownership agreements.**
