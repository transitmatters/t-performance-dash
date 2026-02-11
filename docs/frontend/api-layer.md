# API Layer & Hooks

The API layer consists of fetch functions (`common/api/`) and React Query hooks (`common/api/hooks/`).

## API Client

### `apiFetch()` (`common/api/utils/fetch.ts`)

Base fetch utility for all API calls. Constructs URLs from the `APP_DATA_BASE_PATH` constant and handles error responses.

### Base Path

```typescript
// common/utils/constants.ts
APP_DATA_BASE_PATH = '/api';
```

In development, Next.js proxies `/api/*` requests to the Python backend at `http://127.0.0.1:5000`.

---

## Fetch Functions

### Trip Explorer (`api/datadashboard.ts`)

| Function | Endpoint | Description |
|----------|----------|-------------|
| `fetchSingleDayData(date, params)` | Various `/api/{metric}/{date}` | Fetch headways/dwells/travel times for one day |
| `fetchAggregateData(params)` | Various `/api/aggregate/{metric}` | Fetch aggregated metrics over date range |

**Hook**: `useTripExplorerQueries()` — returns `{ traveltimes, headways, dwells }` as React Query results.

Supports route types: `bus`, `subway`, `cr` (commuter rail), `ferry`.

### Alerts (`api/alerts.ts`)

| Function | Endpoint | Description |
|----------|----------|-------------|
| `fetchAlerts(params)` | `GET /api/alerts` | Current real-time alerts |
| `fetchAlertsForLine(line)` | `GET /api/alerts` | Alerts filtered by line |
| `fetchAlertsForBus(route)` | `GET /api/alerts` | Alerts filtered by bus route |
| `fetchAccessibilityAlertsForLine(line)` | `GET /api/facilities` | Escalator/elevator status |
| `fetchHistoricalAlerts(date, routes)` | `GET /api/alerts/{date}` | Past alerts for a date |

### Service (`api/service.ts`)

| Function | Endpoint | Description |
|----------|----------|-------------|
| `fetchScheduledService(params)` | `GET /api/scheduledservice` | Scheduled service counts and hours |
| `fetchServiceHours(params)` | `GET /api/service_hours` | Scheduled vs. delivered hours |

### Delays (`api/delays.ts`)

| Function | Endpoint | Description |
|----------|----------|-------------|
| `fetchAlertDelays(params)` | `GET /api/linedelays` | Alert-based delay data by line |

### Speed (`api/speed.ts`)

| Function | Endpoint | Description |
|----------|----------|-------------|
| `fetchSpeeds(params)` | `GET /api/speed_restrictions` | Speed restriction data |

### Predictions (`api/predictions.ts`)

| Function | Endpoint | Description |
|----------|----------|-------------|
| `fetchPredictions(params)` | `GET /api/time_predictions` | Prediction accuracy data |

### Ridership (`api/ridership.ts`)

| Function | Endpoint | Description |
|----------|----------|-------------|
| `fetchRidership(params)` | `GET /api/ridership` | Ridership counts by line |

### Slow Zones (`api/slowzones.ts`)

| Function | Endpoint | Description |
|----------|----------|-------------|
| `fetchSlowzoneDelayTotalData()` | — | Total slow zone delay data |
| `fetchSlowzoneSegmentsData()` | — | Individual slow zone segments |

### Trip Metrics (`api/tripmetrics.ts`)

| Function | Endpoint | Description |
|----------|----------|-------------|
| `fetchDeliveredTripMetrics(params)` | `GET /api/tripmetrics` | Delivered trip counts/time/miles |

### Service & Ridership (`api/serviceAndRidership.ts`)

| Function | Endpoint | Description |
|----------|----------|-------------|
| `fetchServiceAndRidershipData()` | `GET /api/service_ridership_dashboard` | System-wide summary data |

---

## React Query Hooks

All hooks are in `common/api/hooks/` and wrap the corresponding fetch functions with `useQuery`.

### Alerts (`hooks/alerts.ts`)

| Hook | Stale Time | Description |
|------|-----------|-------------|
| `useAlertsData(line)` | 1 minute | Current service alerts |
| `useAccessibilityAlertsData(line)` | 1 minute | Elevator/escalator status |
| `useHistoricalAlertsData(date, routes)` | 5 minutes | Past alerts for a date |

### Service (`hooks/service.ts`)

| Hook | Stale Time | Description |
|------|-----------|-------------|
| `useScheduledService(params)` | 1 hour | Scheduled service data |
| `useServiceHours(params)` | No cache | Service hours comparison |

### Delays (`hooks/delays.ts`)

| Hook | Stale Time | Description |
|------|-----------|-------------|
| `useAlertDelays(params)` | Configurable | Alert-based delay data |

### Speed (`hooks/speed.ts`)

| Hook | Stale Time | Description |
|------|-----------|-------------|
| `useSpeeds(params)` | Default | Speed restriction data |

### Predictions (`hooks/predictions.ts`)

| Hook | Stale Time | Description |
|------|-----------|-------------|
| `usePredictions(params)` | Default | Prediction accuracy |

### Ridership (`hooks/ridership.ts`)

| Hook | Stale Time | Description |
|------|-----------|-------------|
| `useRidershipData(params)` | Default | Ridership counts |

### Slow Zones (`hooks/slowzones.ts`)

| Hook | Stale Time | Description |
|------|-----------|-------------|
| `useSlowzoneDelayTotalData()` | Default | Total slow zone delays |
| `useSlowzoneSegmentsData()` | Default | Individual segments |

### Trip Metrics (`hooks/tripmetrics.ts`)

| Hook | Stale Time | Description |
|------|-----------|-------------|
| `useDeliveredTripMetrics(params)` | Default | Delivered service metrics |

### Service & Ridership (`hooks/serviceAndRidership.ts`)

| Hook | Stale Time | Description |
|------|-----------|-------------|
| `useServiceAndRidershipData()` | Default | System dashboard data |

### Default Stale Time

The global React Query default stale time is set to **10 seconds** in `PrimaryLayout.tsx`:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
    },
  },
});
```
