"""
Fetch static data from production API for local development without AWS.
This script downloads sample data for all major endpoints and caches it locally.

Skips downloading if:
- TM_BACKEND_SOURCE is set to 'aws' or 'prod' (cache not needed)
- Cache was already downloaded today (to avoid repeated downloads)
"""

import json
import os
from datetime import date, datetime, timedelta
from pathlib import Path

import requests

PRODUCTION_API = "https://dashboard-api.labs.transitmatters.org"
OUTPUT_DIR = Path(__file__).parent.parent.parent / "public" / "static" / "api-cache"
CACHE_MARKER_FILE = OUTPUT_DIR / ".last_fetched"

# Configuration for what data to fetch
RAPID_TRANSIT_LINES = ["line-red", "line-blue", "line-orange", "line-green", "line-mattapan"]
ROUTE_IDS = ["Red", "Blue", "Orange", "Green-B", "Green-C", "Green-D", "Green-E", "Mattapan"]
DELAY_LINES = ["Red", "Blue", "Orange", "Green-B", "Green-C", "Green-D", "Green-E", "Mattapan"]
AGG_TYPES = ["daily", "weekly", "monthly"]

# Date ranges for sample data (last 90 days)
END_DATE = date.today()
START_DATE = END_DATE - timedelta(days=90)


def fetch_and_save(endpoint: str, output_path: Path, params: dict = None):
    """Fetch data from production API and save to local file."""
    url = f"{PRODUCTION_API}{endpoint}"
    try:
        print(f"Fetching {url}...")
        response = requests.get(url, params=params, timeout=60)
        response.raise_for_status()
        data = response.json()

        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w") as f:
            json.dump(data, f, indent=2)
        print(f"  Saved to {output_path}")
        return True
    except requests.RequestException as e:
        print(f"  Error fetching {url}: {e}")
        return False


def fetch_trip_metrics():
    """Fetch trip metrics for all lines and aggregation types."""
    print("\n=== Fetching Trip Metrics ===")
    for line in RAPID_TRANSIT_LINES:
        for agg in AGG_TYPES:
            params = {
                "line": line,
                "agg": agg,
                "start_date": START_DATE.isoformat(),
                "end_date": END_DATE.isoformat(),
            }
            output_path = OUTPUT_DIR / "tripmetrics" / f"{line}_{agg}.json"
            fetch_and_save("/api/tripmetrics", output_path, params)


def fetch_scheduled_service():
    """Fetch scheduled service data for all routes."""
    print("\n=== Fetching Scheduled Service ===")
    for route_id in ROUTE_IDS:
        params = {
            "route_id": route_id,
            "agg": "weekly",
            "start_date": START_DATE.isoformat(),
            "end_date": END_DATE.isoformat(),
        }
        output_path = OUTPUT_DIR / "scheduledservice" / f"{route_id}.json"
        fetch_and_save("/api/scheduledservice", output_path, params)


def fetch_ridership():
    """Fetch ridership data for all lines."""
    print("\n=== Fetching Ridership ===")
    for line in RAPID_TRANSIT_LINES:
        params = {
            "line_id": line,
            "start_date": START_DATE.isoformat(),
            "end_date": END_DATE.isoformat(),
        }
        output_path = OUTPUT_DIR / "ridership" / f"{line}.json"
        fetch_and_save("/api/ridership", output_path, params)


def fetch_line_delays():
    """Fetch line delays for all lines."""
    print("\n=== Fetching Line Delays ===")
    for line in DELAY_LINES:
        for agg in ["daily", "weekly"]:
            params = {
                "line": line,
                "agg": agg,
                "start_date": START_DATE.isoformat(),
                "end_date": END_DATE.isoformat(),
            }
            output_path = OUTPUT_DIR / "linedelays" / f"{line}_{agg}.json"
            fetch_and_save("/api/linedelays", output_path, params)


def fetch_speed_restrictions():
    """Fetch speed restrictions for all lines."""
    print("\n=== Fetching Speed Restrictions ===")
    for line_id in ["Red", "Blue", "Orange", "Green"]:
        params = {
            "line_id": line_id,
            "date": END_DATE.isoformat(),
        }
        output_path = OUTPUT_DIR / "speed_restrictions" / f"{line_id}.json"
        fetch_and_save("/api/speed_restrictions", output_path, params)


def fetch_time_predictions():
    """Fetch time predictions for all routes."""
    print("\n=== Fetching Time Predictions ===")
    for route_id in ROUTE_IDS:
        params = {"route_id": route_id}
        output_path = OUTPUT_DIR / "time_predictions" / f"{route_id}.json"
        fetch_and_save("/api/time_predictions", output_path, params)


def fetch_service_hours():
    """Fetch service hours for all lines."""
    print("\n=== Fetching Service Hours ===")
    for line in RAPID_TRANSIT_LINES:
        params = {
            "line_id": line,
            "agg": "weekly",
            "start_date": START_DATE.isoformat(),
            "end_date": END_DATE.isoformat(),
        }
        output_path = OUTPUT_DIR / "service_hours" / f"{line}.json"
        fetch_and_save("/api/service_hours", output_path, params)


def fetch_service_ridership_dashboard():
    """Fetch service ridership dashboard data."""
    print("\n=== Fetching Service Ridership Dashboard ===")
    output_path = OUTPUT_DIR / "service_ridership_dashboard.json"
    fetch_and_save("/api/service_ridership_dashboard", output_path)


def fetch_sample_single_day_data():
    """Fetch sample single-day data for recent dates."""
    print("\n=== Fetching Sample Single Day Data ===")

    # Use a few sample dates from the past week
    sample_dates = [END_DATE - timedelta(days=i) for i in range(1, 4)]

    # Sample stops for Red Line
    sample_stops = ["70061", "70063"]  # Park Street, Downtown Crossing

    for sample_date in sample_dates:
        date_str = sample_date.isoformat()

        # Headways
        params = {"stop": sample_stops}
        output_path = OUTPUT_DIR / "headways" / f"{date_str}.json"
        fetch_and_save(f"/api/headways/{date_str}", output_path, params)

        # Dwells
        output_path = OUTPUT_DIR / "dwells" / f"{date_str}.json"
        fetch_and_save(f"/api/dwells/{date_str}", output_path, params)

        # Travel times
        params = {"from_stop": sample_stops[:1], "to_stop": sample_stops[1:]}
        output_path = OUTPUT_DIR / "traveltimes" / f"{date_str}.json"
        fetch_and_save(f"/api/traveltimes/{date_str}", output_path, params)

        # Alerts
        output_path = OUTPUT_DIR / "alerts" / f"{date_str}.json"
        fetch_and_save(f"/api/alerts/{date_str}", output_path, {"route": ["Red"]})


def fetch_aggregate_data():
    """Fetch aggregate data samples."""
    print("\n=== Fetching Aggregate Data ===")

    # Sample stops for Red Line
    sample_stops = ["70061", "70063"]

    # Aggregate headways
    params = {
        "stop": sample_stops,
        "start_date": START_DATE.isoformat(),
        "end_date": END_DATE.isoformat(),
    }
    output_path = OUTPUT_DIR / "aggregate" / "headways.json"
    fetch_and_save("/api/aggregate/headways", output_path, params)

    # Aggregate dwells
    output_path = OUTPUT_DIR / "aggregate" / "dwells.json"
    fetch_and_save("/api/aggregate/dwells", output_path, params)

    # Aggregate travel times
    params = {
        "from_stop": sample_stops[:1],
        "to_stop": sample_stops[1:],
        "start_date": START_DATE.isoformat(),
        "end_date": END_DATE.isoformat(),
    }
    output_path = OUTPUT_DIR / "aggregate" / "traveltimes.json"
    fetch_and_save("/api/aggregate/traveltimes2", output_path, params)


def should_skip_fetch():
    """
    Determine if we should skip fetching static data.
    Returns (should_skip, reason) tuple.
    """
    # Check if TM_BACKEND_SOURCE is set to aws or prod
    backend_source = os.environ.get("TM_BACKEND_SOURCE", "").lower()
    if backend_source in ("aws", "prod"):
        return True, f"TM_BACKEND_SOURCE is '{backend_source}' (static cache not needed)"

    # Check if cache was already fetched today
    if CACHE_MARKER_FILE.exists():
        try:
            last_fetched = datetime.fromisoformat(CACHE_MARKER_FILE.read_text().strip())
            if last_fetched.date() == date.today():
                return True, f"Cache already fetched today ({last_fetched.strftime('%Y-%m-%d %H:%M')})"
        except (ValueError, OSError):
            pass  # Invalid marker file, proceed with fetch

    return False, None


def update_cache_marker():
    """Update the cache marker file with current timestamp."""
    CACHE_MARKER_FILE.parent.mkdir(parents=True, exist_ok=True)
    CACHE_MARKER_FILE.write_text(datetime.now().isoformat())


def main():
    # Check if we should skip fetching
    should_skip, reason = should_skip_fetch()
    if should_skip:
        print(f"Skipping static data fetch: {reason}")
        print("To force refresh, delete the cache directory or .last_fetched marker")
        return

    print(f"Fetching static data from {PRODUCTION_API}")
    print(f"Date range: {START_DATE} to {END_DATE}")
    print(f"Output directory: {OUTPUT_DIR}")

    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Fetch all data types
    fetch_trip_metrics()
    fetch_scheduled_service()
    fetch_ridership()
    fetch_line_delays()
    fetch_speed_restrictions()
    fetch_time_predictions()
    fetch_service_hours()
    fetch_service_ridership_dashboard()
    fetch_sample_single_day_data()
    fetch_aggregate_data()

    # Update the marker file
    update_cache_marker()

    print("\n=== Done! ===")
    print(f"Static data cached to {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
