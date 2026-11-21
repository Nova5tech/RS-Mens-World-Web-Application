# RS Mens World — API Contract

Handover specification for the backend development team. All endpoints return JSON and adhere to standard REST semantics.

---

## 1. Global Standards & Conventions

### 1.1 Base URL
- Production: `https://api.rsmensworld.com/api/v1`
- Staging / Dev: `http://localhost:8000/api/v1`
- Configured via environment variable: `VITE_API_BASE_URL`

### 1.2 Authentication Header
All authenticated requests must include the Bearer token in the `Authorization` header:
```http
Authorization: Bearer <jwt_or_access_token>
```
If token is invalid or expired, the API must return `401 Unauthorized`. Frontend automatically redirects to login.

### 1.3 Common Response & Error Format
Standard error response payload:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description of what went wrong",
    "details": [
      {
        "field": "phone",
        "message": "Invalid E.164 phone number format"
      }
    ]
  }
}
```

Standard HTTP status codes used:
- `200 OK`: Request succeeded
- `201 Created`: Resource successfully created
- `204 No Content`: Resource successfully deleted
- `400 Bad Request`: Validation failure or bad input
- `401 Unauthorized`: Missing or invalid auth token / credentials
- `403 Forbidden`: Authenticated user lacks permission
- `404 Not Found`: Resource not found
- `409 Conflict`: Duplicate entry or conflicting state
- `500 Internal Server Error`: Unhandled server exception

### 1.4 Pagination Format
Endpoints that return paginated lists accept standard query parameters:
- `page`: 1-based page number (default: `1`)
- `pageSize`: items per page (default: `20`, max: `100`)

Paginated response envelope:
```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "pageSize": 20,
  "totalPages": 0
}
```

### 1.5 Branch Tenancy & Security Rule (CRITICAL)
- **Branch Isolation on Every Endpoint**: Every business record belongs to a specific `branch_id`.
- The backend **must enforce branch isolation on every endpoint using the JWT Bearer token**.
- If the token belongs to a `branch_user`:
  - The backend must strictly restrict and filter all DB queries to that user's assigned `branch_id`.
  - Any request attempting to access, update, or delete data belonging to another `branch_id` must immediately return `403 Forbidden`.
  - Route handlers must NOT trust client-supplied `branch_id` query parameters or body fields over the authenticated token's `branch_id`.
- If the token belongs to a `super_admin`:
  - Full access to all branches. May filter by `branch_id` query parameter, or query all branches if omitted or `all`.

---

## 2. Authentication Endpoints (Phase 1)

### 2.1 Login

#### `POST /auth/login`
Authenticate either a Head Office Super Admin (via email + password) or a Branch User (via branch selection + 4–6 digit PIN).

- **Access**: Public

#### Variant A: Head Office (Admin) Login
- **Request Body**:
```json
{
  "type": "admin",
  "email": "admin@rsmensworld.com",
  "password": "Admin@123"
}
```

#### Variant B: Branch Login
- **Request Body**:
```json
{
  "type": "branch",
  "branchId": "branch_2",
  "pin": "2222"
}
```

- **Response `200 OK` (Admin)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_super_admin",
    "full_name": "Super Admin",
    "role": "super_admin",
    "branch_id": null,
    "branch_name": null,
    "email": "admin@rsmensworld.com",
    "avatar": null,
    "is_active": true
  }
}
```

- **Response `200 OK` (Branch User)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_b2",
    "full_name": "Kakinada Store Manager",
    "role": "branch_user",
    "branch_id": "branch_2",
    "branch_name": "Kakinada Branch",
    "email": null,
    "avatar": null,
    "is_active": true
  }
}
```

- **Error Responses**:
  - `400 Bad Request` (Invalid input payload / validation failed):
    ```json
    {
      "error": {
        "code": "VALIDATION_ERROR",
        "message": "PIN must be between 4 and 6 digits",
        "details": [
          { "field": "pin", "message": "PIN must be 4 to 6 digits" }
        ]
      }
    }
    ```
  - `401 Unauthorized` (Wrong credentials):
    ```json
    {
      "error": {
        "code": "INVALID_CREDENTIALS",
        "message": "Invalid email or password"
      }
    }
    ```
    or for branch:
    ```json
    {
      "error": {
        "code": "INVALID_BRANCH_PIN",
        "message": "Invalid PIN for the selected branch"
      }
    }
    ```
  - `403 Forbidden` (Account disabled / inactive):
    ```json
    {
      "error": {
        "code": "ACCOUNT_DISABLED",
        "message": "This account is currently deactivated. Please contact Head Office."
      }
    }
    ```

---

### 2.2 Logout

#### `POST /auth/logout`
Invalidate current session / blacklist JWT token.

- **Access**: Authenticated (`super_admin`, `branch_user`)
- **Headers**:
  ```http
  Authorization: Bearer <token>
  ```
- **Request Body**: None
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid token

---

### 2.3 Get Current Authenticated User

#### `GET /auth/me`
Retrieve profile of currently authenticated user derived from Bearer token.

- **Access**: Authenticated (`super_admin`, `branch_user`)
- **Headers**:
  ```http
  Authorization: Bearer <token>
  ```
- **Response `200 OK` (Admin)**:
```json
{
  "id": "user_super_admin",
  "full_name": "Super Admin",
  "role": "super_admin",
  "branch_id": null,
  "branch_name": null,
  "email": "admin@rsmensworld.com",
  "is_active": true
}
```

- **Response `200 OK` (Branch User)**:
```json
{
  "id": "user_b2",
  "full_name": "Kakinada Store Manager",
  "role": "branch_user",
  "branch_id": "branch_2",
  "branch_name": "Kakinada Branch",
  "is_active": true
}
```

- **Error Responses**:
  - `401 Unauthorized`: Token expired or invalid
  - `403 Forbidden`: User account inactive or deactivated

---

## 3. Core Store Endpoints (Phase 0)

### 3.1 Branches

#### `GET /branches`
Retrieve the list of active retail store branches.

- **Access**: Authenticated (`super_admin`, `branch_user`)
- **Query Parameters**:
  - `is_active` (optional, boolean): Filter active branches (`true`/`false`). Default `true`.

- **Response `200 OK`**:
```json
[
  {
    "id": "branch_1",
    "code": "B1",
    "name": "Rajahmundry Main Branch",
    "city": "Rajahmundry",
    "address": "Main Road, Near Syamala Theatre, Rajahmundry, AP - 533101",
    "phone": "+91 98765 43210",
    "timings": "10:00 AM - 9:30 PM",
    "wa_phone_id": "wa_b1_rajahmundry",
    "is_active": true
  }
]
```

#### `POST /branches`
Create a new store branch.

- **Access**: `super_admin` only
- **Request Body**:
```json
{
  "code": "B5",
  "name": "Vizag Beach Road Branch",
  "city": "Visakhapatnam",
  "address": "Beach Road, Pandurangapuram, Visakhapatnam, AP - 530003",
  "phone": "+91 98480 12345",
  "timings": "10:00 AM - 9:30 PM",
  "wa_phone_id": "wa_b5_vizag",
  "is_active": true
}
```
- **Response `201 Created`**: Returns created `Branch` object.

#### `PATCH /branches/{id}`
Update details or toggle active status of a branch.

- **Access**: `super_admin` only
- **Request Body**: Partial `Branch` fields to update.
- **Response `200 OK`**: Returns updated `Branch` object.

---

## 4. User Management Endpoints (Phase 2)

### 4.1 Users

#### `GET /users`
Retrieve list of users across all branches.

- **Access**: `super_admin` only
- **Response `200 OK`**:
```json
[
  {
    "id": "user_super_admin",
    "full_name": "Super Admin",
    "role": "super_admin",
    "branch_id": null,
    "branch_name": null,
    "email": "admin@rsmensworld.com",
    "is_active": true,
    "last_login_at": "2026-11-21T10:45:00Z"
  },
  {
    "id": "user_b1",
    "full_name": "Rajahmundry Store Manager",
    "role": "branch_user",
    "branch_id": "branch_1",
    "branch_name": "Rajahmundry Main Branch",
    "pin": "1111",
    "is_active": true,
    "last_login_at": "2026-11-21T09:15:00Z"
  }
]
```

#### `POST /users`
Create a new staff user or super admin.

- **Access**: `super_admin` only
- **Request Body (Admin)**:
```json
{
  "full_name": "Ramesh Varma",
  "role": "super_admin",
  "email": "ramesh@rsmensworld.com",
  "password": "Password@123",
  "is_active": true
}
```
- **Request Body (Branch User)**:
```json
{
  "full_name": "Kishore Kumar",
  "role": "branch_user",
  "branch_id": "branch_3",
  "pin": "3333",
  "is_active": true
}
```
- **Response `201 Created`**: Returns created `User` object.

#### `PATCH /users/{id}`
Update user profile, branch assignment, or active status.

- **Access**: `super_admin` only
- **Rules**:
  - Super admin cannot deactivate themselves (`400 Bad Request`).
  - Last active super admin cannot be deactivated or deleted (`400 Bad Request`).
- **Response `200 OK`**: Returns updated `User` object.

#### `POST /users/{id}/reset-credential`
Generate a new random password (for super admin) or PIN (for branch user) and return it once.

- **Access**: `super_admin` only
- **Response `200 OK`**:
```json
{
  "newCredential": "Admin@842",
  "type": "password"
}
```
or for branch user:
```json
{
  "newCredential": "4892",
  "type": "pin"
}
```

---

## 5. Customer Database & Petpooja Import Endpoints (Phase 3)

### 5.1 Customers

#### `GET /customers`
Retrieve paginated list of customers with search, branch scoping, consent and status filters.

- **Access**: Authenticated (`super_admin`, `branch_user`)
- **Branch Rule**: `branch_user` is strictly scoped to their assigned `branch_id`. `super_admin` can filter by `branchId` or retrieve all branches.
- **Query Parameters**:
  - `page` (integer, default: 1): 1-based page index
  - `pageSize` (integer, default: 20, max: 100): items per page
  - `search` (string, optional): Search across name, phone, code, email
  - `branchId` (string, optional): Branch identifier (`branch_1`, etc.)
  - `status` (string, optional): `all` | `active` | `new` | `inactive`
  - `consent` (string, optional): `all` | `yes` | `no`
  - `type` (string, optional): `Regular` | `VIP` | `Repeat`
  - `birthdayMonth` (integer, 1–12, optional)
  - `anniversaryMonth` (integer, 1–12, optional)
  - `source` (string, optional): Filter by acquisition source
  - `sortBy` (string, optional, default: `last_interaction_at`)
  - `sortOrder` (string, optional, `asc` | `desc`, default: `desc`)

- **Response `200 OK`**:
```json
{
  "items": [
    {
      "id": "cust_10248",
      "code": "C-10248",
      "name": "Rahul Kumar",
      "phone": "+919876543210",
      "email": "rahul.kumar@gmail.com",
      "birthday": "1992-04-12",
      "anniversary": "2019-11-20",
      "branch_id": "branch_1",
      "branch_name": "Rajahmundry Main Branch",
      "customer_type": "Regular",
      "status": "active",
      "consent": true,
      "consent_source": "petpooja_import",
      "consent_at": "2024-03-15T10:00:00Z",
      "opted_out_at": null,
      "total_purchases": 18450,
      "order_count": 9,
      "avg_order_value": 2047,
      "last_interaction_at": "2025-11-18T14:30:00Z",
      "created_at": "2024-03-15T10:00:00Z",
      "source": "Petpooja Import"
    }
  ],
  "total": 200,
  "page": 1,
  "pageSize": 20,
  "totalPages": 10
}
```

#### `GET /customers/counts`
Retrieve customer tab aggregate counts (All, New, Active, Inactive) for the authenticated scope.

- **Access**: Authenticated (`super_admin`, `branch_user`)
- **Query Parameters**:
  - `branchId` (optional): Filter counts by branch
- **Response `200 OK`**:
```json
{
  "all": 200,
  "new": 50,
  "active": 125,
  "inactive": 25
}
```

#### `GET /customers/{id}`
Retrieve a single customer record by ID with purchase history and consent details.

- **Access**: Authenticated (`super_admin`, `branch_user`)
- **Response `200 OK`**: Returns `Customer` object.
- **Error Responses**: `403 Forbidden` if `branch_user` accesses customer of another branch.

#### `POST /customers`
Register a new customer record.

- **Access**: Authenticated (`super_admin`, `branch_user`)
- **Request Body**:
```json
{
  "name": "Vikram Adiga",
  "phone": "+919848011223",
  "email": "vikram.adiga@gmail.com",
  "branch_id": "branch_1",
  "birthday": "1994-06-15",
  "anniversary": "2021-12-08",
  "customer_type": "Regular",
  "consent": true
}
```
- **Response `201 Created`**: Returns created `Customer` object with generated `code` (e.g. `C-10249`).
- **Error Responses**: `409 Conflict` if phone number already exists in DB.

#### `PATCH /customers/{id}`
Update customer contact details, profile, or marketing consent.

- **Access**: Authenticated (`super_admin`, `branch_user`)
- **Request Body**: Partial `Customer` fields.
- **Response `200 OK`**: Returns updated `Customer` object.

#### `DELETE /customers/{id}`
Remove a customer record.

- **Access**: Authenticated (`super_admin`, `branch_user`)
- **Response `204 No Content`**

#### `POST /customers/bulk-upsert`
Batch import customers from Petpooja POS. Performs phone de-duplication: inserts new customers and updates purchase totals for existing customers.

- **Access**: Authenticated (`super_admin`, `branch_user`)
- **Request Body**:
```json
{
  "items": [
    {
      "name": "Karthik Raja",
      "phone": "+919876543210",
      "email": "karthik@example.com",
      "branch_id": "branch_1",
      "total_purchases": 5400,
      "order_count": 2,
      "consent": true
    }
  ],
  "batchMeta": {
    "fileName": "petpooja_nov_export.xlsx",
    "uploadedBy": "Super Admin"
  }
}
```
- **Response `200 OK`**: Returns created `ImportBatch` record.

### 5.2 Import Batches

#### `GET /imports`
Retrieve past Petpooja import batch logs.

- **Access**: Authenticated (`super_admin`, `branch_user`)
- **Response `200 OK`**: Returns array of `ImportBatch` objects.

#### `GET /imports/{id}`
Retrieve details and row validation log of a specific import batch.

- **Access**: Authenticated (`super_admin`, `branch_user`)
- **Response `200 OK`**: Returns `ImportBatch` object.

---

## 6. Content Library Endpoints (Phase 4)

### 6.1 Media Assets

#### `GET /media`
Retrieve media asset library for campaign headers and promotional messaging.

- **Access**: `super_admin` only
- **Response `200 OK`**: Array of `MediaAsset` objects.

#### `POST /media`
Upload new media asset poster or banner.

- **Access**: `super_admin` only
- **Request Body**:
```json
{
  "title": "Winter Collection Launch Banner",
  "kind": "New Arrival",
  "storage_path": "data:image/jpeg;base64,..."
}
```
- **Response `201 Created`**: Returns created `MediaAsset`.

#### `DELETE /media/{id}`
Remove media asset.

- **Access**: `super_admin` only
- **Response `204 No Content`**

### 6.2 Message Templates

#### `GET /templates`
Retrieve message templates list.

- **Access**: Authenticated (`super_admin`, `branch_user` read-only)
- **Response `200 OK`**: Array of `MessageTemplate` objects.

#### `POST /templates`
Create new Meta WhatsApp message template.

- **Access**: `super_admin` only
- **Request Body**:
```json
{
  "name": "Winter Collection Launch",
  "category": "Promotional",
  "body": "Hello {{customer_name}}! Check out our new arrivals at {{branch_name}}.",
  "variables": ["customer_name", "branch_name"],
  "header_image_url": "https://...",
  "cta_text": "Visit Nearest Store",
  "cta_url": "https://...",
  "meta_template_name": "winter_launch_v1",
  "meta_status": "Approved"
}
```
- **Response `201 Created`**: Returns created `MessageTemplate`.

#### `PATCH /templates/{id}`
Update message template or Meta status.

- **Access**: `super_admin` only
- **Response `200 OK`**: Returns updated `MessageTemplate`.

#### `DELETE /templates/{id}`
Delete a template.

- **Access**: `super_admin` only
- **Response `204 No Content`**

### 6.3 Audience Segments

#### `GET /segments`
Retrieve all dynamic customer audience segments with computed matching counts.

- **Access**: Authenticated (`super_admin`, `branch_user` read-only)
- **Response `200 OK`**: Array of `Segment` objects including `customer_count` and `branch_counts`.

#### `POST /segments`
Create a new customer audience segment with filtering rules.

- **Access**: `super_admin` only
- **Request Body**:
```json
{
  "name": "Birthday in December",
  "rules_json": {
    "birthday_month": 12,
    "opted_in_only": true
  }
}
```
- **Response `201 Created`**: Returns created `Segment`.

#### `POST /segments/preview-count`
Calculate live customer audience counts matching segment rules across all branches.

- **Access**: Authenticated (`super_admin`, `branch_user`)
- **Request Body**:
```json
{
  "rules": {
    "branch_id": null,
    "birthday_month": 12,
    "customer_type": "all",
    "opted_in_only": true
  }
}
```
- **Response `200 OK`**:
```json
{
  "totalCount": 18,
  "branchCounts": {
    "branch_1": 6,
    "branch_2": 4,
    "branch_3": 5,
    "branch_4": 3
  }
}
```

#### `PATCH /segments/{id}`
Update segment rules and criteria.

- **Access**: `super_admin` only
- **Response `200 OK`**: Returns updated `Segment`.

#### `DELETE /segments/{id}`
Delete audience segment.

- **Access**: `super_admin` only
- **Response `204 No Content`**

---

## 7. WhatsApp Marketing Campaigns Endpoints (Phase 5)

### 7.1 Campaigns

#### `GET /campaigns`
Retrieve WhatsApp campaigns with branch scoping and status filtering.

- **Access**: Authenticated (`super_admin`, `branch_user`)
- **Branch Rule**: `branch_user` only sees campaigns that were released to their branch (read-only reports).
- **Query Parameters**:
  - `branchId` (string, optional)
  - `status` (string, optional): `all` | `draft` | `scheduled` | `sent` | `failed`
  - `search` (string, optional)
- **Response `200 OK`**: Array of `Campaign` objects.

#### `GET /campaigns/{id}`
Retrieve a single campaign by ID with statistics and branch delivery breakdown.

- **Access**: Authenticated (`super_admin`, `branch_user`)
- **Response `200 OK`**: Returns `Campaign` object.

#### `GET /campaigns/stats`
Retrieve aggregated campaign KPI statistics (Total, Messages Sent, Delivered %, Read %, Failed).

- **Access**: Authenticated (`super_admin`, `branch_user`)
- **Query Parameters**:
  - `branchId` (optional)
- **Response `200 OK`**:
```json
{
  "total": 12,
  "sent": 23510,
  "delivered": 97.4,
  "read": 84.2,
  "failed": 210
}
```

#### `POST /campaigns/audience-preview`
Evaluate live audience size for selected branches and segment rules.

- **Access**: Authenticated (`super_admin`, `branch_user`)
- **Request Body**:
```json
{
  "branchSelection": {
    "branch_1": true,
    "branch_2": true,
    "branch_3": false,
    "branch_4": false
  },
  "segmentId": "seg_1"
}
```
- **Response `200 OK`**:
```json
{
  "branchCounts": {
    "branch_1": 4200,
    "branch_2": 2800,
    "branch_3": 0,
    "branch_4": 0
  },
  "totalAudience": 7000,
  "excludedNoConsent": 450,
  "excludedOptedOut": 62,
  "excludedInvalid": 18
}
```

#### `POST /campaigns`
Create a new campaign draft.

- **Access**: `super_admin` (and `branch_user` if enabled by admin settings for their own branch only)
- **Request Body**: Partial `Campaign` definition.
- **Response `201 Created`**: Returns created `Campaign`.

#### `POST /campaigns/{id}/send`
Execute immediate broadcast of an approved campaign to all switched ON branches. Only recipients with valid marketing consent and no opt-out are queued.

- **Access**: `super_admin`
- **Response `200 OK`**: Returns updated `Campaign` with status `Sending`.

#### `POST /campaigns/{id}/schedule`
Schedule an approved campaign for automatic release at a future datetime.

- **Access**: `super_admin`
- **Request Body**:
```json
{
  "scheduledAt": "2025-12-01T10:00:00Z"
}
```
- **Response `200 OK`**: Returns updated `Campaign` with status `Scheduled`.

#### `POST /campaigns/{id}/cancel`
Cancel a scheduled campaign release, returning it to `Draft`.

- **Access**: `super_admin`
- **Response `200 OK`**: Returns updated `Campaign`.

#### `POST /campaigns/{id}/retry-failed`
Retry message delivery for recipients that failed with transient provider errors.

- **Access**: `super_admin`
- **Response `200 OK`**:
```json
{
  "retriedCount": 24,
  "status": "processing"
}
```

#### `GET /campaigns/{id}/messages`
Retrieve detailed recipient delivery logs for a specific campaign.

- **Access**: Authenticated (`super_admin`, `branch_user`)
- **Query Parameters**:
  - `status` (optional): `all` | `delivered` | `read` | `failed` | `queued`
- **Response `200 OK`**: Array of `CampaignMessage` objects.

### 7.2 Campaign Settings

#### `GET /settings/campaigns`
Retrieve global WhatsApp campaign policies (allow branch campaigns, quiet hours).

- **Access**: `super_admin`
- **Response `200 OK`**: `CampaignSettings` object.

#### `PATCH /settings/campaigns`
Update campaign policies.

- **Access**: `super_admin`
- **Response `200 OK`**: Updated `CampaignSettings` object.

### 7.3 Backend-Only Webhooks (Documentation for Backend Team)

#### `POST /webhooks/whatsapp`
Receives asynchronous inbound status receipts (`sent`, `delivered`, `read`, `failed`) and customer replies from Meta WhatsApp Cloud API.
- Customer replies with `STOP` or `UNSUBSCRIBE` must automatically set `opted_out_at` on the matching customer record and immediately exclude them from future broadcast audiences.
- Inbound messages are routed to `/chatbot` customer conversation threads.
- Outbound WhatsApp messages must be throttled according to Meta account messaging tiers (1K, 10K, 100K per 24 hours).


---

## 8. Lead Generation Endpoints (Phase 6)

### 8.1 Leads Management

#### `GET /leads`
Retrieve paginated list of leads with filtering by branch, stage, priority, source, follow-up status, and full-text search.
- **Access**: Authenticated (`super_admin`, `branch_user`)
- **Branch Rule**: `branch_user` is strictly scoped to their assigned `branch_id`. `super_admin` can filter by `branch_id` or view all branches.
- **Query Parameters**:
  - `page` (integer, default: 1): 1-based page index
  - `pageSize` (integer, default: 20): items per page
  - `branch_id` (string, optional): Branch identifier (`branch_1`, etc.)
  - `stage` (string, optional): `new` | `in_progress` | `follow_up` | `converted` | `lost` | `all`
  - `priority` (string, optional): `high` | `medium` | `low` | `all`
  - `source` (string, optional): `website_chat` | `whatsapp` | `walk_in` | `instagram` | `referral` | `phone_call` | `all`
  - `follow_up` (string, optional): `overdue` | `today` | `this_week` | `all`
  - `search` (string, optional): Search query matching customer name, phone, enquiry, ID
  - `show_lost` (boolean, optional, default: false)
- **Response `200 OK`**:
```json
{
  "items": [
    {
      "id": "L-3823",
      "customer_name": "Amit Joshi",
      "phone": "+919833344556",
      "enquiry": "Store location and timing for weekend visit. Looking for executive formal blazers.",
      "branch_id": "branch_1",
      "stage": "new",
      "priority": "medium",
      "source": "whatsapp",
      "interest_tags": ["Formal Wear", "Blazers", "Store Info"],
      "follow_up_date": "2026-11-21",
      "consent_whatsapp": true,
      "ai_summary": {
        "category": "store_info",
        "suggested_priority": "medium",
        "bullets": [
          "Requested location pin and weekend store timings for Rajahmundry branch",
          "Looking for slim-fit blazer options for business conference"
        ],
        "generated_at": "2026-11-21T08:30:00Z"
      },
      "notes": [],
      "activities": [
        {
          "id": "la_004",
          "type": "created",
          "description": "Lead created via WhatsApp Business API inbound",
          "user_name": "System",
          "created_at": "2026-11-21T08:30:00Z"
        }
      ],
      "created_at": "2026-11-21T08:30:00Z",
      "updated_at": "2026-11-21T08:30:00Z"
    }
  ],
  "total": 60,
  "page": 1,
  "pageSize": 20,
  "totalPages": 3
}
```

#### `GET /leads/counts`
Retrieve counts per stage for the current user's branch scope.
- **Access**: Authenticated (`super_admin`, `branch_user`)
- **Query Parameters**:
  - `branch_id` (optional): Filter counts by branch
- **Response `200 OK`**:
```json
{
  "total": 60,
  "new": 13,
  "in_progress": 8,
  "follow_up": 4,
  "converted": 5,
  "lost": 30
}
```

#### `GET /leads/{id}`
Retrieve a single lead with complete notes timeline, AI classification, and audit activity history.
- **Access**: Authenticated (`super_admin`, `branch_user`)
- **Branch Rule**: `branch_user` cannot access leads belonging to other branches (`403 Forbidden`).
- **Response `200 OK`**: Returns `Lead` object.

#### `POST /leads`
Create a new lead manually from store walk-in, phone, or referral.
- **Access**: Authenticated (`super_admin`, `branch_user`)
- **Branch Rule**: `branch_user` can only create leads for their own branch. `super_admin` can assign any branch. If no branch is provided, the backend auto-assigns: (1) preferred branch, (2) branch of an existing customer with matching phone, (3) fallback to `branch_1` (Rajahmundry Main).
- **Request Body**:
```json
{
  "customer_name": "Karthik Raja",
  "phone": "+919876577889",
  "enquiry": "Italian fabric formal blazers for reception cocktail.",
  "preferred_branch_id": "branch_3",
  "interest_tags": ["Italian Blazer", "Cocktail", "Formal"],
  "source": "referral",
  "priority": "high",
  "follow_up_date": "2026-11-22",
  "consent_whatsapp": true
}
```
- **Response `201 Created`**: Returns created `Lead` object with generated ID (e.g. `L-3861`).

#### `PATCH /leads/{id}`
Update lead profile, interest tags, follow-up date, or priority.
- **Access**: Authenticated (`super_admin`, `branch_user`)
- **Response `200 OK`**: Returns updated `Lead` object.

#### `PATCH /leads/{id}/stage`
Update lead lifecycle stage (e.g. dragging between Kanban columns).
- **Access**: Authenticated (`super_admin`, `branch_user`)
- **Request Body**:
```json
{
  "stage": "lost",
  "lost_reason": "price",
  "lost_notes": "Customer budget below entry range"
}
```
- **Response `200 OK`**: Returns updated `Lead` object with logged stage change activity.

#### `POST /leads/{id}/notes`
Add a timestamped consultation note or interaction log to a lead.
- **Access**: Authenticated (`super_admin`, `branch_user`)
- **Request Body**:
```json
{
  "content": "Customer visited store with groom for sizing trial."
}
```
- **Response `201 Created`**: Returns created `LeadNote` object.

#### `POST /leads/{id}/convert`
Convert lead to `converted` stage and optionally provision a customer profile.
- **Access**: Authenticated (`super_admin`, `branch_user`)
- **Request Body**:
```json
{
  "addToCustomers": true
}
```
- **Response `200 OK`**:
```json
{
  "lead": {
    "id": "L-3816",
    "stage": "converted",
    "converted_customer_id": "c_003"
  },
  "customerCreated": true
}
```
*Note*: If a customer profile with this phone number already exists, it is linked to `converted_customer_id` without creating duplicates.

#### `POST /leads/{id}/ai-classify`
Re-analyze lead inquiry and tags with AI model to generate updated category, suggested priority, and bullet points.
- **Access**: Authenticated (`super_admin`, `branch_user`)
- **Response `200 OK`**: Returns `LeadAISummary` object.


---

## 9. AI Chatbot & Knowledge Base Endpoints (Phase 7)

### 9.1 Staff Inbox & Conversations

#### `GET /conversations`
Retrieve conversations list with status, branch, and search filtering.
- **Access**: Authenticated (`super_admin`, `branch_user`)
- **Branch Rule**: `branch_user` is strictly scoped to conversations mapped to their assigned `branch_id`. `super_admin` can filter by `branch_id` or view all branches.
- **Query Parameters**:
  - `status` (string, optional): `all` | `open` | `pending` | `closed`
  - `branch_id` (string, optional)
  - `search` (string, optional): Customer name, phone, message content
- **Response `200 OK`**:
```json
[
  {
    "id": "conv_1",
    "customer_name": "Vikram Singh",
    "customer_phone": "+919988766554",
    "channel": "instagram",
    "branch_id": "branch_1",
    "status": "open",
    "unread_count": 0,
    "ai_paused": false,
    "last_message": "Do you have a store near me?",
    "last_message_at": "2026-11-21T10:46:00Z",
    "interest_tags": ["Store Locator"],
    "linked_lead_id": null,
    "context_bullets": [
      "Customer asked for nearest store address in AP",
      "Sent location map and branch opening hours"
    ]
  }
]
```

#### `GET /conversations/{id}/messages`
Retrieve message history for a conversation thread.
- **Access**: Authenticated (`super_admin`, `branch_user`)
- **Response `200 OK`**:
```json
[
  {
    "id": "msg_101",
    "conversation_id": "conv_1",
    "sender": "customer",
    "text": "Do you have a store near me?",
    "created_at": "2026-11-21T10:45:00Z"
  },
  {
    "id": "msg_102",
    "conversation_id": "conv_1",
    "sender": "ai",
    "text": "Our flagship store is located at Main Road, Rajahmundry, with branches in Anna Nagar, Kakinada, and Vijayawada.",
    "created_at": "2026-11-21T10:46:00Z"
  }
]
```

#### `POST /conversations/{id}/messages`
Send staff reply message. Calling this endpoint automatically sets `ai_paused: true` (switches to human mode) so AI bot does not interfere with staff conversation.
- **Access**: Authenticated (`super_admin`, `branch_user`)
- **Request Body**:
```json
{
  "text": "Hello! I am Rajesh from Rajahmundry store. We have 3-piece suits available in size 42."
}
```
- **Response `201 Created`**: Returns created `ChatMessage`.

#### `PATCH /conversations/{id}`
Update conversation status (`open`, `pending`, `closed`), assigned branch, or resume AI bot (`ai_paused: false`).
- **Access**: Authenticated (`super_admin`, `branch_user`)
- **Request Body**:
```json
{
  "status": "closed",
  "ai_paused": false
}
```
- **Response `200 OK`**: Updated `ChatConversation`.

#### `POST /conversations/{id}/create-lead`
Create a CRM Lead from conversation context (name, phone, branch, interest tags, enquiry summary).
- **Access**: Authenticated (`super_admin`, `branch_user`)
- **Response `200 OK`**:
```json
{
  "lead_id": "L-3862",
  "conversation_id": "conv_1"
}
```

### 9.2 Knowledge Base Management (Super Admin only)

#### `GET /kb-articles`
Retrieve approved knowledge base articles.
- **Access**: `super_admin`

#### `POST /kb-articles`
Create new knowledge base article with keywords and branch scope.
- **Access**: `super_admin`

#### `PATCH /kb-articles/{id}`
Update article title, content, keywords, or active status.
- **Access**: `super_admin`

#### `DELETE /kb-articles/{id}`
Delete a knowledge base article.
- **Access**: `super_admin`

### 9.3 Public Website Chat Widget Endpoints (No Login Required)

#### `POST /public/chat/start`
Initialize public widget chat session with visitor details and consent.
- **Access**: Public
- **Request Body**:
```json
{
  "name": "Ramesh Varma",
  "phone": "+919876543210",
  "branch_id": "branch_1",
  "consent": true
}
```
- **Response `200 OK`**:
```json
{
  "conversationId": "conv_web_1732174000",
  "welcomeMessage": {
    "id": "msg_welcome_1",
    "sender": "ai",
    "text": "Hello! Welcome to RS Mens World. How can I help you find the perfect outfit today?"
  }
}
```

#### `POST /public/chat/{id}/message`
Send customer message from website widget. The backend AI engine answers from approved Knowledge Base articles or initiates staff handover.
- **Access**: Public
- **Rules**:
  1. AI answers strictly from approved KB articles.
  2. Questions inquiring about live stock, price lock, or urgent delivery will never guarantee inventory hold; an immediate handover to store staff is offered.
  3. Messages with "Talk to staff" or "human" mark conversation status as `pending` and notify branch staff.
- **Response `200 OK`**:
```json
{
  "customerMsg": { "id": "msg_c_1", "text": "What are your timings?" },
  "aiMsg": { "id": "msg_a_1", "text": "All RS Mens World stores are open 7 days a week: Monday to Sunday: 10:00 AM to 9:30 PM." }
}
```

#### Real-Time Sync Specification
- **WebSocket / SSE Channel**: `/ws/conversations`
- Emits event `conversation_updated` whenever customer, AI, or staff posts a new message, allowing 0-delay real-time synchronization between the public widget and staff inbox.


---

## 10. Dashboard & Reports Endpoints (Phase 8)

### 10.1 Dashboard

#### `GET /dashboard/summary`
Retrieve real-time business and engagement KPIs (Total Customers, New Customers, Opted-in %, Campaigns Sent, Delivered %, Read %, New Leads, Lead Conversion %, Open Chats, Pending Handovers).
- **Access**: Authenticated (`super_admin`, `branch_user`)
- **Branch Rule**: `branch_user` summary counts are strictly computed over their assigned branch's data.
- **Query Parameters**:
  - `branch_id` (string, optional)
  - `date_range` (string, optional): `today` | `yesterday` | `7days` | `this_month` | `custom`
- **Response `200 OK`**:
```json
{
  "total_customers": 200,
  "new_customers": 50,
  "opted_in_pct": 86,
  "campaigns_sent": 8,
  "messages_delivered_pct": 96,
  "messages_read_pct": 78,
  "new_leads": 60,
  "lead_conversion_pct": 25,
  "open_chats": 8,
  "pending_handovers": 3
}
```

#### `GET /dashboard/charts`
Retrieve formatted series for dashboard Recharts visualizations.
- **Access**: Authenticated (`super_admin`, `branch_user`)
- **Query Parameters**: `branch_id`, `date_range`
- **Response `200 OK`**:
```json
{
  "messagesTrend": [
    { "date": "Nov 21", "sent": 1950, "delivered": 1890, "read": 1530 }
  ],
  "leadsByStage": [
    { "stage": "New", "count": 13, "fill": "#0EA5E9" }
  ],
  "leadsBySource": [
    { "name": "Website Chat", "value": 18, "fill": "#0F4C3A" }
  ],
  "customersByBranch": [
    { "branch": "Rajahmundry", "customers": 65, "fill": "#0F4C3A" }
  ],
  "chatVolumeByDay": [
    { "day": "Mon", "volume": 28 }
  ]
}
```

### 10.2 Reports & Exports

#### `GET /reports/{type}`
Where `{type}` is `campaigns` | `customers` | `leads` | `chats`.
Retrieve tabular analytics with date range and branch scoping.
- **Access**: Authenticated (`super_admin`, `branch_user`)
- **Branch Rule**: `branch_user` receives data for their assigned branch only.
- **Query Parameters**:
  - `branch_id` (string, optional)
  - `date_range` (string, optional)
  - `format` (string, optional): `json` (default) or `csv`
- **Response `200 OK`**: Array of report objects, or direct CSV download when `format=csv` (encoded in UTF-8 with BOM `\uFEFF`).


---

## 11. Settings, Audit Log & Notifications Endpoints (Phase 9)

### 11.1 Settings

#### `GET /settings`
Retrieve business profile, campaign dispatch constraints, and integration health statuses.
- **Access**: Super Admin only (`super_admin`)
- **Response `200 OK`**:
```json
{
  "business_profile": {
    "name": "RS Mens World",
    "tagline": "Multi-Branch Retail & Premium Menswear",
    "support_phone": "+91 98490 12345",
    "support_email": "care@rsmensworld.com",
    "website": "https://rsmensworld.com",
    "address": "Main Road, Danavaipeta, Rajahmundry, Andhra Pradesh 533103"
  },
  "campaign_settings": {
    "allow_branch_campaigns": false,
    "quiet_hours_enabled": true,
    "quiet_hours_start": "21:00",
    "quiet_hours_end": "09:00",
    "default_consent_source": "petpooja_pos"
  },
  "whatsapp_connection": {
    "status": "connected",
    "phone_number": "+91 98490 12345",
    "display_name": "RS Mens World Official",
    "verified": true,
    "tier": "Tier 2 (50k msgs/day)"
  },
  "ai_provider": {
    "status": "connected",
    "provider_name": "Anthropic Claude / Google Gemini",
    "model_name": "Gemini 1.5 Pro & Claude 3.5 Sonnet Hybrid",
    "guardrail_strictness": "high"
  }
}
```

#### `PATCH /settings`
Update business identity, quiet hours, or campaign rules.
- **Access**: Super Admin only (`super_admin`)
- **Request Body**: Partial `PlatformSettings` JSON.
- **Response `200 OK`**: Updated `PlatformSettings` object.

#### `POST /settings/reset-demo-data`
Clear temporary demonstration storage and reseed default factory records for evaluation.
- **Access**: Super Admin only (`super_admin`)
- **Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Demo data restored to initial factory seed"
}
```

### 11.2 Audit Log

#### `GET /audit-logs`
Retrieve tamper-evident event log of administrative, marketing, and customer changes.
- **Access**: Super Admin only (`super_admin`). Branch users receive 403 Forbidden.
- **Query Parameters**:
  - `branch_id` (string, optional)
  - `action` (string, optional)
  - `entity` (string, optional)
  - `search` (string, optional)
  - `page` (number, default: 1)
  - `pageSize` (number, default: 20)
- **Response `200 OK`**:
```json
{
  "items": [
    {
      "id": "AUD-901",
      "user_id": "user_1",
      "user_name": "Bala (Super Admin)",
      "user_role": "super_admin",
      "action": "campaign_send",
      "entity": "campaigns",
      "entity_id": "CMP-101",
      "branch_id": "branch_1",
      "branch_name": "Rajahmundry Main",
      "details": "Executed broadcast \"Winter Collection Launch\" targeting 2 branches",
      "created_at": "2026-11-21T10:15:00.000Z"
    }
  ],
  "total": 7,
  "page": 1,
  "pageSize": 20,
  "totalPages": 1
}
```

### 11.3 Notifications

#### `GET /notifications`
Retrieve unread alerts for lead follow-ups due, pending AI handovers, campaign completions, and import batch results.
- **Access**: Authenticated (`super_admin`, `branch_user`)
- **Branch Rule**: `branch_user` alerts are strictly filtered to their branch.
- **Response `200 OK`**:
```json
[
  {
    "id": "notif_lead_L-3801",
    "title": "Follow-up Due: Rajesh Kumar",
    "description": "Wedding sherwani inquiry • branch_1",
    "type": "lead_followup",
    "read": false,
    "link": "/leads",
    "created_at": "2026-11-21T09:30:00.000Z"
  }
]
```

#### `PATCH /notifications/{id}/read`
Mark a single notification as read.
- **Access**: Authenticated
- **Response `200 OK`**: `{ "status": "ok" }`

