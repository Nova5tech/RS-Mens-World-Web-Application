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
- `401 Unauthorized`: Missing or invalid auth token
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

### 1.5 Branch Tenancy Rule
- Every business record belongs to a specific `branch_id`.
- Users with role `super_admin` can view data for all branches or filter by `branch_id`.
- Users with role `branch_user` can strictly view and manage records matching their assigned `branch_id`. The backend enforces this filtering automatically.

---

## 2. Endpoints (Phase 0)

### 2.1 Branches

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
