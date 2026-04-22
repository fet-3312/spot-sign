# Business Flows: PD Expansion And Operational Diagrams

## Purpose

This document expands the PRD core flows into delivery-ready business flows. The content is based on `prd.md`, `domain-rules.md`, and `technical-design-cloudflare-v0.1.md` so RD, QA, and PM can verify the same workflow assumptions without guessing.

## Validation Inputs

- Product scope and acceptance criteria: [PRD](./prd.md)
- Status, assignment, import, and media rules: [Domain Rules](./domain-rules.md)
- Delivery sequencing and Cloudflare constraints: [Technical Design v0.1](./technical-design-cloudflare-v0.1.md)

## Sales Rep Reporting Flow

```mermaid
flowchart TD
    A[Open app] --> B{Geolocation available?}
    B -->|Yes| C[Load nearby restaurants]
    B -->|No| D[Load configured default area]
    C --> E[Show map markers with status and assignee]
    D --> E
    E --> F[Tap marker]
    F --> G[Review restaurant summary]
    G --> H[Open report page]
    H --> I[Enter status / contact / notes / one photo]
    I --> J{Upload and payload valid?}
    J -->|Yes| K[Create visit report]
    K --> L[Refresh derived restaurant summary]
    J -->|No| M[Show explicit error and retry]
```

### Flow Notes

- The reporting flow must still work when browser geolocation is denied by loading a deployment-configured default area.
- Marker summaries must surface current status, current owner, and latest report time before the rep enters the report page.
- A successful report updates the current restaurant summary but does not overwrite historical visit reports.

## Sales Rep New Restaurant Flow

```mermaid
flowchart TD
    A[Rep cannot find a reasonable nearby match] --> B[Choose add restaurant]
    B --> C{How is the location captured?}
    C -->|Current location| D[Use device coordinates]
    C -->|Manual pin| E[Use map pin coordinates]
    D --> F[Enter base restaurant information]
    E --> F
    F --> G[Create restaurant]
    G --> H[Open report page immediately]
    H --> I[Submit first visit report]
```

### Flow Notes

- The creation path exists for field discovery, not bulk intake. Bulk seeding remains the CSV import workflow.
- The first report should happen in the same field session so the restaurant does not remain context-free after creation.

## Supervisor Assignment Flow

```mermaid
flowchart TD
    A[Open supervisor workspace] --> B[Inspect restaurant summary and assignee]
    B --> C[Choose restaurant]
    C --> D[Choose target sales rep]
    D --> E{Restaurant already assigned?}
    E -->|No| F[Submit assignment]
    E -->|Yes| G[Enter reassignment reason]
    G --> F
    F --> H{expectedCurrentAssignedUserId still matches?}
    H -->|Yes| I[Persist assignment and history]
    H -->|No| J[Reject overwrite and show latest owner]
```

### Flow Notes

- Reassignment always requires a reason once an active owner exists.
- The system must prevent silent ownership overwrite when two supervisors act on the same restaurant.

## Supervisor Review Flow

```mermaid
sequenceDiagram
    participant S as Supervisor
    participant UI as Supervisor UI
    participant API as Import API
    participant GEO as Geocoding Adapter
    participant Q as Review Queue

    S->>UI: Upload CSV
    UI->>API: Submit rows with name and address
    API->>GEO: Resolve addresses
    GEO-->>API: Success / failed geocode
    API->>API: Detect duplicate candidates
    alt Direct publish
        API-->>UI: Create publishable restaurants
    else Needs review
        API->>Q: Store review items
        Q-->>UI: Show pending review queue
        S->>UI: Approve create / merge existing / retry geocode / reject row
        UI->>API: Submit review resolution
        API-->>UI: Persist resolution with supervisor attribution
    end
```

### Flow Notes

- CSV import review is handled as part of the supervisor review workflow rather than as an unrelated standalone process.
- CSV import is the minimum bulk onboarding workflow and requires at least `name` and `address`.
- Failed geocodes and duplicate candidates must route to supervisor review instead of silently publishing questionable data.

## Cross-Role Handoffs

| Handoff                             | Source role     | Target role        | Verification checkpoint                                            |
| ----------------------------------- | --------------- | ------------------ | ------------------------------------------------------------------ |
| Field report submitted              | Sales rep       | Supervisor         | Latest activity and current owner are visible in supervisor review |
| New restaurant created in the field | Sales rep       | Supervisor         | The created restaurant appears on the map with saved coordinates   |
| Reassignment requested              | Supervisor      | System audit trail | Previous owner, new owner, actor, timestamp, and reason are stored |
| CSV row needs review                | Import pipeline | Supervisor         | Review queue shows pending item with enough context to resolve     |
