# System Architecture: Spot Sign MVP

## Purpose

This document defines the system architecture for the Spot Sign MVP under a Cloudflare-first deployment model. The system must support login, map-based restaurant discovery, report submission, supervisor assignment, CSV import review, and photo upload while keeping the initial operating cost near zero.

## Architecture Goals

- Keep the MVP in a single codebase.
- Minimize deployment and maintenance complexity.
- Stay compatible with Cloudflare Free limits.
- Preserve a clean path to a more capable production architecture later.

## System Context

### Client

- Mobile and desktop browser users.
- Sales reps and supervisors share the same web app.

### Web App

- SvelteKit provides page rendering and API endpoints.
- The same app contains UI and backend orchestration.

### Runtime

- Cloudflare Workers runs the SvelteKit app at the edge.

### Database

- Cloudflare D1 stores users, sessions, restaurants, reports, and assignment history.

### Object Storage

- Cloudflare R2 stores uploaded report photos.

### External Services

- A server-side geocoding provider resolves imported restaurant addresses into coordinates.
- The provider must be isolated behind an adapter so vendor changes do not affect product flows.

### GIS Layer

- Leaflet handles map rendering and interaction.
- OpenStreetMap provides the basemap.
- Browser Geolocation API provides the user location.

## Logical Layers

### Presentation Layer

- SvelteKit routes and components.
- Handles layout, UI state, map interactions, and frontend validation.

### Application Layer

- Server routes act as the API and orchestration layer.
- Enforces session checks, role guards, payload validation, and workflow control.

### Domain Layer

- Core business modules:
  - Auth
  - Restaurants
  - Visit Reports
  - Assignments
  - Imports
  - Uploads

### Data Layer

- D1 holds transactional records.
- R2 holds binary photo objects.
- The app stores only photo keys and metadata in the database.
- D1 also stores import jobs and review items for failed geocodes or duplicate candidates.

## Deployment Topology

- Single SvelteKit deployment to Cloudflare Workers.
- D1 bound to the Worker environment.
- R2 bound to the Worker environment.
- HTTPS and domain routing handled by Cloudflare.

## Primary Flows

### Login Flow

1. User submits email and password.
2. Worker validates account and password hash.
3. Worker creates a session record and returns an httpOnly cookie.

### Nearby Restaurant Flow

1. Frontend gets current location.
2. Frontend requests nearby restaurants using lat, lng, and radius.
3. If geolocation is unavailable, frontend falls back to the configured trial area.
4. Worker reads from D1 and returns marker-ready data.

### CSV Import Review Flow

1. Supervisor uploads a CSV file with restaurant name and address.
2. Worker creates an import job and validates row shape.
3. Worker geocodes each valid row through the geocoding adapter.
4. Worker writes successful rows to restaurants and sends failed or duplicate-like rows to the review queue.
5. Supervisor resolves review items before they become visible on the map.

### Report Submission Flow

1. User selects one photo.
2. Frontend uploads through a controlled Worker endpoint.
3. Worker writes photo to R2.
4. Frontend submits the report payload.
5. Worker writes the visit report and updates restaurant summary fields.
6. Worker preserves historical visit report records as immutable activity history.

### Assignment Flow

1. Supervisor chooses a restaurant and a rep.
2. Worker validates role and ownership rules.
3. If the restaurant already has an owner, Worker requires a reassignment reason and checks for concurrent ownership changes.
4. Worker updates current owner and appends assignment history.

## Data Ownership

- Users table is the source of truth for account identity and role.
- Sessions table is the source of truth for active login state.
- Restaurants table is the source of truth for current ownership and current status.
- Visit reports table is the source of truth for historical field activity.
- Assignment history table is the source of truth for ownership changes.
- Import jobs and review items are the source of truth for CSV intake progress and unresolved import exceptions.
- R2 object storage is the source of truth for photo files.

## Security Model

- Passwords are stored as secure hashes.
- Session cookies must be httpOnly, secure, and sameSite-protected.
- All write APIs require a valid session.
- Supervisor-only APIs require explicit role checks.
- Reps must not be able to read full cross-team report history.
- Supervisor-only APIs must gate restaurant master-data correction, CSV import, and assignment changes.
- Upload APIs must validate file size, type, and naming.
- Storage credentials must never be exposed to the browser.

## Cloudflare-Specific Constraints

- Avoid Node-only runtime assumptions.
- Avoid long-running background jobs in MVP.
- Avoid CPU-heavy image processing.
- Avoid database features that depend on PostGIS or PostgreSQL-specific extensions.
- Implement nearby search using simplified geographic filtering rather than advanced GIS indexes.
- Keep geocoding calls server-side and bounded by explicit quotas or review workflows.

## Scalability Path

### MVP

- Single codebase.
- Single Worker deployment.
- D1 for core data.
- R2 for images.

### Beta

- Add logging, monitoring, and backup strategy.
- Add indexes to improve restaurant lookup and reporting queries.
- Add more explicit audit coverage if needed.

### Production

- Reassess map tile capacity.
- Reassess D1 query patterns and reporting needs.
- Consider separating API responsibilities only when scale justifies it.

## Risks

- Public OpenStreetMap tiles are acceptable for early use but may not be suitable for larger commercial traffic.
- D1 is sufficient for MVP but needs validation against future reporting complexity.
- Authentication choice remains a meaningful operational decision because self-managed credentials increase application-side security responsibility.
- Geocoding quality, quota, and provider terms can directly affect CSV import reliability.
- R2 is suitable for original image storage, but advanced media workflows will need extra infrastructure later.
