# External APIs

## MBTA v3 API

The backend integrates with the [MBTA v3 API](https://api-v3.mbta.com/) for real-time data. The client is implemented in `server/chalicelib/mbta_v3.py`.

### Configuration

```python
BASE_URL_V3 = "https://api-v3.mbta.com/{command}"
# Requires MBTA_V3_API_KEY environment variable
# Sent as x-api-key header
```

### Functions

#### `getV3(command, params)`

Generic MBTA v3 API query. Sends a GET request with the API key and returns parsed JSON.

#### `getAlerts(params)`

Fetches current service alerts and formats them for the dashboard.

**Alert Classification**:

| Category | Alert Effects |
|----------|--------------|
| Shuttle | `SHUTTLE`, `SUSPENSION`, `STOP_CLOSURE` |
| Delay | `DELAY`, `DETOUR` |
| Accessibility | `ESCALATOR_CLOSURE`, `ELEVATOR_CLOSURE` |

**Active Period Logic**:

Each alert's time periods are classified as:

- **current**: Alert is ongoing or starts today (before 4:00 AM cutoff the next day)
- **upcoming**: Alert affects dates beyond today

### Alert Response Format

```json
{
  "id": "alert-id",
  "type": "DELAY",
  "active_period": [
    {
      "start": "2024-01-15T06:00:00",
      "end": "2024-01-15T22:00:00",
      "upcoming": false,
      "current": true
    }
  ],
  "stops": ["70061", "70062"],
  "routes": ["Red"],
  "header": "Red Line experiencing delays of 10-15 minutes"
}
```

---

## Historical Alerts (`s3_alerts.py`)

Historical alert data is stored in S3 and accessed through `s3_alerts.py`.

### Functions

| Function | Description |
|----------|-------------|
| `get_v2_alerts(date, params)` | Fetch alerts from legacy v2 format |
| `get_v3_alerts(date, params)` | Fetch alerts from v3 format |

The `data_funcs.alerts()` function routes to the appropriate version based on the date.

---

## Route Manifest (`route_manifest.py`)

Route and station data is loaded from static JSON files bundled with the application.

### Data Sources

| File Pattern | Content |
|-------------|---------|
| `common/constants/stations.json` | Rapid transit stations (Red, Blue, Orange, Green, Mattapan) |
| `common/constants/bus_constants/*.json` | Bus route stop data |
| `common/constants/cr_constants/*.json` | Commuter rail station data |
| `common/constants/ferry_constants/*.json` | Ferry terminal data |

### Functions

#### `get_all_routes_manifest()`

Returns a catalog of all routes grouped by type:

```python
{
    "rapid_transit": ["Red", "Orange", "Blue", "Green-B", ...],
    "bus": ["1", "4", "7", ...],
    "commuter_rail": ["CR-Fairmount", "CR-Fitchburg", ...],
    "ferry": ["Boat-F1", "Boat-F4", ...]
}
```

#### `get_route_stops(route_id)`

Returns station/stop data for a specific route, including:

- Stop names and identifiers
- Direction information
- Branch data (Green Line)
- Accessibility information
- Service date range (for bus/CR/ferry)
