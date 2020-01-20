## TransitMatters Data Dashboard

This is the repository for the TransitMatters data dashboard. Client code is written in JavaScript with React, and the backend is written in Python with Flask.

## Requirements to develop locally
* node
* Python 3.x with pip + pipenv
* Your MBTA Performance API key pasted into `server/secrets.py`

## Development instructions
1. In the root directory, run `npm install` to install all frontend and backend dependencies
2. Run `npm start` to start both the JavaScript development server and the Python backend
3. Navigate to [http://localhost:3000](http://localhost:3000) (or the url provided after running `npm start`)