# Testing Guide: Verification Strategy

## Purpose

This document defines how Spot Sign MVP work should be verified. The goal is to validate against documented requirements and business rules, not to guess based on incomplete assumptions.

## Verification Principles

- Verify against the current docs set: `prd.md`, `business-flows.md`, `domain-rules.md`, and `technical-design-cloudflare-v0.1.md`.
- Prefer targeted automated checks for the changed area first, then rerun broader validation before release.
- Record environment limitations separately from application failures.
- Keep mobile-first validation in scope because the primary workflow is field usage.

## Current Repository Checks

```sh
pnpm lint
pnpm check
pnpm build
pnpm test:unit -- --run
pnpm test:e2e
```

## Coverage Matrix

| Area                    | What to prove                                                                         | Preferred validation                                |
| ----------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Rep reporting flow      | Map -> marker -> report -> submit works and preserves report history expectations     | E2E + manual confirmation                           |
| New restaurant creation | Captured location persists and creation continues into reporting                      | E2E + manual confirmation                           |
| Assignment workflow     | Single owner, reassignment reason, and conflict handling behave correctly             | Unit + E2E                                          |
| CSV import review       | Failed geocodes and duplicate candidates are reviewable instead of silently published | Unit + integration-style route tests                |
| UI constraints          | No horizontal scrolling and acceptable mobile workflow speed                          | Manual mobile viewport test                         |
| Platform safety         | Build, type checks, and auth/storage integration do not regress                       | `pnpm check`, `pnpm build`, targeted runtime checks |

## Acceptance-Criteria Test Checklist

1. A rep can open a report page from a map marker.
2. A rep can successfully submit a report with status, contact, notes, and one photo.
3. A new restaurant can be created with a saved location and then shown on the map.
4. A supervisor can see all reports and all employees.
5. A supervisor can assign a restaurant to exactly one rep.
6. The primary mobile workflow works without horizontal scrolling.
7. If geolocation is denied, the app still loads a default trial area and allows reporting.
8. Reassigning an already owned restaurant requires a reason and creates an assignment history entry.
9. A sales rep can view nearby restaurant summaries and their own submitted reports, but cannot access full cross-team report history or directly edit restaurant master data after creation.
10. CSV import accepts restaurant name and address, while duplicate candidates and failed geocodes are routed to supervisor review.

## High-Risk Failure Scenarios

- Photo upload fails before report submission: the user sees an explicit error, the report is not treated as successful, and retry remains available.
- Two supervisors attempt conflicting assignment changes: the system rejects silent overwrite and shows the latest owner state.
- Geolocation is denied or unavailable: the app still loads the configured default area and allows reporting.
- CSV rows with failed geocodes or duplicate candidates: the rows move into supervisor review instead of direct publication.

## Multi-Agent Challenge Validation

Use role-based review passes before sign-off:

| Agent lens        | Challenge question                                                                    | Expected evidence                                                                   |
| ----------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Product / PD      | Does the delivered flow still match the documented user goal and acceptance criteria? | `prd.md` and `business-flows.md` stay aligned                                       |
| RD / architecture | Does the implementation stay inside current Cloudflare and data-model constraints?    | `technical-design-cloudflare-v0.1.md` and `system-architecture.md` remain satisfied |
| QA / operations   | Are failure cases, permission limits, and review queues explicitly validated?         | `domain-rules.md` and this guide are covered by tests or manual checks              |

If any one lens cannot explain how the requirement was verified, the work is not ready to close.

## Manual Verification Notes Template

| Item                   | Result | Evidence |
| ---------------------- | ------ | -------- |
| Device / viewport used |        |          |
| Flow exercised         |        |          |
| Expected result        |        |          |
| Actual result          |        |          |
| Follow-up needed       |        |          |
