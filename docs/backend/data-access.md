# Data Access Layer

The backend uses two primary data stores: **DynamoDB** for pre-aggregated metrics and **S3** for raw transit event data.

## DynamoDB Tables

All DynamoDB queries are abstracted through `server/chalicelib/dynamo.py`.

| Table Name | Partition Key | Sort Key | Purpose |
|------------|--------------|----------|---------|
| `AlertDelaysDaily` | `line` | `date` | Daily alert-based delays by line |
| `AlertDelaysWeekly` | `line` | `date` | Weekly aggregated delays |
| `DeliveredTripMetrics` | `route` | `date` | Daily trip counts, time, miles by route |
| `DeliveredTripMetricsWeekly` | `line` | `date` | Weekly aggregated trip metrics |
| `DeliveredTripMetricsMonthly` | `line` | `date` | Monthly aggregated trip metrics |
| `DeliveredTripMetricsExtended` | `route` | `date` | Detailed trip metrics with direction data |
| `ScheduledServiceDaily` | `routeId` | `date` | Scheduled service counts and minutes |
| `Ridership` | `lineId` | `date` | Daily ridership counts |
| `SpeedRestrictions` | `lineId` | `date` | Speed restriction zone data |
| `TimePredictions` | `routeId` | — | Route-level time prediction models |

### Query Patterns

**Date range query** (most common):
```python
Key("partition_key").eq(value) & Key("sort_key").between(start_date, end_date)
```

**Single date lookup**:
```python
Key("partition_key").eq(value) & Key("sort_key").eq(date)
```

**Boundary queries** (for speed restrictions):
```python
# Find the nearest date with data
table.query(
    KeyConditionExpression=Key("lineId").eq(line_id) & Key("date").lte(on_date),
    ScanIndexForward=False,  # Descending order
    Limit=1
)
```

### Key Functions (`dynamo.py`)

| Function | Description |
|----------|-------------|
| `set_dynamodb_resource()` | Initialize boto3 DynamoDB resource |
| `query_daily_trips_on_route()` | Query DeliveredTripMetrics by route and date range |
| `query_scheduled_service()` | Query ScheduledServiceDaily by route and date range |
| `query_ridership()` | Query Ridership by line and date range |

---

## S3 Data Structure

**Bucket**: `tm-mbta-performance`

### Path Patterns

```
Events/
├── monthly-data/{stop_id}/Year={Y}/Month={M}/events.csv.gz        # Rapid transit (archived)
├── monthly-bus-data/{stop_id}/Year={Y}/Month={M}/events.csv.gz     # Bus (archived)
├── monthly-ferry-data/{stop_id}/Year={Y}/Month={M}/events.csv.gz   # Ferry (archived)
└── ...

Events-live/
├── daily-rapid-data/{stop_id}/Year={Y}/Month={M}/Day={D}/events.csv.gz  # Daily rapid transit
├── daily-bus-data/{stop_id}/Year={Y}/Month={M}/Day={D}/events.csv.gz    # Daily bus
└── daily-cr-data/{stop_id}/Year={Y}/Month={M}/Day={D}/events.csv.gz     # Daily commuter rail

Events-lamp/
└── daily-data/{stop_id}/Year={Y}/Month={M}/Day={D}/events.csv          # LAMP data (current)
```

### Date Routing Logic

The system uses a hybrid monthly/daily storage strategy:

1. **Monthly archives**: Used for dates before `get_max_monthly_data_date()`
2. **Daily files**: Used for dates after the monthly archive cutoff
3. **LAMP data**: Current data source, uncompressed CSV

This is handled by `s3.py` and `data_funcs.py`:

```python
def s3_date_range(start, end, stops):
    """
    For dates with monthly archives: return 1st of each month
    For dates with daily data only: return every date
    """
```

### Event CSV Format

| Column | Type | Description |
|--------|------|-------------|
| `event_type` | `string` | `ARR` (arrival) or `DEP` (departure) |
| `trip_id` | `string` | GTFS trip identifier |
| `event_time` | `string` | ISO timestamp of the event |
| `service_date` | `string` | Service date (may differ from calendar date due to 3:30am offset) |

### Key Functions (`s3.py`)

| Function | Description |
|----------|-------------|
| `download_one_event_file()` | Download and decompress a single event CSV from S3 |
| `parallel_download_events()` | Download event files for multiple dates in parallel |
| `is_cr(stop)` | Check if a stop ID belongs to commuter rail |

---

## Static Data Cache

For local development without AWS access, the backend serves pre-cached JSON files.

**Location**: `public/static/api-cache/`

### Cache Structure

```
api-cache/
├── aggregate/
│   ├── traveltimes.json
│   ├── headways.json
│   └── dwells.json
├── headways/{date}.json
├── dwells/{date}.json
├── traveltimes/{date}.json
├── alerts/{date}.json
├── tripmetrics/{line}_{agg}.json
├── scheduledservice/{route_id}.json
├── ridership/{line_id}.json
├── linedelays/{line}_{agg}.json
├── speed_restrictions/{line_id}.json
├── time_predictions/{route_id}.json
├── service_hours/{line_id}.json
└── service_ridership_dashboard.json
```

### Fetching Static Data

Run `npm run get-data` to download cached API responses from the production backend. This populates the `api-cache/` directory for offline development.

---

## Production Proxy

When `BACKEND_SOURCE` is set to `prod`, all requests are proxied to the production API:

```python
PRODUCTION_API = "https://dashboard-api.labs.transitmatters.org"

def proxy_request(path, params):
    """Forward request to production API and return response."""
    response = requests.get(f"{PRODUCTION_API}{path}", params=params)
    return response.json()
```

This allows local frontend development against real data without AWS credentials.
