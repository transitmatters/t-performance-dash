# Backend Overview

The backend is a Python 3.12 application built with [AWS Chalice](https://aws.github.io/chalice/), a serverless framework that deploys as Lambda functions behind API Gateway.

## Architecture

```
server/
├── app.py                  # Chalice route definitions
├── chalicelib/
│   ├── aggregation.py      # Time-series aggregation (pandas)
│   ├── cache.py            # Cache duration logic
│   ├── config.py           # Environment configuration
│   ├── constants.py        # Line/route mappings
│   ├── data_funcs.py       # Raw event data facade
│   ├── date_utils.py       # Date parsing utilities
│   ├── delays.py           # Alert-based delay calculations
│   ├── dynamo.py           # DynamoDB query abstractions
│   ├── mbta_v3.py          # MBTA v3 API client
│   ├── models.py           # Pydantic request/response models
│   ├── parallel.py         # ThreadPoolExecutor wrapper
│   ├── predictions.py      # Time prediction queries
│   ├── ridership.py        # Ridership aggregation
│   ├── route_manifest.py   # Route/stop catalog service
│   ├── s3.py               # S3 event file operations
│   ├── s3_alerts.py        # Historical alert data from S3
│   ├── s3_historical.py    # CSV event parsing into metrics
│   ├── sampling.py         # Daily/weekly/monthly resampling
│   ├── scheduled_service.py # Service schedule queries
│   ├── service_hours.py    # Scheduled vs delivered comparison
│   ├── service_ridership_dashboard.py # Dashboard summary data
│   ├── speed.py            # Trip metrics aggregation
│   ├── speed_restrictions.py # Speed restriction zones
│   └── static_data.py      # Static cache + production proxy
├── openapi.json            # Auto-generated API specification
└── pyproject.toml          # Python project configuration
```

## Backend Source Modes

The backend can run against three different data sources, controlled by the `TM_BACKEND_SOURCE` environment variable:

| Mode | Description | When to Use |
|------|-------------|-------------|
| `aws` | Direct AWS access (DynamoDB + S3) | Production, full local dev with AWS credentials |
| `prod` | Proxy all requests to production API | Local dev without AWS credentials |
| `static` | Serve cached JSON files from `public/static/api-cache/` | Offline development, CI |

The mode is auto-detected by `config.py`: if AWS credentials are found, it defaults to `aws`; otherwise it falls back to `static`.

## Request Handling Pattern

Every route in `app.py` follows the same pattern:

```python
@app.route("/api/endpoint", cors=cors_config, docs=Docs(response=ResponseModel))
def endpoint_handler():
    query_params = app.current_request.query_params or {}
    cache_max_age = cache.get_cache_max_age(query_params)

    if config.BACKEND_SOURCE == "static":
        data = static_data.get_cached_data(query_params)
    elif config.BACKEND_SOURCE == "prod":
        data = static_data.proxy_request("/api/endpoint", query_params)
    else:
        # Real data fetching from AWS
        data = some_module.fetch_data(query_params)

    return Response(
        body=json.dumps(data),
        headers={
            "Content-Type": "application/json",
            "Cache-Control": f"public, max-age={cache_max_age}",
        },
    )
```

## Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `chalice` | 1.32.0 | Serverless framework |
| `pydantic` | ~2.11 | Request/response validation |
| `pandas` | ~2.2 | Data processing and aggregation |
| `numpy` | ~1.26 | Numerical computing |
| `boto3` | ~1.39 | AWS SDK (DynamoDB, S3) |
| `requests` | ~2.32 | HTTP client for MBTA API |
| `datadog_lambda` | ~8.118 | Production monitoring |
