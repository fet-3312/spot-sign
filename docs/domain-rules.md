# Domain Rules: Status, Assignment, Import, And Media

## Purpose

This document defines the MVP business rules that RD and QA must treat as implementation constraints.

## Status Model

### Status Definitions

- new_lead: restaurant is identified but no meaningful conversation has happened yet
- visited: on-site or direct outreach happened, but no active negotiation exists yet
- in_discussion: the restaurant is actively discussing commercial terms or next steps
- awaiting_signature: verbal alignment exists and signature is the next expected step
- signed: contract is signed
- not_pursuing: the team intentionally stops follow-up for now

### Allowed Transitions

- new_lead -> visited
- new_lead -> in_discussion
- new_lead -> not_pursuing
- visited -> in_discussion
- visited -> awaiting_signature
- visited -> not_pursuing
- in_discussion -> awaiting_signature
- in_discussion -> signed
- in_discussion -> not_pursuing
- awaiting_signature -> signed
- awaiting_signature -> in_discussion
- awaiting_signature -> not_pursuing
- signed -> in_discussion
- not_pursuing -> new_lead
- not_pursuing -> visited

### Transition Rules

- signed may move back to in_discussion only when a supervisor explicitly allows continued negotiation after a failed or reversed signing outcome.
- not_pursuing is a valid terminal state for normal rep workflows, but supervisors may later reopen the restaurant.
- status changes are driven by visit_reports, not by direct rep edits to restaurant master data.

### Required Fields By Status

- new_lead: notes required on the first visit report when the restaurant is field-created
- visited: visitedAt required
- in_discussion: contactName required and visitedAt required
- awaiting_signature: contactName required and visitedAt required
- signed: contactName required and visitedAt required
- not_pursuing: visitedAt required and notes required with a clear reason

## Assignment Rules

- A restaurant has at most one active assigned owner.
- Unassigned restaurants are visible to reps in nearby discovery.
- Reps may report on unassigned restaurants and restaurants they can open from nearby discovery.
- Reps may not assign or reassign restaurants.
- Supervisors may assign an unassigned restaurant without a reason.
- Supervisors must provide a reassignment reason when changing an existing owner.
- Reassignment uses optimistic concurrency through expectedCurrentAssignedUserId to prevent silent overwrite.

## Restaurant Master-Data Rules

- Restaurant master data includes name, addressText, latitude, longitude, currentStatus, currentContactName, assignedUserId, lastReportId, and lastReportAt.
- Rep-submitted reports may update currentStatus and currentContactName through summary derivation.
- Reps cannot directly edit restaurant master-data after creation.
- Supervisors may correct restaurant master data when they detect bad creation data or import issues.

## CSV Import Rules

### Minimum Format

- Required columns: name, address
- Optional extra columns may be accepted but are ignored in MVP unless explicitly mapped later.

### Import Job Statuses

- processing
- completed
- completed_with_review
- failed

### Review Item Statuses

- pending
- resolved
- rejected

### Review Resolution Actions

- approve_create: create a new restaurant from corrected or proposed values
- merge_existing: link the row to an existing restaurant and do not create a duplicate restaurant
- retry_geocode: rerun address resolution after supervisor correction
- reject_row: mark the row as intentionally discarded

### Import Rules

- Rows that geocode successfully and do not appear to duplicate an existing restaurant can be published directly.
- Rows with failed geocoding must go to review.
- Rows with duplicate candidates must go to review.
- Review actions must be attributable to a supervisor user id and timestamp.

## Media Rules

- Only one photo may be attached to a visit report.
- Accepted file types: JPEG, PNG, WebP.
- Maximum upload size: 10 MB.
- Original files are stored in R2 without server-side transformation in MVP.
- Photo retrieval must go through an authenticated app endpoint that returns a short-lived access URL.
- If upload fails, report submission must not pretend success.

## Default Area Rule

- The app must support a configuration-based default map center and radius for each deployed environment.
- RD may implement development and staging with a configurable demo center before final production coordinates are supplied.

## MVP Operational Rules

- Account creation, disablement, and password reset are operator-managed workflows in MVP, not end-user self-service features.
- First-login password change is out of scope for MVP.
- Reporting exports remain out of scope for MVP.
