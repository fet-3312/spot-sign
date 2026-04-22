# PRD: Spot Sign MVP

## 1. Product Definition

Spot Sign is a mobile-first field sales web app for restaurant signing workflows.

The product is not "a map plus a form". It is an operational tool that helps two roles complete one closed loop:

- Sales reps find nearby restaurants, visit them, and report progress quickly.
- Supervisors monitor team progress, assign restaurants, and track ownership clearly.

The MVP exists to validate one core promise:

> A rep can find a restaurant and submit a field update in under one minute, while a supervisor can immediately see progress and assign the next target from a single interface.

## 2. Product Goals

- Let reps quickly find nearby restaurants from a map-first homepage.
- Let reps complete one field report in under one minute on mobile.
- Let supervisors see the overall field picture and assign restaurants without switching tools.
- Establish a clear, structured status model so progress is visible at a glance.

## 3. Users And Job To Be Done

### Sales Rep

Primary job:
Visit restaurants in the field, decide next action fast, and leave a structured update before moving on.

Primary actions:

- Open the map and find nearby targets.
- Tap a restaurant marker to view current summary.
- Enter visit status, contact person, notes, and one photo.
- Add a missing restaurant when a location is not yet in the system.

### Supervisor

Primary job:
Understand who is working on what, which restaurants are stuck, and where new assignments should go.

Primary actions:

- View all reps and their current workload.
- View restaurant status and latest report activity.
- Assign or reassign a restaurant to one rep.
- Review report history and ownership changes.

### Management

This role is optional for MVP.
If introduced later, the main job is reading aggregated conversion and coverage metrics rather than participating in daily assignment workflows.

## 4. Product Narrative

This section is intentionally concrete so RD can picture the interface before discussing implementation.

### Rep Scenario

It is 11:40 AM. A rep is on the street and opens the app with one hand.

- The first screen is a map centered on current location.
- Nearby restaurant markers are visible immediately.
- Each marker color already tells whether the place is unvisited, in discussion, signed, or not pursuing.
- The rep taps one marker.
- A bottom sheet slides up with restaurant name, current owner, latest status, latest report time, and a clear primary CTA.
- The rep taps "Start Report" and lands on a lightweight report page.
- The rep changes status, adds contact and notes, uploads one photo, and submits.
- The rep returns to the map and can move to the next stop.

### Supervisor Scenario

It is 4:30 PM. A supervisor wants to rebalance the team before the evening push.

- The supervisor enters a control view with three main areas: employee list, map, and assignment panel.
- The employee list shows current assignee load, last update time, and operating area.
- The map shows restaurant markers with visible status colors.
- The supervisor selects one rep, taps restaurants on the map, and assigns one target.
- The UI confirms who now owns that restaurant.
- If the restaurant already had an owner, the supervisor must provide a reassignment reason.

## 5. Experience Principles

- Mobile-first, not desktop-first.
- Fast task completion beats deep navigation.
- Structured status beats free-text workflow.
- Primary actions must stay within thumb reach on mobile.
- Information should be scannable from the map before entering detail pages.
- The product should feel like a field operations tool, not a heavy back-office system.

## 6. Success Metrics

- A rep can reach the report flow from the map in three taps or fewer after page load.
- A single field report can be submitted on mobile in under one minute.
- A supervisor can assign a restaurant and immediately confirm the assignee.
- Each restaurant clearly exposes current status, last report time, and current owner.

## 7. Information Architecture

- Map Home
- Restaurant Report
- My Tasks / My Restaurants
- Supervisor Console
- Employee Management
- Assignment History / Report History

The IA intentionally separates daily field actions from supervisor management work so the product does not collapse into one overloaded page.

## 8. Core Screens

### Map Home

This is the primary workbench for reps and the entry point of the product.

Must include:

- Current location
- Nearby restaurant markers
- Marker status colors
- Tap interaction that opens a summary bottom sheet
- Search and basic status filter
- Clear entry to add a missing restaurant

The rep should understand "what is near me" and "what should I do next" without opening multiple pages.

### Restaurant Summary Bottom Sheet

This is the bridge between the map and the report flow.

Must show at least:

- Restaurant name
- Current status
- Current owner
- Latest report time
- Primary CTA to start or continue report

This area should be compact, glanceable, and optimized for one-handed use.

### Report Page

This page is designed for fast field input, not deep CRM editing.

Required fields:

- Restaurant name
- Contact person
- Status
- Notes
- One photo

Design direction:

- Minimal fields only
- Strong default values where possible
- Status is the most prominent control
- Photo upload action must be visually obvious
- Form should be easy to complete while standing outdoors

### Supervisor Console

This is a resource allocation center, not just a table page.

Must include three zones:

- Employee list
- Map
- Assignment panel

Employee list should prioritize:

- Current assignment count
- Last report time
- Current area or recent activity

The preferred assignment flow is:

Select rep -> tap restaurant on map -> confirm assignment.

This is more direct than forcing the supervisor to navigate into restaurant detail first.

## 9. Core Flows

### Rep Reporting Flow

Open app -> allow location -> view nearby markers -> tap marker -> review summary bottom sheet -> start report -> submit update.

Target interaction cost:

- No more than 4 to 5 meaningful steps from open app to completed submission.

### Rep New Restaurant Flow

Open app -> choose add restaurant -> use current location or tap map -> enter base information -> create restaurant -> continue into report.

### Supervisor Assignment Flow

Open supervisor console -> inspect employees and restaurant map -> select rep -> tap restaurant -> confirm assignment.

### Supervisor Review Flow

Open supervisor console -> filter by rep or status -> inspect latest activity, ownership, and blocked restaurants.

## 10. MVP Scope

### In Scope

- Login and role separation for sales rep and supervisor
- Map-first home page with nearby restaurant markers
- Marker detail summary and transition to report page
- Report fields: restaurant name, contact person, status, notes, one photo
- New restaurant creation with captured location
- CSV import of restaurant name and address as the minimum bulk seeding workflow
- Supervisor employee list and global report visibility
- Supervisor restaurant assignment to a single rep
- Basic status filter and search
- Mobile-first UI with desktop compatibility
- Backend APIs and persistence required to support the above workflows

### Out Of Scope

- Multiple photos per report
- Offline reporting and background sync
- Address search and navigation integration
- Heatmaps, advanced GIS layers, or route planning
- Export reporting
- Admin role and multi-owner assignment
- Notifications, reminders, or workflow automation
- Performance dashboards for management

## 11. User Stories

1. As a sales rep, I want to open the app and immediately see nearby restaurants so I can choose where to visit.
2. As a sales rep, I want to open a report page directly from a map marker so I can report quickly.
3. As a sales rep, I want to update status, contact, notes, and attach one photo from the field.
4. As a sales rep, I want to add a missing restaurant when I find a new location.
5. As a supervisor, I want to review all rep activity so I can monitor progress.
6. As a supervisor, I want to assign a restaurant to one rep so ownership is clear.

## 12. Functional Requirements

- The default landing page is a map view.
- The app must request browser geolocation and fall back to a default area when unavailable.
- The default area must be configurable by environment and not hardcoded into the frontend build.
- Restaurant markers must use visible status distinctions.
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

## 13. Status Model

The MVP status list should stay finite and structured.

- Not Contacted
- Contacted - Follow Up Needed
- In Discussion
- Signed
- Rejected

This set is intentionally operational. It should be easy to tap, easy to analyze, and easy to color-code on the map.

## 14. Access And Ownership Rules

- Sales reps can view nearby restaurants on the map, open assigned or unassigned restaurants, and submit visit reports.
- Sales reps can create a new restaurant only when no reasonable nearby match exists on the map.
- Sales reps can view nearby restaurant summaries and their own submitted reports, but cannot view full cross-team report history.
- Sales reps cannot reassign restaurant ownership or directly edit restaurant master data after creation.
- Supervisors can view all restaurants, all employees, all reports, and all assignment history.
- Supervisors can assign or reassign a restaurant to exactly one active sales rep and can correct restaurant master data when needed.
- Unassigned restaurants are visible to sales reps for discovery, but assignment determines the current owner shown in supervisor views and operational reporting.
- Assignment changes must record who changed the owner, when it changed, and the previous and new owner.
- Reassignment of an already assigned restaurant must capture a reassignment reason for auditability.

## 15. Data Ownership Model

- Restaurant stores master data and current operational state, including restaurant name, location, current assignee, and current derived status.
- VisitReport stores each field interaction as an immutable activity record, including submitted contact person, status update, notes, photo, reporter, and timestamp.
- A sales rep report can propose updated contact or status information, but it must not overwrite historical VisitReport records.
- The latest valid VisitReport can update the restaurant's current derived status, but historical reports must remain unchanged.
- AssignmentHistory stores ownership changes independently from VisitReport so reassignment remains auditable.

## 16. Data Intake Strategy

- Field creation is the primary source of new restaurant records during MVP.
- CSV import is the minimum bulk onboarding workflow for trial data and legacy lists.
- CSV import must support at least restaurant name and address.
- Duplicate handling does not need full automated matching in MVP, but the system must prevent silent duplicate creation during import and flag possible duplicates for review.

## 17. Failure And Edge Cases

- If geolocation is denied or unavailable, the app must load a default trial area and still allow reporting.
- If photo upload fails, the user must receive an explicit error and be able to retry before final submission.
- If network quality is poor, submission failure must be clearly surfaced and must not appear as a successful report.
- Weak network behavior should support at least a clear retry path, and draft support is a phase-two enhancement rather than MVP scope.
- If a CSV row cannot be geocoded or appears to duplicate an existing restaurant, it must be held for supervisor review instead of being silently published.
- If two supervisors attempt conflicting assignment changes, the system must prevent silent overwrite and show the latest ownership state.

## 18. GIS Decision

- Map engine: Leaflet
- Basemap: OpenStreetMap
- User location: Browser Geolocation API
- New restaurant positioning: current location or manual pin
- Principle: no additional map licensing cost for MVP

## 19. Mobile-First UX Rules

- Use a bottom sheet for restaurant summary and primary map actions.
- Keep important actions in the lower half of the screen where possible.
- Avoid tiny dropdowns for status selection on mobile.
- Break longer forms into clearly grouped sections.
- Make photo upload visually prominent.
- The main mobile workflow must work without horizontal scrolling.

## 20. Acceptance Criteria

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

## 21. Phase Plan

### Phase 0 - Requirement Definition

Confirm status model, role permissions, restaurant data source, assignment rules, and supervisor KPIs.

Required outputs:

- Role definitions
- User journey
- MVP scope
- Field definitions
- Success metrics

### Phase 1 - MVP Design

Create low-fidelity flow and mobile-first wireframes.
Validate three things first:

- Is the map interaction obvious?
- Is reporting fast enough?
- Is supervisor assignment direct enough?

Required outputs:

- User flow
- Wireframe
- Clickable prototype
- Field dictionary and status dictionary

### Phase 2 - MVP Development

Recommended build order:

1. Login and role handling
2. Map and restaurant data
3. Report page
4. Photo upload
5. Supervisor assignment
6. Basic search and filters

### Phase 3 - Pilot Run

Run with 1 supervisor and 3 to 5 reps.

Observe:

- Report completion time
- Missing field rate
- Photo upload success rate
- Assignment completion time

### Phase 4 - Optimization

After the core loop is stable, consider:

- Report timeline
- Route planning and daily sequence
- Photo geo-tagging
- Reminders for incomplete reports
- Performance dashboards
- Area coverage analytics

## 22. Open Product Items

- Trial city or district is a deployment configuration input rather than a product blocker for RD implementation.
- Password reset and account disablement are operator-managed workflows in MVP, and first-login password change is out of scope.
- Reporting and export needs beyond MVP remain undecided.

## 23. One-Line Product Summary

Spot Sign is a field operations tool that lets reps complete restaurant visit reporting quickly from a map, while letting supervisors assign targets and monitor progress from one unified workflow.
