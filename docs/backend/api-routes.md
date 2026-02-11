# API Routes

All routes are defined in `server/app.py`. Every route uses CORS and returns JSON with `Cache-Control` headers.

## Single-Day Performance Routes

These routes return raw performance metrics for a specific date. Data is fetched from S3 event CSVs and parsed on-the-fly.

### `GET /api/headways/{date}`

Returns headway (time between trains) metrics for stations on a given date.

| Parameter | Location | Type | Description |
|-----------|----------|------|-------------|
| `date` | Path | `YYYY-MM-DD` | The service date |
| `stop` | Query (multi) | `string` | Stop ID(s) to query |

**Response**: `HeadwayResponse` — `{ headways: { [stopId]: [...events] } }`

---

### `GET /api/dwells/{date}`

Returns dwell time (time stopped at station) metrics.

| Parameter | Location | Type | Description |
|-----------|----------|------|-------------|
| `date` | Path | `YYYY-MM-DD` | The service date |
| `stop` | Query (multi) | `string` | Stop ID(s) to query |

**Response**: `DwellResponse` — `{ dwells: { [stopId]: [...events] } }`

---

### `GET /api/traveltimes/{date}`

Returns travel time metrics between station pairs.

| Parameter | Location | Type | Description |
|-----------|----------|------|-------------|
| `date` | Path | `YYYY-MM-DD` | The service date |
| `from_stop` | Query (multi) | `string` | Origin stop ID(s) |
| `to_stop` | Query (multi) | `string` | Destination stop ID(s) |

**Response**: `TravelTimeResponse` — `{ travel_times: { [stopPair]: [...events] } }`

---

### `GET /api/alerts/{date}`

Returns historical service alerts for a specific date.

| Parameter | Location | Type | Description |
|-----------|----------|------|-------------|
| `date` | Path | `YYYY-MM-DD` | The date to query |
| `route` | Query (multi) | `string` | Route ID(s) to filter by |

**Response**: `AlertsRouteResponse` — `{ alerts: [...] }`

---

## Aggregate Time-Range Routes

These routes return aggregated metrics over a date range. Data is fetched for each date in the range and then aggregated using pandas.

### `GET /api/aggregate/traveltimes`

Returns travel time statistics aggregated by date and by time-of-day. Uses `aggregation.travel_times_over_time()` (peak="all" only).

| Parameter | Type | Description |
|-----------|------|-------------|
| `start_date` | `YYYY-MM-DD` | Start of date range |
| `end_date` | `YYYY-MM-DD` | End of date range |
| `from_stop` | `string` (multi) | Origin stop ID(s) |
| `to_stop` | `string` (multi) | Destination stop ID(s) |

**Response**: `TravelTimeAggregateResponse` — `{ data: { by_date: {...} } }`

---

### `GET /api/aggregate/traveltimes2`

Returns comprehensive travel time aggregates including both `by_date` and `by_time` breakdowns, with peak/off-peak classification. Uses `aggregation.travel_times_all()`.

**Parameters**: Same as `/api/aggregate/traveltimes`

**Response**: `TravelTimeAggregateResponse` — `{ data: { by_date: {...}, by_time: {...} } }`

---

### `GET /api/aggregate/headways`

Returns headway statistics aggregated over a date range. Includes bunching ratio and on-time percentage.

| Parameter | Type | Description |
|-----------|------|-------------|
| `start_date` | `YYYY-MM-DD` | Start of date range |
| `end_date` | `YYYY-MM-DD` | End of date range |
| `stop` | `string` (multi) | Stop ID(s) to query |

**Response**: `HeadwaysAggregateResponse` — `{ data: {...} }`

---

### `GET /api/aggregate/dwells`

Returns dwell time statistics aggregated over a date range.

| Parameter | Type | Description |
|-----------|------|-------------|
| `start_date` | `YYYY-MM-DD` | Start of date range |
| `end_date` | `YYYY-MM-DD` | End of date range |
| `stop` | `string` (multi) | Stop ID(s) to query |

**Response**: `DwellsAggregateResponse` — `{ data: {...} }`

---

## Line Metrics Routes

These routes return pre-aggregated metrics stored in DynamoDB.

### `GET /api/linedelays`

Returns alert-based delay data for a transit line.

| Parameter | Type | Description |
|-----------|------|-------------|
| `start_date` | `YYYY-MM-DD` | Start of date range |
| `end_date` | `YYYY-MM-DD` | End of date range |
| `line` | `string` | Line identifier (e.g., `Red`, `Orange`, `Green-B`) |
| `agg` | `string` | Aggregation: `daily` or `weekly` |

**Response**: `LineDelaysResponse` — `{ data: {...} }`

**Limits**: Max 150 entries (daily), 1050 entries (weekly).

---

### `GET /api/tripmetrics`

Returns trip count, time, and miles metrics for a transit line.

| Parameter | Type | Description |
|-----------|------|-------------|
| `start_date` | `YYYY-MM-DD` | Start of date range |
| `end_date` | `YYYY-MM-DD` | End of date range |
| `line` | `string` | Line identifier |
| `agg` | `string` | Aggregation: `daily`, `weekly`, or `monthly` |

**Response**: `TripMetricsResponse` — `{ data: {...} }`

**Limits**: Max 150 (daily), 1050 (weekly), 4500 (monthly) entries.

---

## Service & Operational Routes

### `GET /api/scheduledservice`

Returns scheduled service counts and hours, broken down by hour and day-of-week.

| Parameter | Type | Description |
|-----------|------|-------------|
| `start_date` | `YYYY-MM-DD` | Start of date range |
| `end_date` | `YYYY-MM-DD` | End of date range |
| `route_id` | `string` (optional) | Route ID to filter by |
| `agg` | `string` | Aggregation: `daily`, `weekly`, or `monthly` |

**Response**: `GetScheduledServiceResponse`

```json
{
  "start_date_service_levels": {
    "weekday": { "date": "...", "service_levels": [0, 0, 0, ...] },
    "saturday": { ... },
    "sunday": { ... }
  },
  "end_date_service_levels": { ... },
  "counts": { "2024-01-01": 42, ... },
  "service_hours": { "2024-01-01": 18.5, ... }
}
```

---

### `GET /api/ridership`

Returns daily ridership counts for a transit line.

| Parameter | Type | Description |
|-----------|------|-------------|
| `start_date` | `YYYY-MM-DD` | Start of date range |
| `end_date` | `YYYY-MM-DD` | End of date range |
| `line_id` | `string` (optional) | Line ID to filter by |

**Response**: `RidershipResponse` — `{ data: [{ date: "...", count: 12345 }, ...] }`

---

### `GET /api/service_hours`

Returns scheduled vs. delivered service hours comparison.

| Parameter | Type | Description |
|-----------|------|-------------|
| `start_date` | `YYYY-MM-DD` | Start of date range |
| `end_date` | `YYYY-MM-DD` | End of date range |
| `line_id` | `string` (optional) | Route ID to filter by |
| `agg` | `string` | Aggregation: `daily`, `weekly`, or `monthly` |

**Response**: `ServiceHoursResponse` — `{ data: {...} }`

---

### `GET /api/speed_restrictions`

Returns speed restriction zones for a line on a specific date.

| Parameter | Type | Description |
|-----------|------|-------------|
| `date` | `YYYY-MM-DD` | Date to query |
| `line_id` | `string` | Line ID |

**Response**: `SpeedRestrictionsResponse`

```json
{
  "available": true,
  "date": "2024-01-15",
  "zones": { ... }
}
```

---

### `GET /api/time_predictions`

Returns time prediction model data for a route.

| Parameter | Type | Description |
|-----------|------|-------------|
| `route_id` | `string` | Route ID |

**Response**: `TimePredictionResponse` — `{ predictions: {...} }`

**Cache**: 1 hour (static data).

---

### `GET /api/service_ridership_dashboard`

Returns complete service and ridership summary data for the system-wide dashboard. No parameters required.

**Response**: `ServiceRidershipDashboardResponse` — `{ summaryData: {...}, lineData: {...} }`

**Cache**: 1 hour.

---

## Real-Time Routes

### `GET /api/alerts`

Returns current real-time MBTA service alerts. Queries the MBTA v3 API directly.

| Parameter | Type | Description |
|-----------|------|-------------|
| Various | Query | Passed through to MBTA v3 API |

**Response**: `AlertsRouteResponse` — `{ alerts: [...] }`

**Cache**: 15 minutes.

---

### `GET /api/facilities`

Returns MBTA facility information (elevators, escalators). Queries the MBTA v3 API directly.

**Response**: List of `Facility` objects.

**Cache**: 15 minutes.

---

## Route Manifest Routes

### `GET /api/routes`

Returns a catalog of all available routes grouped by transit mode.

**Response**: `RoutesResponse`

```json
{
  "rapid_transit": ["Red", "Orange", "Blue", "Green-B", "Green-C", "Green-D", "Green-E", "Mattapan"],
  "bus": ["1", "4", "7", ...],
  "commuter_rail": ["CR-Fairmount", "CR-Fitchburg", ...],
  "ferry": ["Boat-F1", "Boat-F4", ...]
}
```

**Cache**: 1 day.

---

### `GET /api/stops/{route_id}`

Returns station/stop information for a specific route.

| Parameter | Location | Type | Description |
|-----------|----------|------|-------------|
| `route_id` | Path | `string` | Route identifier |

**Response**: `StopsResponse`

```json
{
  "type": "rapid_transit",
  "direction": { "0": "Southbound", "1": "Northbound" },
  "stations": [
    {
      "stop_name": "Alewife",
      "station": "place-alfcl",
      "order": 0,
      "branches": null,
      "stops": { "0": ["70061"], "1": ["70062"] },
      "accessible": true,
      "terminus": true
    }
  ],
  "service_start": "2024-01-01",
  "service_end": "2024-12-31"
}
```

**Cache**: 1 day. Returns 404 if route not found.

---

## System Routes

### `GET /api/healthcheck`

Verifies API key presence and S3 data access. Returns 200 on success, 500 with failure details.

### `GET /api/git_id`

Returns the current git commit hash. **Local development only** — throws `ConflictError` on serverless hosts.
