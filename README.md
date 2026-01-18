# TransitMatters Data Dashboard

![Release](https://img.shields.io/github/v/release/transitmatters/t-performance-dash)
![lint](https://github.com/transitmatters/t-performance-dash/workflows/lint/badge.svg?branch=main)
![build](https://github.com/transitmatters/t-performance-dash/workflows/build/badge.svg?branch=main)
![deploy](https://github.com/transitmatters/t-performance-dash/workflows/deploy/badge.svg?branch=main)
![healthcheck](https://github.com/transitmatters/t-performance-dash/workflows/healthcheck/badge.svg)

This is the repository for the [TransitMatters Data Dashboard](https://dashboard.transitmatters.org/). Client code is written in Typescript with React and Next.js, and the backend is written in Python with Chalice.

---

## 🧰 Requirements to Develop Locally

- node 20.x and npm 9.x+ required
  - With `nvm` installed, use `nvm install && nvm use`
  - verify with `node -v`
- Python 3.12 with recent uv (0.9.8 or later)
  - Verify with `python --version && uv --version`
  - `uv self update` to update uv

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
3. Execute `./deploy.sh` (for beta) or `./deploy.sh -p` (for production). If deploying from a CI platform (such as GitHub Actions) you may also want to include the `-c` flag.

Additional notes:

- If you're running this locally, your local MBTA-performance API key (which might be your own) will get uploaded to AWS!
- If you're on a platform with a non-GNU `sed`, deploy.sh might fail. On macOS, this is fixed by `brew install gnu-sed` and adding it to your PATH.
- If you get an unexplained error, check the CloudFormation stack status in AWS Console. Good luck!

## ✨ Linting and Code Style

To lint frontend and backend code, run `npm run lint` in the root directory

To lint just frontend code, run `npm run lint-frontend`

To lint just backend code, run `npm run lint-backend`

#### VSCode

If you're using VSCode, `.vscode` contains a based default workspace setup. It also includes recommended extentions that will improve the dev experience. This config is meant to be as small as possible to enable an "out of the box" easy experience for handling eslint.

## 🗂️ Data Maintenance

### Updating historical backend data

See `server/bus/gen_latest_bus_data.sh` for instructions.

## ❤️ Support TransitMatters

If you've found this app helpful or interesting, please consider [donating](https://transitmatters.org/donate) to TransitMatters to help support our mission to provide data-driven advocacy for a more reliable, sustainable, and equitable transit system in Metropolitan Boston.
