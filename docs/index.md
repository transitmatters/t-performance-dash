# TransitMatters Data Dashboard

The TransitMatters Data Dashboard is a data visualization platform for Boston MBTA transit performance metrics. It displays headways, travel times, dwells, speed restrictions, ridership, and alerts for subway, bus, commuter rail, and ferry lines.

**Live site**: [dashboard.transitmatters.org](https://dashboard.transitmatters.org)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 + React 18 + TypeScript |
| State Management | Zustand + TanStack React Query 5 |
| Styling | Tailwind CSS 3.4 |
| Charts | Chart.js with annotation/datalabel plugins |
| Backend | Python 3.12 + AWS Chalice (serverless) |
| Data Storage | AWS DynamoDB + S3 |
| Deployment | S3 + CloudFront (frontend), Lambda (backend) |
| CI/CD | GitHub Actions |
| Package Managers | npm (frontend), uv (backend) |

## Project Structure

```
t-performance-dash/
├── pages/                  # Next.js pages (routing)
├── modules/                # Feature modules (alerts, delays, headways, etc.)
├── common/
│   ├── api/                # API client and React Query hooks
│   ├── components/         # Shared UI components
│   ├── constants/          # Configuration, colors, station data
│   ├── layouts/            # Layout components
│   ├── state/              # Zustand stores
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── server/
│   ├── app.py              # Chalice API routes
│   └── chalicelib/         # Backend modules
├── docs/                   # This documentation
└── mkdocs.yml              # MkDocs configuration
```

## Quick Links

- [Architecture Overview](architecture/overview.md) — system diagram and high-level design
- [Getting Started](development/getting-started.md) — setup and run locally
- [API Routes Reference](backend/api-routes.md) — all backend endpoints
- [Frontend Modules](frontend/modules.md) — feature module breakdown
- [Code Style Guide](development/code-style.md) — linting and formatting rules

## Transit Modes Supported

| Mode | Lines | Route IDs |
|------|-------|-----------|
| Heavy Rail | Red, Orange, Blue | `Red`, `Orange`, `Blue` |
| Light Rail | Green (B/C/D/E), Mattapan | `Green-B`, `Green-C`, `Green-D`, `Green-E`, `Mattapan` |
| Bus | 70+ routes | Numeric route IDs |
| Commuter Rail | 12 lines | `CR-*` prefix |
| Ferry | 3 routes | `Boat-*` prefix |
| The RIDE | Paratransit | `TheRIDE` |
