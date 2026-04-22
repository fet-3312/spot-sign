# PRD: Field Sales Restaurant Signing MVP

## Overview

This document defines the MVP product requirements for a Salesforce-like field sales web application used to track restaurant signing progress. The product helps sales reps discover nearby restaurants on a map, submit visit updates in the field, and allows supervisors to review progress and assign restaurants to specific reps.

This MVP is designed for fast validation with a small internal team and mobile-first usage.

## Product Goals

- Give sales reps a map-first workflow to reduce field reporting friction.
- Give supervisors a clear operational view of rep activity and restaurant ownership.
- Validate the flow, fields, and mobile interaction model before expanding into a larger production system.

## Users

### Sales Rep

- View nearby restaurants from current location.
- Open a restaurant report page from the map.
- Update contract status, contact person, notes, and upload one photo.
- Create a new restaurant when a location is missing from the map.

### Supervisor

- View all employees.
- View all report history.
- Assign a restaurant to a specific sales rep from a map or list workflow.

## Success Metrics

- A sales rep can reach the report flow from the map in three steps or fewer.
- A single field report can be submitted on mobile in under one minute.
- A supervisor can assign a restaurant and immediately confirm the assignee.
- Each restaurant clearly shows status, last report time, and current owner.

## In Scope

- Map-first home page with nearby restaurant markers.
- Marker detail summary and transition to report page.
- Report fields: restaurant name, contact person, status, notes, one photo.
- New restaurant creation with captured location.
- CSV import of restaurant name and address as the minimum bulk seeding workflow.
- Supervisor employee list and global report visibility.
- Supervisor restaurant assignment to a single rep.
- Mobile-first UI with desktop compatibility.
- Backend APIs and data persistence required to support the above workflows.

## Out Of Scope

- Multiple photos per report.
- Offline reporting and background sync.
- Address search and navigation integration.
- Heatmaps, advanced GIS layers, or route planning.
- Export reporting.
- Admin role and multi-owner restaurant assignment.
- Notifications, background jobs, and workflow automation.

## User Stories

1. As a sales rep, I want to open the app and immediately see nearby restaurants so I can choose where to visit.
2. As a sales rep, I want to open a report page directly from a map marker so I can report quickly.
3. As a sales rep, I want to update status, contact, notes, and attach one photo from the field.
4. As a sales rep, I want to add a missing restaurant when I find a new location.
5. As a supervisor, I want to review all rep activity so I can monitor progress.
6. As a supervisor, I want to assign a restaurant to one rep so ownership is clear.

## Core Flows

### Rep Reporting Flow

Open app -> allow location -> view nearby markers -> tap marker -> review summary -> open report page -> submit update.

### Rep New Restaurant Flow

Open app -> choose add restaurant -> use current location or tap map -> enter base information -> create restaurant -> enter report.

### Supervisor Assignment Flow

Open supervisor view -> inspect employees and restaurants -> choose restaurant -> choose rep -> confirm assignment.

### Supervisor Review Flow

Open supervisor view -> filter by rep or restaurant status -> review latest activity and ownership.

## Functional Requirements

- The default landing page is a map view.
- The app must request browser geolocation and fall back to a default area when unavailable.
- The default area must be configurable by environment and not hardcoded into the frontend build.
- Restaurant markers must use visual status distinctions.
- Marker summaries must show at least restaurant name, current status, assigned rep, and last report time.
- The report page must support editing restaurant name, contact person, status, notes, and one photo.
- New restaurant creation must store latitude and longitude.
- The system must support CSV import with restaurant name and address as the minimum required columns.
- Imported restaurants must be geocoded before they are shown on the map, and records that fail geocoding must be reviewable by a supervisor.
- Supervisors must be able to see all reports.
- Sales reps must not be able to read full cross-team report history.
- Assignment must enforce a single active owner per restaurant.
- Reassignment of an already assigned restaurant must require a reason.
- Assignment history must be preserved even if the UI initially shows only current ownership.

## Data Intake Strategy

- Field creation is the primary source of new restaurant records during MVP.
- CSV import is the minimum bulk onboarding workflow for trial data and legacy lists.
- CSV import must support at least restaurant name and address.
- Duplicate handling does not need full automated matching in MVP, but the system must prevent silent duplicate creation during import and flag possible duplicates for review.

## Access And Ownership Rules

- Sales reps can view nearby restaurants on the map, open assigned or unassigned restaurants, and submit visit reports.
- Sales reps can create a new restaurant only when no reasonable nearby match exists on the map.
- Sales reps can view the current summary of nearby restaurants and their own submitted reports, but cannot view full cross-team report history.
- Sales reps cannot reassign restaurant ownership or directly edit restaurant master data after creation.
- Supervisors can view all restaurants, all employees, all reports, and all assignment history.
- Supervisors can assign or reassign a restaurant to exactly one active sales rep and can correct restaurant master data when needed.
- Unassigned restaurants are visible to sales reps for discovery, but assignment determines the current owner shown in supervisor views and operational reporting.
- Assignment changes must record who changed the owner, when it changed, and the previous and new owner.
- Reassignment of an already assigned restaurant must capture a reassignment reason for auditability.

## Data Ownership Model

- Restaurant stores master data and current operational state, including restaurant name, location, current assignee, and current derived status.
- VisitReport stores each field interaction as an immutable activity record, including submitted contact person, status update, notes, photo, reporter, and timestamp.
- A sales rep report can propose updated contact or status information, but it must not overwrite historical VisitReport records.
- The latest valid VisitReport can update the restaurant's current derived status, but historical reports must remain unchanged.
- AssignmentHistory stores ownership changes independently from VisitReport so reassignment remains auditable.

## Failure And Edge Cases

- If geolocation is denied or unavailable, the app must load a default trial area and still allow reporting.
- If photo upload fails, the user must receive an explicit error and be able to retry before final submission.
- If network quality is poor, submission failure must be clearly surfaced and must not appear as a successful report.
- If a CSV row cannot be geocoded or appears to duplicate an existing restaurant, it must be held for supervisor review instead of being silently published.
- If two supervisors attempt conflicting assignment changes, the system must prevent silent overwrite and show the latest ownership state.

## Data Entities

- Restaurant
- User
- VisitReport
- AssignmentHistory
- Session

## Status Model

- New Lead
- Visited
- In Discussion
- Awaiting Signature
- Signed
- Not Pursuing

## GIS Decision

- Map engine: Leaflet
- Basemap: OpenStreetMap
- User location: Browser Geolocation API
- New restaurant positioning: current location or manual pin
- Principle: no additional map licensing cost for MVP

## UX Principles

- Mobile-first interaction.
- One-handed usage where practical.
- Fast task completion over deep navigation.
- Minimal field collection in the field.

## Acceptance Criteria

1. A rep can open a report page from a map marker.
2. A rep can successfully submit a report with status, contact, notes, and one photo.
3. A new restaurant can be created with a saved location and then shown on the map.
4. A supervisor can see all reports and all employees.
5. A supervisor can assign a restaurant to exactly one rep.
6. The primary mobile workflow works without horizontal scrolling.
7. If geolocation is denied, the app still loads a default trial area and allows reporting.
8. Reassigning an already owned restaurant requires a reason and creates an assignment history entry.
9. A sales rep can view nearby restaurant summaries and their own submitted reports, but cannot access full cross-team report history or directly edit restaurant master data after creation.
10. CSV import accepts restaurant name and address, while duplicate candidates and failed geocodes are routed to supervisor review before publication.

## Open Product Items

- Trial city or district is a deployment configuration input rather than a product blocker for RD implementation.
- Password reset and account disablement are operator-managed workflows in MVP, and first-login password change is out of scope.
- Reporting and export needs beyond MVP remain undecided.
