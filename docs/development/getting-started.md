# Getting Started

## Prerequisites

| Tool | Version | Installation |
|------|---------|-------------|
| Node.js | >= 24.12.0 | [nodejs.org](https://nodejs.org) or use Volta |
| npm | >= 11.0.0 | Bundled with Node.js |
| Python | 3.12.x (exactly) | [python.org](https://python.org) |
| uv | Latest | [docs.astral.sh/uv](https://docs.astral.sh/uv/) |

!!! note "Version Management"
    The project uses [Volta](https://volta.sh/) for Node.js version management. The required version is pinned in `package.json`.

## Setup

### 1. Clone the Repository

```bash
git clone https://github.com/transitmatters/t-performance-dash.git
cd t-performance-dash
```

### 2. Install Dependencies

```bash
npm install
```

This runs `npm ci` for frontend dependencies and automatically runs `uv sync` in the `server/` directory for backend dependencies (via the `postinstall` hook).

### 3. Set Environment Variables

Create a `.env` file or export the required variables:

```bash
# Required: MBTA API key (get one at https://api-v3.mbta.com/)
export MBTA_V3_API_KEY=your_api_key_here

# Optional: Backend data source
# "aws"    - Direct AWS access (requires credentials)
# "prod"   - Proxy to production API (recommended for most contributors)
# "static" - Cached JSON files (offline development)
export TM_BACKEND_SOURCE=prod
```

### 4. Fetch Static Data (Optional)

If using `static` mode or for offline development:

```bash
npm run get-data
```

This downloads cached API responses to `public/static/api-cache/`.

## Running Locally

### Full Stack (Frontend + Backend)

```bash
npm start
```

This starts both servers concurrently:

- **Frontend**: Next.js dev server at `http://localhost:3000`
- **Backend**: Chalice local server at `http://localhost:5000`

Next.js automatically proxies `/api/*` requests to the backend.

### Frontend Only

```bash
npm run start-react
```

Useful when using `prod` or `static` backend modes.

### Backend Only

```bash
npm run start-python
```

Starts the Chalice local server at `http://localhost:5000`.

## Build

```bash
npm run build
```

Produces a static export in the `out/` directory. This is what gets deployed to S3.

## Storybook

```bash
npm run storybook
```

Opens Storybook at `http://localhost:6006` for component development and documentation.

## Common Issues

### `uv sync` fails
Ensure you have Python 3.12.x installed (not 3.11 or 3.13). The project is pinned to `>=3.12,<3.13`.

### Backend returns empty data
If using `static` mode, make sure you've run `npm run get-data` to populate the cache.

### CORS errors in browser
The backend CORS configuration expects requests from `https://localhost:3000`. Make sure you're accessing the frontend via `http://localhost:3000`, not an IP address.

### Missing API key
Real-time alerts and facilities won't work without `MBTA_V3_API_KEY`. Get a free key at [api-v3.mbta.com](https://api-v3.mbta.com/).
