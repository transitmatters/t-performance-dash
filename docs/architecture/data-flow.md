# Data Flow

## Request Lifecycle

### Single-Day Query

When a user views performance data for a specific date (e.g., headways at a station on 2024-01-15):

```mermaid
sequenceDiagram
    participant Browser
    participant ReactQuery as React Query
    participant Hook as API Hook
    participant Chalice as Chalice Backend
    participant S3 as S3 Events
    participant Parse as s3_historical.py

    Browser->>ReactQuery: Component mounts / date changes
    ReactQuery->>Hook: useTripExplorerQueries()
    Hook->>Chalice: GET /api/headways/2024-01-15?stop=70061
    Chalice->>S3: Download event CSV
    S3-->>Chalice: events.csv.gz
    Chalice->>Parse: Parse headway events
    Parse-->>Chalice: Headway metrics
    Chalice-->>Hook: JSON response
    Hook-->>ReactQuery: Cache response
    ReactQuery-->>Browser: Render chart
```

### Aggregate Query

When a user views aggregated data over a date range (e.g., travel times over 30 days):

```mermaid
sequenceDiagram
    participant Browser
    participant ReactQuery as React Query
    participant Hook as API Hook
    participant Chalice as Chalice Backend
    participant S3 as S3 Events
    participant Agg as aggregation.py

    Browser->>ReactQuery: Date range selected
    ReactQuery->>Hook: useTripExplorerQueries()
    Hook->>Chalice: GET /api/aggregate/traveltimes?start_date=...&end_date=...
    Chalice->>S3: Download events for each date (parallel)
    S3-->>Chalice: Multiple event CSVs
    Chalice->>Agg: Aggregate by date + by time-of-day
    Agg-->>Chalice: {by_date: {...}, by_time: {...}}
    Chalice-->>Hook: JSON response
    Hook-->>ReactQuery: Cache response
    ReactQuery-->>Browser: Render chart
```

### Pre-Aggregated Query

For line-level metrics (delays, trip metrics, ridership), data is pre-aggregated in DynamoDB:

```mermaid
sequenceDiagram
    participant Browser
    participant Hook as API Hook
    participant Chalice as Chalice Backend
    participant DDB as DynamoDB

    Browser->>Hook: useAlertDelays()
    Hook->>Chalice: GET /api/linedelays?line=Red&start_date=...&end_date=...
    Chalice->>DDB: Query AlertDelaysDaily table
    DDB-->>Chalice: Pre-aggregated delay records
    Chalice-->>Hook: JSON response
    Hook-->>Browser: Render chart
```

## State Management Flow

```mermaid
flowchart LR
    subgraph URL
        QP[Query Params<br/>?startDate=...&endDate=...]
    end

    subgraph Zustand Stores
        DS[dateStore<br/>Line/Trip/System configs]
        SS[stationStore<br/>from/to stations]
        DPS[datePresetStore<br/>Preset tracking]
    end

    subgraph React Query
        RQ[Query Cache<br/>Stale time management]
    end

    subgraph API
        BE[Chalice Backend]
    end

    QP <-->|saveDateStoreSection<br/>getDateStoreSection| DS
    DS -->|Date params| RQ
    SS -->|Station params| RQ
    DPS -->|Preset detection| DS
    RQ <-->|HTTP requests| BE
```

### State Flow Details

1. **Page Load**: URL query params are parsed and used to initialize Zustand stores via `LoadPresetsLayout`
2. **User Interaction**: Date pickers and station selectors update Zustand stores
3. **Store Update**: Store changes trigger `saveDateStoreSection()` which updates URL query params
4. **Query Invalidation**: React Query hooks depend on store values — when they change, queries re-fetch
5. **Caching**: React Query caches responses with configurable stale times (1 min for alerts, 1 hour for schedules)

## Data Pipeline

### Raw Events to Metrics

```mermaid
flowchart TD
    subgraph MBTA Data Feed
        GTFS[GTFS-RT Feed]
    end

    subgraph Ingestion Pipeline
        LAMP[LAMP Processing]
    end

    subgraph S3 Storage
        Monthly[Monthly Archives<br/>events.csv.gz]
        Daily[Daily Files<br/>events.csv]
    end

    subgraph Backend Processing
        Download[Parallel Download]
        Parse[CSV Parsing<br/>s3_historical.py]
        Aggregate[Aggregation<br/>aggregation.py]
    end

    subgraph Metrics
        Headways[Headway Stats<br/>count, mean, median, std]
        Dwells[Dwell Stats<br/>count, mean, median, std]
        TravelTimes[Travel Time Stats<br/>by_date, by_time, peak/off-peak]
    end

    GTFS --> LAMP
    LAMP --> Monthly
    LAMP --> Daily
    Monthly --> Download
    Daily --> Download
    Download --> Parse
    Parse --> Aggregate
    Aggregate --> Headways
    Aggregate --> Dwells
    Aggregate --> TravelTimes
```

### Event CSV Format

Each event file contains arrival and departure records:

| Column | Description |
|--------|-------------|
| `event_type` | `ARR` (arrival) or `DEP` (departure) |
| `trip_id` | GTFS trip identifier |
| `event_time` | Unix timestamp of the event |
| `service_date` | Service date (transit day, offset by 3:30am) |

### Metric Calculations

- **Headways**: Time between consecutive departures at a stop
- **Dwells**: Time between arrival and departure of the same trip at a stop
- **Travel Times**: Time between arrivals at two different stops for the same trip
- **Peak Detection**: Non-holiday weekdays, 6:30-9:00am or 3:30-6:30pm

## Caching Strategy

### Backend Cache Headers

| Data Recency | Cache Duration | Rationale |
|-------------|---------------|-----------|
| Today | 15 minutes (900s) | Data still updating from live feed |
| < 6 months | 1 hour (3600s) | Stable but may receive corrections |
| > 6 months | 3 months (7,776,000s) | Historical data, unlikely to change |

### Frontend Cache (React Query)

| Data Type | Stale Time | Rationale |
|-----------|-----------|-----------|
| Alerts | 1 minute | Real-time data, changes frequently |
| Accessibility alerts | 1 minute | Elevator/escalator status changes |
| Historical alerts | 5 minutes | Past alerts, stable |
| Scheduled service | 1 hour | Schedule changes are infrequent |
| Default | 10 seconds | General data freshness |
