# Spot Sign Planning Docs

This folder contains the current planning baseline for the Spot Sign MVP.

## Documents

1. [PRD](./prd.md)
   Product scope, users, flows, acceptance criteria, and MVP boundaries.
2. [System Architecture](./system-architecture.md)
   Overall system structure, runtime responsibilities, deployment topology, and operational risks.
3. [Technical Design v0.1](./technical-design-cloudflare-v0.1.md)
   Cloudflare-first implementation baseline for frontend, backend, database, storage, auth, and delivery phases.

## Current Baseline

- Frontend and API remain in a single SvelteKit codebase.
- Deployment target is Cloudflare Free.
- Runtime is Cloudflare Workers.
- Data storage uses D1.
- Photo storage uses R2.
- GIS uses Leaflet with OpenStreetMap.

## How To Use These Docs

- Use `prd.md` for product and UX alignment.
- Use `system-architecture.md` for platform and backend discussions.
- Use `technical-design-cloudflare-v0.1.md` as the implementation baseline for RD.

## Iteration Rule

These documents are intended to be revised. If product scope, platform constraints, or delivery priorities change, update the technical design first, then reconcile architecture and PRD where needed.
