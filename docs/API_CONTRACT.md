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
    "timings": "10:00 AM - 9:30 PM",
    "wa_phone_id": "wa_b1_rajahmundry",
    "is_active": true
  },
  {
    "id": "branch_2",
    "code": "B2",
    "name": "Kakinada Branch",
    "city": "Kakinada",
    "address": "Cinema Road, Opposite Bhanu Gudi, Kakinada, AP - 533003",
    "timings": "10:00 AM - 9:30 PM",
    "wa_phone_id": "wa_b2_kakinada",
    "is_active": true
  },
  {
    "id": "branch_3",
    "code": "B3",
    "name": "Vijayawada Branch",
    "city": "Vijayawada",
    "address": "M.G. Road, Governorpet, Vijayawada, AP - 520002",
    "timings": "10:00 AM - 10:00 PM",
    "wa_phone_id": "wa_b3_vijayawada",
    "is_active": true
  },
  {
    "id": "branch_4",
    "code": "B4",
    "name": "Guntur Branch",
    "city": "Guntur",
    "address": "Arundelpet, 4th Lane, Guntur, AP - 522002",
    "timings": "10:00 AM - 9:30 PM",
    "wa_phone_id": "wa_b4_guntur",
    "is_active": true
  }
]
```
