## TransitMatters Data Dashboard
![lint](https://github.com/transitmatters/t-performance-dash/workflows/lint/badge.svg)
![deploy](https://github.com/transitmatters/t-performance-dash/workflows/deploy/badge.svg)

This is the repository for the TransitMatters data dashboard. Client code is written in JavaScript with React, and the backend is written in Python with Chalice.

## Requirements to develop locally
* node 12.x LTS (verify with `node -v`)
* Python 3.7 with pipenv (verify with `python --version; pipenv --version`)

## Development Instructions
1. Add `MBTA_V2_API_KEY` to your shell environment:
	* `export MBTA_V2_API_KEY='KEY'` in ~/.bashrc or ~/.zshrc
2. In the root directory, run `npm install` to install all frontend and backend dependencies
3. Run `npm start` to start both the JavaScript development server and the Python backend at the same time.
4. Navigate to [http://localhost:3000](http://localhost:3000) (or the url provided after running `npm start`)

## Deployment Instructions
1. Configure AWS CLI 1.x or 2.x with your AWS access key ID and secret under the profile name `transitmatters`.
2. Configure shell environment variables for AWS ACM domain certificates.
	* `TM_FRONTEND_CERT_ARN`
	* `TM_FRONTEND_CERT_ARN_BETA`
	* `TM_BACKEND_CERT_ARN`
	* `TM_BACKEND_CERT_ARN_BETA`
	* (You may also need to set `AWS_DEFAULT_REGION` in your shell to `us-east-1`. Maybe not! We're not sure.)
3. Execute `./deploy.sh` (for production) or `./deploy.sh beta` (for beta).

Additional notes:
- If you're running this locally, your local MBTA-performance API key (which might be your own) will get uploaded to AWS!
- If you're on a platform with a non-GNU `sed`, deploy.sh might fail. On macOS, this is fixed by `brew install gnu-sed` and adding it to your PATH.
- If you get an unexplained error, check the CloudFormation stack status in AWS Console. Good luck!

### Linting
To lint frontend and backend code, run `npm run lint` in the root directory

To lint just frontend code, run `npm run lint-frontend`

To lint just backend code, run `npm run lint-backend`
