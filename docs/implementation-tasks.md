# Implementation Tasks: Delivery Breakdown

## Purpose

This task breakdown translates the approved MVP documents into implementation work packages. Each item is derived from the current docs baseline so the team can expand work intentionally instead of guessing new scope.

## Delivery Principles

- Prioritize end-to-end field reporting before optimization or automation.
- Keep all runtime choices compatible with Cloudflare Free constraints.
- Treat business rules and acceptance criteria as the source of truth for task completion.
- Use the testing checklist in [Testing Guide](./testing-guide.md) before closing a work item.

## Workstreams

| Workstream           | Goal                                                                | Main references                                                 | Exit signal                                                         |
| -------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------- |
| Platform baseline    | Make the app deployable on SvelteKit + Cloudflare                   | `system-architecture.md`, `technical-design-cloudflare-v0.1.md` | Build, auth/session bindings, and environment config are stable     |
| Rep workflows        | Let sales reps discover restaurants and submit visit reports        | `prd.md`, `domain-rules.md`, `business-flows.md`                | Rep can complete the primary mobile workflow in under one minute    |
| Supervisor workflows | Let supervisors inspect progress and manage ownership/import review | `prd.md`, `domain-rules.md`, `business-flows.md`                | Supervisor can assign, review reports, and resolve CSV review items |
| Validation           | Prove the MVP behavior instead of assuming it                       | `technical-design-cloudflare-v0.1.md`, `testing-guide.md`       | Required unit, E2E, and manual checks are green                     |

## Task Breakdown

### 1. Platform Baseline

1. Configure Cloudflare deployment bindings for D1 and R2.
2. Add schema, migrations, and environment configuration for default area values.
3. Establish session handling and role guards for sales reps and supervisors.

### 2. Restaurant Discovery And Reporting

1. Implement nearby restaurant lookup with map status markers.
2. Implement restaurant summary panels with current owner and latest report information.
3. Implement report submission for status, contact, notes, and one photo.
4. Handle geolocation-denied fallback without blocking reporting.

### 3. Field Creation Flow

1. Implement new restaurant creation with captured coordinates.
2. Reduce accidental duplicate creation by requiring nearby-map review before creation, while leaving the exact duplicate-matching threshold to the documented review rules.
3. Redirect directly into the first visit report after a successful create.

### 4. Supervisor Operations

1. Implement all-report visibility and employee lookup.
2. Implement assignment and reassignment with reason capture.
3. Persist assignment history and optimistic concurrency checks.
4. Implement CSV import with geocoding adapter and review queue.

### 5. Verification And Release Readiness

1. Cover critical business rules with unit tests.
2. Cover primary rep and supervisor journeys with browser-based E2E tests.
3. Run mobile-first manual checks for layout, field completion speed, and failure handling.
4. Reconcile final implementation against PRD acceptance criteria before release.

## Suggested Execution Order

| Sequence                                 | Reason                                                              |
| ---------------------------------------- | ------------------------------------------------------------------- |
| Platform baseline first                  | Later business workflows depend on auth, data, and storage bindings |
| Rep workflows second                     | The primary MVP value is fast field reporting                       |
| Supervisor workflows third               | Assignment and import review build on restaurant/report data        |
| Validation throughout and before release | Every completed slice must be proven, not assumed                   |

## Definition Of Done

- The task maps back to a documented business flow or rule.
- The related acceptance criteria in `prd.md` remain satisfied.
- Required automated checks pass for the affected area.
- Manual verification notes can explain how the behavior was confirmed.
