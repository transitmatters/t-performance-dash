# Architecture Overview

The Data Dashboard is a **static-site + serverless** architecture. The frontend is a Next.js static export served via S3 and CloudFront. The backend is an AWS Chalice (Python) application deployed as Lambda functions behind API Gateway.

## System Architecture

```mermaid
graph TB
    subgraph Client
        Browser[Browser]
    end

    subgraph AWS CloudFront
        CDN[CloudFront CDN]
    end

    subgraph Frontend - S3
        StaticSite[Next.js Static Export<br/>HTML/JS/CSS]
    end

    subgraph Backend - Lambda
        APIGateway[API Gateway]
        Chalice[Chalice App<br/>Python 3.12]
    end

    subgraph Data Sources
        DynamoDB[(DynamoDB<br/>Pre-aggregated metrics)]
        S3Data[(S3 Bucket<br/>Raw event CSVs)]
        MBTAAPI[MBTA v3 API<br/>Real-time alerts]
    end

    Browser -->|HTTPS| CDN
    CDN -->|Static files| StaticSite
    CDN -->|/api/*| APIGateway
    APIGateway --> Chalice
    Chalice --> DynamoDB
    Chalice --> S3Data
    Chalice --> MBTAAPI
```

## Frontend Architecture

The frontend follows a **module-based architecture** where each feature area (delays, headways, speed, etc.) is a self-contained module with its own components.

```mermaid
graph TB
    subgraph Layout System
        App[_app.tsx] --> PrimaryLayout
        PrimaryLayout --> LoadPresetsLayout
        LoadPresetsLayout --> NavLayout
        NavLayout --> SecondaryLayout
        SecondaryLayout --> DashboardLayout
        SecondaryLayout --> LandingLayout
    end

    subgraph Pages
        DashboardLayout --> LinePage["[line]/ pages"]
        DashboardLayout --> SystemPage["system/ pages"]
        DashboardLayout --> TripPage["[line]/trips/ pages"]
        LandingLayout --> Landing[Landing Page]
    end

    subgraph Modules
        LinePage --> Delays
        LinePage --> Speed
        LinePage --> Service
        LinePage --> Ridership
        LinePage --> SlowZones
        LinePage --> Predictions
    end

    subgraph Common
        Modules --> Hooks[API Hooks<br/>React Query]
        Modules --> Stores[Zustand Stores]
        Modules --> Components[Shared Components]
        Hooks --> APIClient[API Client]
    end
```

## Backend Architecture

The backend uses a facade pattern — `data_funcs.py` and `static_data.py` abstract the data source, allowing the same API routes to work against AWS services, cached static files, or a production proxy.

```mermaid
graph TB
    subgraph Chalice Routes
        app[app.py<br/>Route handlers]
    end

    subgraph Data Layer
        app --> DataFuncs[data_funcs.py<br/>Event data facade]
        app --> Dynamo[dynamo.py<br/>DynamoDB queries]
        app --> Alerts[mbta_v3.py<br/>Real-time alerts]
        app --> StaticData[static_data.py<br/>Static/proxy data]
    end

    subgraph Processing
        app --> Aggregation[aggregation.py<br/>Time-series stats]
        app --> Sampling[sampling.py<br/>Resample daily/weekly/monthly]
        app --> DelaysProc[delays.py<br/>Alert delay calc]
        app --> SpeedProc[speed.py<br/>Trip metrics calc]
    end

    subgraph Storage
        DataFuncs --> S3[S3<br/>Event CSVs]
        DataFuncs --> S3Historical[s3_historical.py<br/>CSV parsing]
        Dynamo --> DDB[(DynamoDB)]
        StaticData --> JSONCache[Static JSON<br/>api-cache/]
        StaticData --> ProdProxy[Production API<br/>Proxy]
    end
```

## Key Design Decisions

### Static Export + Serverless
The frontend uses `next export` to produce a fully static site. There is no server-side rendering — all data fetching happens client-side via React Query. This allows the frontend to be served entirely from S3/CloudFront with no compute costs.

### Three Backend Modes
The backend can run in three modes controlled by `TM_BACKEND_SOURCE`:

| Mode | Use Case | Data Source |
|------|----------|-------------|
| `aws` | Production / full local dev | DynamoDB + S3 (requires AWS credentials) |
| `prod` | Local dev without AWS | Proxies requests to production API |
| `static` | Offline / CI | Cached JSON files in `public/static/api-cache/` |

### Module Isolation
Each feature (delays, headways, speed, etc.) lives in its own `modules/` directory with components that are only used by that feature. Shared infrastructure lives in `common/`.

### URL-Driven State
Date ranges and station selections are persisted in URL query parameters. This allows users to share links to specific views and enables browser back/forward navigation through state changes.
