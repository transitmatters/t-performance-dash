"""
Static data service for local development without AWS credentials.
Provides cached data and production API proxy functionality.
"""

import json
from pathlib import Path
from urllib.parse import urlencode

import requests

from chalicelib.config import PRODUCTION_API

# Path to static API cache directory
STATIC_DATA_DIR = Path(__file__).parent.parent.parent / "public" / "static" / "api-cache"


def _load_static_json(relative_path: str):
    """Load a JSON file from the static data directory."""
    file_path = STATIC_DATA_DIR / relative_path
    if not file_path.exists():
        return None
    with open(file_path, "r") as f:
        return json.load(f)


def proxy_request(path: str, query_params: dict = None):
    """Proxy a request to the production API."""
    url = f"{PRODUCTION_API}{path}"
    if query_params:
        url = f"{url}?{urlencode(query_params, doseq=True)}"
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    return response.json()


# Trip metrics static data
def get_trip_metrics(query_params: dict):
    """Get trip metrics from static cache."""
    line = query_params.get("line", "line-red")
    agg = query_params.get("agg", "daily")
    data = _load_static_json(f"tripmetrics/{line}_{agg}.json")
    if data is None:
        # Try to load any available data for this line
        data = _load_static_json(f"tripmetrics/{line}_weekly.json")
    return data or []


# Scheduled service static data
def get_scheduled_service(query_params: dict):
    """Get scheduled service from static cache."""
    route_id = query_params.get("route_id", "Red")
    data = _load_static_json(f"scheduledservice/{route_id}.json")
    return data or {"counts": [], "start_date_service_levels": {}, "end_date_service_levels": {}}


# Ridership static data
def get_ridership(query_params: dict):
    """Get ridership data from static cache."""
    line_id = query_params.get("line_id", "line-red")
    data = _load_static_json(f"ridership/{line_id}.json")
    return data or []


# Line delays static data
def get_line_delays(query_params: dict):
    """Get line delays from static cache."""
    line = query_params.get("line", "Red")
    agg = query_params.get("agg", "weekly")
    data = _load_static_json(f"linedelays/{line}_{agg}.json")
    return data or []


# Speed restrictions static data
def get_speed_restrictions(query_params: dict):
    """Get speed restrictions from static cache."""
    line_id = query_params.get("line_id", "Red")
    data = _load_static_json(f"speed_restrictions/{line_id}.json")
    if data is None:
        return {"available": False}
    return data


# Time predictions static data
def get_time_predictions(query_params: dict):
    """Get time predictions from static cache."""
    route_id = query_params.get("route_id", "Red")
    data = _load_static_json(f"time_predictions/{route_id}.json")
    return data or []


# Service hours static data
def get_service_hours(query_params: dict):
    """Get service hours from static cache."""
    line_id = query_params.get("line_id")
    data = _load_static_json(f"service_hours/{line_id or 'all'}.json")
    return data or []


# Aggregate data functions
def get_aggregate_traveltimes(query_params: dict):
    """Get aggregate travel times from static cache."""
    data = _load_static_json("aggregate/traveltimes.json")
    return data or {"by_date": [], "by_time": []}


def get_aggregate_headways(query_params: dict):
    """Get aggregate headways from static cache."""
    data = _load_static_json("aggregate/headways.json")
    return data or []


def get_aggregate_dwells(query_params: dict):
    """Get aggregate dwells from static cache."""
    data = _load_static_json("aggregate/dwells.json")
    return data or []


# Single day data functions
def get_headways(date: str, stops: list):
    """Get headways for a single day from static cache."""
    data = _load_static_json(f"headways/{date}.json")
    return data or []


def get_dwells(date: str, stops: list):
    """Get dwells for a single day from static cache."""
    data = _load_static_json(f"dwells/{date}.json")
    return data or []


def get_traveltimes(date: str, from_stops: list, to_stops: list):
    """Get travel times for a single day from static cache."""
    data = _load_static_json(f"traveltimes/{date}.json")
    return data or []


def get_alerts(date: str, query_params: dict):
    """Get alerts for a single day from static cache."""
    data = _load_static_json(f"alerts/{date}.json")
    return data or []


# Service ridership dashboard
def get_service_ridership_dashboard():
    """Get service ridership dashboard data from static cache."""
    data = _load_static_json("service_ridership_dashboard.json")
    return json.dumps(data) if data else "{}"
