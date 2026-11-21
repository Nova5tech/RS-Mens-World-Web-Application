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
