# TransitMatters Data Dashboard

![Release](https://img.shields.io/github/v/release/transitmatters/t-performance-dash)
![lint](https://github.com/transitmatters/t-performance-dash/workflows/lint/badge.svg?branch=main)
![build](https://github.com/transitmatters/t-performance-dash/workflows/build/badge.svg?branch=main)
![deploy](https://github.com/transitmatters/t-performance-dash/workflows/deploy/badge.svg?branch=main)
![healthcheck](https://github.com/transitmatters/t-performance-dash/workflows/healthcheck/badge.svg)

This is the repository for the [TransitMatters Data Dashboard](https://dashboard.transitmatters.org/). Client code is written in Typescript with React, Vite and TanStack Router, and the backend is written in Python with Chalice.

---

## 🧰 Requirements to Develop Locally

- node 26.x and npm 11.x+ required
  - With `nvm` installed, use `nvm install && nvm use`
  - verify with `node -v`
- Python 3.14 with recent uv (0.9.8 or later)
  - Verify with `python --version && uv --version`
  - `uv self update` to update uv
- With [mise](https://mise.jdx.dev) installed, `mise trust && mise install` sets up Node and Python (versions are pinned in `.nvmrc` / `.python-version`)
- `wget`, used by `npm run get-data` (macOS doesn't ship it: `brew install wget`)

## 🧪 Local Development

1. Add `MBTA_V3_API_KEY` to your shell environment:
   - `export MBTA_V3_API_KEY='KEY'` in ~/.bashrc or ~/.zshrc
2. In the root directory, run `npm install` to install all frontend and backend dependencies
3. Run `npm start` to start both the JavaScript development server and the Python backend at the same time.
4. Navigate to [http://localhost:3000](http://localhost:3000) (or the url provided after running `npm start`)

### Backend Data Source

The backend supports three data source modes, controlled by the `TM_BACKEND_SOURCE` environment variable:

| Mode     | Description                                                                                       |
| -------- | ------------------------------------------------------------------------------------------------- |
| `aws`    | Use local AWS credentials to query DynamoDB/S3 directly (default if AWS credentials are detected) |
| `prod`   | Proxy requests to the production API (live data, no AWS credentials needed)                       |
| `static` | Use cached sample data (offline development, default if no AWS credentials)                       |

**For external contributors (no AWS access):**
No configuration needed! The backend auto-detects missing AWS credentials and falls back to cached sample data. For live data without AWS credentials:

```bash
export TM_BACKEND_SOURCE=prod
```

**For TransitMatters members (with AWS access):**

```bash
export TM_BACKEND_SOURCE=aws
```

## ☁️ AWS Setup

If you have access to AWS credentials, add them to your local setup for a better development experience. If you don't yet have TransitMatters AWS credentials, reach out in [slack](https://transitmatters.slack.com/archives/GSJ6F35DW).

1. Add your AWS credentials (AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY) to your shell environment, OR add them to a .boto config file with awscli command `aws configure`.
2. Ensure that AWS is set to read from/to `us-east-1` via `export AWS_DEFAULT_REGION=us-east-1` or with an aws config

AWS access is not strictly required for development - see "Backend Data Source" above for alternatives

## 🚀 Deployment Instructions

1. Configure AWS CLI 2.x with your AWS access key ID and secret under the profile name `transitmatters`.
2. Configure shell environment variables for AWS ACM domain certificates.
   - `TM_FRONTEND_CERT_ARN`
   - `TM_LABS_WILDCARD_CERT_ARN`
   - (You may also need to set `AWS_DEFAULT_REGION` in your shell to `us-east-1`. Maybe not! We're not sure.)
   - For beta only, `DD_RUM_APPLICATION_ID` and `DD_RUM_CLIENT_TOKEN` enable Datadog RUM. Prod builds ignore them.
3. Execute `./deploy.sh` (for beta) or `./deploy.sh -p` (for production). If deploying from a CI platform (such as GitHub Actions) you may also want to include the `-c` flag.

Additional notes:

- If you're running this locally, your local MBTA-performance API key (which might be your own) will get uploaded to AWS!
- If you're on a platform with a non-GNU `sed`, deploy.sh might fail. On macOS, this is fixed by `brew install gnu-sed` and adding it to your PATH.
- If you get an unexplained error, check the CloudFormation stack status in AWS Console. Good luck!

## 🗺️ Project Structure

```
routes/             # TanStack Router file routes; routes pick a layout via `staticData` (routeTree.gen.ts is generated)
modules/            # Self-contained feature modules (alerts, delays, headways, slowzones, etc.)
common/
  api/              # API client and React Query hooks (common/api/hooks/)
  components/       # Shared UI components
  constants/        # Date ranges, line configurations, colors
  state/            # Zustand stores (date and station selection)
  types/            # TypeScript types (lines.ts has line and route definitions)
  utils/            # Utility functions
server/
  app.py            # Chalice API routes
  chalicelib/       # Backend modules; data sources are abstracted in data_funcs.py, s3.py, dynamo.py
  chalicelib/models.py  # Pydantic response models
  chalicelib/config.py  # Backend configuration
  openapi.json      # Generated API spec
```

The frontend is a static Vite + React SPA using TanStack Router, Zustand, TanStack React Query, Tailwind CSS, and Chart.js, with prerendered HTML per route. The backend is Python on AWS Chalice, reading from DynamoDB and S3.

When adding a `/$line/...` page, also add its lines to `common/constants/staticRoutes.ts`, which drives 404s and the prerendered HTML. For links and URL state, use `common/components/general/Link` and the hooks in `common/utils/router.tsx`.

Other useful commands:

- `npm run get-data` fetches static data for local development (runs automatically with `npm start`)
- `npm run storybook` starts Storybook on port 6006
- `npm run generate-openapi` regenerates `server/openapi.json`. Run it after changing API routes or models; CI fails if the committed spec is out of date.

## ✨ Linting, Code Style, and Tests

To lint frontend and backend code, run `npm run lint` in the root directory

To lint just frontend code, run `npm run lint-frontend` (or `npm run lint-frontend-fix` to auto-fix)

To lint just backend code, run `npm run lint-backend` (or `npm run lint-backend-fix` to auto-fix)

To run frontend tests, run `npm test`

To run backend tests, run `cd server && uv run pytest`

Frontend code uses ESLint and oxfmt, enforced import ordering, and type imports (`import type { Foo }`). Backend code uses Ruff with a 120 character line length.

Frontend formatting uses [oxfmt](https://oxc.rs/docs/guide/usage/formatter.html). Run `npm run format` to format everything.

#### VSCode

If you're using VSCode, `.vscode` contains a based default workspace setup. It also includes recommended extentions that will improve the dev experience. This config is meant to be as small as possible to enable an "out of the box" easy experience for handling eslint and oxfmt.

## 🗂️ Data Maintenance

### Updating historical backend data

Historical data is processed in [mbta-performance](https://github.com/transitmatters/mbta-performance). See its [historic data runbook](https://github.com/transitmatters/mbta-performance/blob/main/mbta-performance/chalicelib/historic/README.md).

GTFS archives used by the bus scripts are downloaded to `data/gtfs_archives/` by default. Set `GTFS_DATA_DIR` to share them with other TransitMatters repos (they'll go in `$GTFS_DATA_DIR/gtfs_archives`).

## ❤️ Support TransitMatters

If you've found this app helpful or interesting, please consider [donating](https://transitmatters.org/donate) to TransitMatters to help support our mission to provide data-driven advocacy for a more reliable, sustainable, and equitable transit system in Metropolitan Boston.
