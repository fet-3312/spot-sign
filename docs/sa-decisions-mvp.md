# SA Decisions: MVP Auth And Geocoding

## Purpose

This document records the approved SA decisions for two MVP topics that affect scope, delivery risk, and operating cost: authentication and CSV address geocoding.

## Decision 1: Authentication

### Approved Decision

- Keep authentication inside the SvelteKit app for MVP using admin-provisioned email/password accounts plus session cookies.
- Do not build self-service signup in MVP.
- Do not build a full password reset workflow in MVP; handle resets manually through supervisor or operator support.

### Why

- It avoids dependence on external IT or identity-provider setup that may block delivery.
- It matches the existing Cloudflare-first single-codebase architecture.
- It is sufficient for a small internal pilot if the user base is limited and accounts are provisioned manually.

### Guardrails

- Store only password hashes and hashed session tokens.
- Require active account status checks on login.
- Keep account creation and disablement in supervisor or operator workflows rather than end-user self-service.
- Reassess managed identity once the pilot expands across more teams or needs SSO.

### Tradeoff

- This is not the lowest long-term security or support burden.
- It is the lowest delivery-risk choice when corporate IdP readiness is unknown.

## Decision 2: Geocoding For CSV Import

### Approved Decision

- Use a server-side geocoding adapter for CSV imports only.
- Treat field-created restaurants differently: prefer current device location or manual map pin, and do not spend geocoding quota unless the business later requires address normalization.
- Do not rely on public shared Nominatim endpoints for MVP import traffic.
- Start with a low-volume paid geocoding provider after a sample check on the pilot district; if address quality in Taiwan is the primary concern, Google Maps Geocoding is the default recommendation.

### Why

- CSV import is the only MVP path that truly requires address-to-coordinate conversion.
- Limiting geocoding to import keeps cost and operational dependency small.
- A paid low-volume provider is safer than relying on public shared infrastructure for internal operations.
- The review queue already absorbs failed matches and duplicate candidates, so the provider does not need perfect accuracy.

### Guardrails

- Keep the provider behind an adapter in the Worker.
- Log import-level success and failure counts.
- Route failed geocodes and duplicate candidates to supervisor review instead of silently publishing them.
- Add quota alerts before enabling large bulk loads.

### Tradeoff

- A commercial geocoder adds a small operating cost.
- In return, it reduces address quality risk and avoids misuse of public OSM services.

## Follow-Up Actions

1. Use this auth model as the MVP baseline.
2. Run a small pilot geocoding sample on the target district before locking the provider contract.
3. Keep the import review queue in scope even if the first geocoding sample looks good.
