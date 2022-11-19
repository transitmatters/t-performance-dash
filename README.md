# TransitMatters Data Dashboard

![lint](https://github.com/transitmatters/t-performance-dash/workflows/lint/badge.svg?branch=main)
![build](https://github.com/transitmatters/t-performance-dash/workflows/build/badge.svg?branch=main)
![deploy](https://github.com/transitmatters/t-performance-dash/workflows/deploy/badge.svg?branch=main)
![healthcheck](https://github.com/transitmatters/t-performance-dash/workflows/healthcheck/badge.svg)

This is the repository for the TransitMatters Data Dashboard. Client code is written in Typescript with React and Next.js, and the backend is written in Python with Chalice.

## Requirements to develop locally

- node 18.x preferred, but should work with anything >=16.x and <19. (verify with `node -v`)
- Python 3.9 with recent poetry (verify with python --version; poetry --version; `poetry self update` to update poetry)

## Development Instructions

1. Add `MBTA_V2_API_KEY` to your shell environment:
   - `export MBTA_V2_API_KEY='KEY'` in ~/.bashrc or ~/.zshrc
2. Add your AWS credentials (AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY) to your shell environment, OR add them to a .boto config file with awscli command `aws configure`.
3. In the root directory, run `npm install` to install all frontend and backend dependencies
4. Run `npm start` to start both the JavaScript development server and the Python backend at the same time.
5. Navigate to [http://localhost:3000](http://localhost:3000) (or the url provided after running `npm start`)

## Deployment Instructions

1. Configure AWS CLI 1.x or 2.x with your AWS access key ID and secret under the profile name `transitmatters`.
2. Configure shell environment variables for AWS ACM domain certificates.
   - `TM_FRONTEND_CERT_ARN`
   - `TM_FRONTEND_CERT_ARN_BETA`
   - `TM_BACKEND_CERT_ARN`
   - `TM_BACKEND_CERT_ARN_BETA`
   - (You may also need to set `AWS_DEFAULT_REGION` in your shell to `us-east-1`. Maybe not! We're not sure.)
3. Execute `./deploy.sh` (for beta) or `./deploy.sh -p` (for production). If deploying from a CI platform (such as GitHub Actions) you may also want to include the `-c` flag.

Additional notes:

- If you're running this locally, your local MBTA-performance API key (which might be your own) will get uploaded to AWS!
- If you're on a platform with a non-GNU `sed`, deploy.sh might fail. On macOS, this is fixed by `brew install gnu-sed` and adding it to your PATH.
- If you get an unexplained error, check the CloudFormation stack status in AWS Console. Good luck!

### Linting

To lint frontend and backend code, run `npm run lint` in the root directory

To lint just frontend code, run `npm run lint-frontend`

To lint just backend code, run `npm run lint-backend`

#### VSCode

If you're using VSCode, `.vscode` contains a based default workspace setup. It also includes recommended extentions that will improve the dev experience. This config is meant to be as small as possible to enable an "out of the box" easy experience for handling eslint.
