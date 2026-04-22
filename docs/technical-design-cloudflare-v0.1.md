# Technical Design v0.1: Cloudflare-First MVP

## Purpose

This document is the implementation baseline for the Spot Sign MVP. It assumes Cloudflare Free as the deployment target and is intended to guide RD work across frontend, backend, database, storage, and authentication.

## Current Decisions In v0.1

- One SvelteKit codebase for web UI and API.
- Cloudflare Workers runtime.
- Cloudflare D1 for application data.
- Cloudflare R2 for photo storage.
- Drizzle as the schema and query layer.
- Leaflet with OpenStreetMap for GIS.
- Session-cookie-based authentication in the SvelteKit app.
- Session last_seen_at is updated on login and successful authenticated write operations only.
- Photo access remains protected and must be served through an authenticated app endpoint that returns a short-lived access URL.
- CSV import is part of MVP and must support restaurant name plus address as the minimum seed format.
- Geocoding must be implemented behind a provider adapter so the vendor can be finalized without reshaping application flows.

## Tech Stack

- Frontend: SvelteKit + Svelte 5 + Tailwind CSS
- Adapter: adapter-cloudflare
- Runtime: Cloudflare Workers
- Database: Cloudflare D1
- Storage: Cloudflare R2
- ORM: Drizzle
- Testing: Vitest + Playwright

## Implementation Companion Docs

- API contract: ./api-contract.md
- Domain rules: ./domain-rules.md
- SA decisions: ./sa-decisions-mvp.md

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
- latitude
- longitude
- address_text
- assigned_user_id
- current_status
- current_contact_name
- source_type
- geocode_status
- last_report_id
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
- reason
- assigned_at

### restaurant_import_jobs

- id
- created_by_user_id
- source_filename
- total_rows
- completed_rows
- failed_rows
- status
- created_at
- completed_at

### restaurant_import_review_items

- id
- import_job_id
- raw_name
- raw_address
- geocode_status
- geocode_message
- duplicate_candidate_restaurant_id
- proposed_latitude
- proposed_longitude
- resolution_status
- resolved_by_user_id
- resolved_at
- created_at

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
- GET /api/uploads/photo-access

### Imports

- POST /api/imports/restaurants
- GET /api/imports/:id
- GET /api/imports/review-items
- POST /api/imports/review-items/:id/resolve

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
5. If geolocation is unavailable, frontend retries with the configured default trial area.

### CSV Import And Review

1. Supervisor uploads a CSV containing at least restaurant name and address.
2. API stores an import job and validates row shape.
3. API sends each valid row through the geocoding adapter.
4. Successfully geocoded rows are created as restaurants with source_type set to import.
5. Rows that fail geocoding or appear to be duplicates are written to the review queue instead of being published silently.
6. Supervisor reviews each flagged row and either resolves it to an existing restaurant, corrects it, or approves creation.

### Photo Upload

1. Frontend submits one file to the upload endpoint.
2. API validates file size, type, and user session.
3. API writes the file to R2.
4. API returns a photo key for report submission.

### Photo Access

1. Frontend requests photo access using a stored photo key.
2. API validates session and restaurant/report visibility.
3. API returns a short-lived access URL.

### Report Submission

1. Frontend submits restaurant report payload.
2. API writes a visit report to D1.
3. API updates restaurant summary fields, including current status, current contact name, last report reference, and last report time.
4. Historical visit report records remain immutable after write.

### Supervisor Assignment

1. Supervisor selects a restaurant and a target rep.
2. API validates supervisor role and requires a reassignment reason when the restaurant already has an owner.
3. API checks the current ownership version to prevent silent overwrite.
4. API updates restaurant ownership.
5. API appends assignment history with previous owner, new owner, actor, and reason.

## Security Requirements

- Use secure password hashing.
- Store only hashed session tokens in D1.
- Protect cookies with httpOnly, secure, and sameSite.
- Validate all write payloads on the server.
- Restrict supervisor actions through role guards.
- Restrict cross-team report history so reps can access only their own submitted reports unless explicitly elevated.
- Restrict restaurant master-data correction APIs to supervisors.
- Protect photo retrieval through authenticated access checks and short-lived URLs.
- Keep R2 credentials server-side only.

## Cloudflare Constraints

- No Node-only packages in the runtime path.
- No long-running background jobs in MVP.
- No heavy image processing pipeline.
- No PostGIS-dependent query design.
- Default map center and radius must be environment-configurable.

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
- Implement default-area fallback when geolocation is unavailable.

### Phase 4: Supervisor Workflows

- Implement user list lookup.
- Implement report list lookup.
- Implement assignment endpoint and history storage.
- Implement CSV import, geocoding adapter, and review queue.
- Enforce reassignment reason capture and ownership conflict checks.

### Phase 5: Validation And Deployment

- Add unit and end-to-end test coverage.
- Validate mobile flows.
- Validate deployment against Cloudflare bindings.

## Verification Checklist

1. Login and logout work with secure cookies.
2. Nearby restaurants load from current location.
3. Nearby restaurants still load when geolocation is denied by falling back to the default trial area.
4. New restaurant creation persists and appears on the map.
5. One image upload succeeds and the report can reference it.
6. Reps can see nearby restaurant summaries and their own reports but cannot access full cross-team report history.
7. Supervisors can view all users and all reports.
8. Reassigning an already owned restaurant requires a reason and produces an assignment history record.
9. CSV import can create restaurants from rows with name and address, while duplicate or failed-geocode rows are routed to supervisor review.
10. The application can read and write D1 and R2 when deployed on Cloudflare.

## Items For Iteration

- Finalize the concrete geocoding vendor account and quota alert threshold.
