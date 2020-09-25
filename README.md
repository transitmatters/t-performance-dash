## TransitMatters Data Dashboard
![](https://github.com/transitmatters/t-performance-dash/workflows/lint/badge.svg)

This is the repository for the TransitMatters data dashboard. Client code is written in JavaScript with React, and the backend is written in Python with Flask.

## Requirements to develop locally
* node 12.x LTS (verify with `node -v`)
* Python 3.7 with pipenv (verify with `python --version; pipenv --version`)

## Development instructions
1. Add `MBTA_V2_API_KEY` to your shell environment:
	* `export MBTA_V2_API_KEY='KEY'` in ~/.bashrc or ~/.zshrc
2. In the root directory, run `npm install` to install all frontend and backend dependencies
3. Run `npm start` to start both the JavaScript development server and the Python backend at the same time.
4. Navigate to [http://localhost:3000](http://localhost:3000) (or the url provided after running `npm start`)
