# Technical Design v0.1: Cloudflare-First MVP

## Purpose

This document is the implementation baseline for the Spot Sign MVP. It assumes Cloudflare Free as the deployment target and is intended to guide RD work across frontend, backend, database, storage, and authentication.

## Locked Decisions In v0.1

- One SvelteKit codebase for web UI and API.
- Cloudflare Workers runtime.
- Cloudflare D1 for application data.
- Cloudflare R2 for photo storage.
- Drizzle as the schema and query layer.
- Leaflet with OpenStreetMap for GIS.
- Self-managed email/password login with session cookies.

## Tech Stack

- Frontend: SvelteKit + Svelte 5 + Tailwind CSS
- Adapter: adapter-cloudflare
- Runtime: Cloudflare Workers
- Database: Cloudflare D1
- Storage: Cloudflare R2
- ORM: Drizzle
- Testing: Vitest + Playwright

## Domain Model Draft

### users

- id
- email
- password_hash
- name
- role
- status
- created_at
- updated_at

### sessions

- id
- user_id
- token_hash
- expires_at
- created_at
- last_seen_at

### restaurants

- id
- name
- contact_name
- status
- notes
- latitude
- longitude
- address_text
- assigned_user_id
- created_by_user_id
- last_report_at
- created_at
- updated_at

### visit_reports

- id
- restaurant_id
- user_id
- contact_name
- status
- notes
- photo_key
- visited_at
- created_at

### assignment_histories

- id
- restaurant_id
- from_user_id
- to_user_id
- assigned_by_user_id
- assigned_at

## Role Model

- rep
- supervisor

## Status Model

- new_lead
- visited
- in_discussion
- awaiting_signature
- signed
- not_pursuing

## API Draft

### Auth

- POST /api/auth/login
- POST /api/auth/logout
- GET /api/me

### Restaurants

- GET /api/restaurants
- POST /api/restaurants
- GET /api/restaurants/:id
- PATCH /api/restaurants/:id

### Reports

- POST /api/restaurants/:id/reports
- GET /api/reports

### Users

- GET /api/users

### Assignments

- POST /api/restaurants/:id/assign

### Uploads

- POST /api/uploads/photo

## Request Flows

### Login

1. User submits credentials.
2. API validates email, account status, and password hash.
3. API stores a session record in D1.
4. API returns a secure session cookie.

### Nearby Restaurants

1. Frontend gets current location from the browser.
2. Frontend requests restaurants with lat, lng, and radius.
3. API applies a simplified nearby query using bounding box filtering and distance refinement.
4. Frontend renders status-based markers.

### Photo Upload

1. Frontend submits one file to the upload endpoint.
2. API validates file size, type, and user session.
3. API writes the file to R2.
4. API returns a photo key for report submission.

### Report Submission

1. Frontend submits restaurant report payload.
2. API writes a visit report to D1.
3. API updates restaurant summary fields, including status and last report time.

### Supervisor Assignment

1. Supervisor selects a restaurant and a target rep.
2. API validates supervisor role.
3. API updates restaurant ownership.
4. API appends assignment history.

## Security Requirements

- Use secure password hashing.
- Store only hashed session tokens in D1.
- Protect cookies with httpOnly, secure, and sameSite.
- Validate all write payloads on the server.
- Restrict supervisor actions through role guards.
- Keep R2 credentials server-side only.

## Cloudflare Constraints

- No Node-only packages in the runtime path.
- No long-running background jobs in MVP.
- No heavy image processing pipeline.
- No PostGIS-dependent query design.

## Implementation Phases

### Phase 1: Platform Baseline

- Add adapter-cloudflare.
- Define Worker bindings for D1 and R2.
- Add Drizzle configuration and migration flow.

### Phase 2: Auth

- Implement users and sessions schema.
- Implement login, logout, and current-user endpoints.
- Add session guard and supervisor guard.

### Phase 3: Restaurant And Report Workflows

- Implement restaurants schema and nearby lookup.
- Implement create restaurant.
- Implement photo upload to R2.
- Implement report submission.

### Phase 4: Supervisor Workflows

- Implement user list lookup.
- Implement report list lookup.
- Implement assignment endpoint and history storage.

### Phase 5: Validation And Deployment

- Add unit and end-to-end test coverage.
- Validate mobile flows.
- Validate deployment against Cloudflare bindings.

## Verification Checklist

1. Login and logout work with secure cookies.
2. Nearby restaurants load from current location.
3. New restaurant creation persists and appears on the map.
4. One image upload succeeds and the report can reference it.
5. Supervisors can view all users and all reports.
6. Supervisors can assign one owner per restaurant.
7. The application can read and write D1 and R2 when deployed on Cloudflare.

## Items For Iteration

- Decide whether session last_seen_at should be updated on every request or only on meaningful activity.
- Decide whether R2 photo URLs will be public or protected.
- Decide whether account disablement, password reset, and first-login password change are required in MVP.
- Decide the initial city or district and default map center.
