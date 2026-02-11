# Configuration

## Environment Variables

### Required

| Variable | Description |
|----------|-------------|
| `MBTA_V3_API_KEY` | API key for the MBTA v3 API. Required for real-time alerts and facility data. |

### Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `TM_BACKEND_SOURCE` | Auto-detected | Data source mode: `aws`, `prod`, or `static` |
| `TM_FRONTEND_HOST` | `localhost:3000` | Frontend host for CORS configuration |
| `MBTA_V2_API_KEY` | `""` | Legacy MBTA v2 API key |
| `DD_API_KEY` | — | Datadog API key (production monitoring) |

## Backend Source Detection (`config.py`)

The backend source is determined automatically if not explicitly set:

```python
def get_backend_source():
    env_var = os.environ.get("TM_BACKEND_SOURCE")
    if env_var:
        return env_var  # "aws", "prod", or "static"

    # Auto-detect: if AWS credentials are available, use "aws"
    # Otherwise fall back to "static"
```

| Mode | Data Source | Requirements |
|------|-------------|--------------|
| `aws` | DynamoDB + S3 directly | AWS credentials configured |
| `prod` | Proxy to `https://dashboard-api.labs.transitmatters.org` | Internet access |
| `static` | JSON files in `public/static/api-cache/` | Run `npm run get-data` first |

## Cache Strategy (`cache.py`)

Cache durations are calculated dynamically based on how recent the data is:

```python
FIFTEEN_MINUTES = 900
ONE_HOUR = 3600
ONE_DAY = 86400
THREE_MONTHS = 7776000
```

### `get_cache_max_age(params)`

| Data Recency | Cache Duration | Rationale |
|-------------|---------------|-----------|
| Today's date | 15 minutes | Data is still being updated from the live feed |
| Within 6 months | 1 hour | Data is stable but may receive minor corrections |
| Older than 6 months | 3 months | Historical data, extremely unlikely to change |

The function examines the `date`, `start_date`, or `end_date` parameters to determine recency.

## CORS Configuration

CORS is configured per-route using:

```python
cors_config = CORSConfig(
    allow_origin=f"https://{TM_FRONTEND_HOST}",
    max_age=3600  # 1 hour preflight cache
)
```

In local development, `TM_FRONTEND_HOST` defaults to `localhost:3000`.

## Datadog Integration

Datadog Lambda monitoring is enabled when the frontend host is not localhost (i.e., in deployed environments):

```python
if TM_FRONTEND_HOST != localhost:
    app.register_middleware(ConvertToMiddleware(datadog_lambda_wrapper))
```

## DynamoDB Initialization

DynamoDB resources are only initialized when running in `aws` mode:

```python
if config.BACKEND_SOURCE == "aws":
    dynamo.set_dynamodb_resource()
    speed_restrictions.set_speed_restrictions_table()
    predictions.set_time_predictions_table()
```

This avoids errors when running locally without AWS credentials.
