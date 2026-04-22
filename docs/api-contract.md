# API Contract: Spot Sign MVP

## Purpose

This document defines the API contract baseline for RD implementation. It specifies endpoint intent, authorization, request shape, response shape, and main validation rules for the MVP.

## Common Rules

- All API responses use JSON unless explicitly noted.
- All write APIs require an authenticated session cookie.
- Supervisor-only endpoints must return 403 for rep users.
- Validation failures return 400 with a stable error code and field-level details when applicable.
- Unauthorized requests return 401.
- Not found responses return 404.
- Concurrency conflicts return 409.

## Response Envelope

### Success

```json
{
	"ok": true,
	"data": {}
}
```

### Error

```json
{
	"ok": false,
	"error": {
		"code": "VALIDATION_ERROR",
		"message": "Human-readable message",
		"fields": {
			"status": "Status is required"
		}
	}
}
```

## Auth

### POST /api/auth/login

- Auth: public
- Request:

```json
{
	"email": "rep@example.com",
	"password": "plain-text-password"
}
```

- Response data:

```json
{
	"user": {
		"id": "usr_123",
		"name": "Alice",
		"email": "rep@example.com",
		"role": "rep",
		"status": "active"
	}
}
```

- Validation:
  - email required and normalized to lowercase
  - password required
  - inactive users cannot log in

### POST /api/auth/logout

- Auth: authenticated
- Request: empty body
- Response data:

```json
{
	"loggedOut": true
}
```

### GET /api/me

- Auth: authenticated
- Response data:

```json
{
	"user": {
		"id": "usr_123",
		"name": "Alice",
		"email": "rep@example.com",
		"role": "rep",
		"status": "active"
	}
}
```

## Restaurants

### GET /api/restaurants

- Auth: authenticated
- Query:
  - lat: number, required
  - lng: number, required
  - radiusMeters: integer, optional, default 2000, max 5000
  - includeUnassigned: boolean, optional, default true
  - assignedUserId: supervisor only, optional
  - status: optional enum

- Response data:

```json
{
	"items": [
		{
			"id": "rst_123",
			"name": "Cafe One",
			"addressText": "Taipei ...",
			"latitude": 25.033,
			"longitude": 121.565,
			"currentStatus": "visited",
			"currentContactName": "Amy",
			"assignedUser": {
				"id": "usr_456",
				"name": "Bob"
			},
			"lastReportAt": "2026-04-22T08:30:00Z",
			"isOwnedByCurrentUser": false
		}
	]
}
```

- Authorization:
  - reps can query nearby restaurants only
  - supervisors can additionally filter by assignedUserId and status

### POST /api/restaurants

- Auth: authenticated
- Request:

```json
{
	"name": "Cafe One",
	"addressText": "Taipei ...",
	"latitude": 25.033,
	"longitude": 121.565
}
```

- Response data:

```json
{
	"restaurant": {
		"id": "rst_123"
	}
}
```

- Validation:
  - name required, max 120 chars
  - latitude and longitude required
  - addressText optional for field-created restaurants, max 255 chars
  - report fields are not accepted here and must be submitted through POST /api/restaurants/:id/reports

- Authorization:
  - reps and supervisors can create restaurants

### GET /api/restaurants/:id

- Auth: authenticated
- Response data:

```json
{
	"restaurant": {
		"id": "rst_123",
		"name": "Cafe One",
		"addressText": "Taipei ...",
		"latitude": 25.033,
		"longitude": 121.565,
		"currentStatus": "visited",
		"currentContactName": "Amy",
		"assignedUser": {
			"id": "usr_456",
			"name": "Bob"
		},
		"lastReportAt": "2026-04-22T08:30:00Z"
	}
}
```

- Authorization:
  - all authenticated users can access restaurant summary fields through this endpoint
  - report history remains restricted by GET /api/reports rules

### PATCH /api/restaurants/:id

- Auth: supervisor only
- Request:

```json
{
	"name": "Cafe One Updated",
	"addressText": "Taipei ...",
	"latitude": 25.033,
	"longitude": 121.565
}
```

- Response data:

```json
{
	"restaurant": {
		"id": "rst_123",
		"updatedAt": "2026-04-22T08:35:00Z"
	}
}
```

- Validation:
  - only restaurant master-data fields are editable here
  - reps must never be allowed to call this endpoint successfully

## Reports

### POST /api/restaurants/:id/reports

- Auth: authenticated
- Request:

```json
{
	"contactName": "Amy",
	"status": "in_discussion",
	"notes": "Owner asked for a follow-up next week",
	"photoKey": "photos/2026/04/22/uuid.jpg",
	"visitedAt": "2026-04-22T08:30:00Z"
}
```

- Response data:

```json
{
	"report": {
		"id": "rpt_123",
		"restaurantId": "rst_123"
	},
	"restaurantSummary": {
		"currentStatus": "in_discussion",
		"currentContactName": "Amy",
		"lastReportAt": "2026-04-22T08:30:00Z"
	}
}
```

- Validation:
  - status required
  - contactName optional by default but required for statuses listed in domain-rules.md
  - notes optional, max 2000 chars
  - photoKey optional, but only one photo may be referenced
  - visitedAt required

### GET /api/reports

- Auth: authenticated
- Query:
  - restaurantId: optional
  - userId: supervisor only, optional
  - limit: optional, default 20, max 100
  - cursor: optional

- Response data:

```json
{
	"items": [
		{
			"id": "rpt_123",
			"restaurantId": "rst_123",
			"restaurantName": "Cafe One",
			"user": {
				"id": "usr_456",
				"name": "Bob"
			},
			"contactName": "Amy",
			"status": "visited",
			"notes": "Talked to manager",
			"photoKey": "photos/...jpg",
			"visitedAt": "2026-04-22T08:30:00Z",
			"createdAt": "2026-04-22T08:31:00Z"
		}
	],
	"nextCursor": null
}
```

- Authorization:
  - reps can only read their own reports
  - supervisors can read all reports

## Users

### GET /api/users

- Auth: supervisor only
- Response data:

```json
{
	"items": [
		{
			"id": "usr_456",
			"name": "Bob",
			"email": "bob@example.com",
			"role": "rep",
			"status": "active"
		}
	]
}
```

## Assignments

### POST /api/restaurants/:id/assign

- Auth: supervisor only
- Request:

```json
{
	"toUserId": "usr_456",
	"reason": "Redistribute territory after staffing change",
	"expectedCurrentAssignedUserId": "usr_111"
}
```

- Response data:

```json
{
	"assignment": {
		"restaurantId": "rst_123",
		"fromUserId": "usr_111",
		"toUserId": "usr_456",
		"reason": "Redistribute territory after staffing change",
		"assignedAt": "2026-04-22T08:40:00Z"
	}
}
```

- Validation:
  - toUserId required and must be an active rep
  - reason required if the restaurant already has an owner
  - expectedCurrentAssignedUserId required for reassignment and compared for optimistic concurrency control

- Errors:
  - ASSIGNMENT_CONFLICT on owner mismatch returns 409

## Uploads

### POST /api/uploads/photo

- Auth: authenticated
- Request: multipart/form-data with one file field named photo
- Response data:

```json
{
	"photoKey": "photos/2026/04/22/uuid.jpg",
	"contentType": "image/jpeg",
	"size": 512000
}
```

- Validation:
  - allow image/jpeg, image/png, image/webp
  - max 10 MB
  - exactly one file
  - no server-side image transformation in MVP

### GET /api/uploads/photo-access

- Auth: authenticated
- Query:
  - photoKey: required

- Response data:

```json
{
	"accessUrl": "https://example.com/signed-url",
	"expiresAt": "2026-04-22T08:50:00Z"
}
```

- Authorization:
  - reps can access a photo only if it belongs to one of their own reports
  - supervisors can access all report photos

- Validation:
  - photoKey required
  - return 404 if the photo or its parent report does not exist

## Imports

### POST /api/imports/restaurants

- Auth: supervisor only
- Request: multipart/form-data with one file field named file
- CSV minimum columns:
  - name
  - address

- Response data:

```json
{
	"importJob": {
		"id": "imp_123",
		"status": "processing"
	}
}
```

- Validation:
  - reject files other than csv or text/csv
  - reject empty rows
  - accept additional columns but ignore unknown fields in MVP

### GET /api/imports/:id

- Auth: supervisor only
- Response data:

```json
{
	"importJob": {
		"id": "imp_123",
		"sourceFilename": "restaurants.csv",
		"status": "completed_with_review",
		"totalRows": 100,
		"completedRows": 85,
		"failedRows": 15,
		"createdAt": "2026-04-22T08:45:00Z",
		"completedAt": "2026-04-22T08:47:00Z"
	}
}
```

### GET /api/imports/review-items

- Auth: supervisor only
- Query:
  - importJobId: optional
  - resolutionStatus: optional
  - limit: optional, default 20, max 100

- Response data:

```json
{
	"items": [
		{
			"id": "rev_123",
			"importJobId": "imp_123",
			"rawName": "Cafe One",
			"rawAddress": "Taipei ...",
			"geocodeStatus": "failed",
			"geocodeMessage": "Address not found",
			"duplicateCandidateRestaurantId": null,
			"resolutionStatus": "pending"
		}
	]
}
```

### POST /api/imports/review-items/:id/resolve

- Auth: supervisor only
- Request:

```json
{
	"action": "approve_create",
	"correctedName": "Cafe One",
	"correctedAddress": "Taipei ...",
	"correctedLatitude": 25.033,
	"correctedLongitude": 121.565,
	"targetRestaurantId": null
}
```

- Allowed actions:
  - approve_create
  - merge_existing
  - retry_geocode
  - reject_row

- Validation:
  - merge_existing requires targetRestaurantId
  - approve_create requires correctedLatitude and correctedLongitude
  - retry_geocode requires correctedAddress or rawAddress to exist

- Response data:

```json
{
	"reviewItem": {
		"id": "rev_123",
		"resolutionStatus": "resolved"
	}
}
```

## Stable Error Codes

- UNAUTHORIZED
- FORBIDDEN
- VALIDATION_ERROR
- NOT_FOUND
- ASSIGNMENT_CONFLICT
- IMPORT_ROW_INVALID
- IMPORT_REVIEW_REQUIRED
- GEOCODE_FAILED
- FILE_TOO_LARGE
- FILE_TYPE_NOT_ALLOWED
