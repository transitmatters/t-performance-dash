"""
Route manifest service for exposing station/stop data from the dashboard.
Reads the TypeScript constants and exposes them via API endpoints.
"""

import json
from pathlib import Path
from functools import lru_cache

# Path to the common/constants directory
CONSTANTS_DIR = Path(__file__).parent.parent.parent / "common" / "constants"


def _load_json(file_path: Path):
    """Load a JSON file."""
    if not file_path.exists():
        return None
    with open(file_path, "r") as f:
        return json.load(f)


@lru_cache(maxsize=1)
def _get_rapid_transit_routes():
    """Get rapid transit routes from stations.json."""
    data = _load_json(CONSTANTS_DIR / "stations.json")
    if data is None:
        return {}
    return data


@lru_cache(maxsize=1)
def _get_bus_routes():
    """Get all bus routes from bus_constants directory."""
    bus_dir = CONSTANTS_DIR / "bus_constants"
    if not bus_dir.exists():
        return {}

    bus_routes = {}
    for json_file in bus_dir.glob("*.json"):
        data = _load_json(json_file)
        if data:
            bus_routes.update(data)
    return bus_routes


@lru_cache(maxsize=1)
def _get_commuter_rail_routes():
    """Get all commuter rail routes from cr_constants directory."""
    cr_dir = CONSTANTS_DIR / "cr_constants"
    if not cr_dir.exists():
        return {}

    cr_routes = {}
    for json_file in cr_dir.glob("*.json"):
        data = _load_json(json_file)
        if data:
            cr_routes.update(data)
    return cr_routes


@lru_cache(maxsize=1)
def _get_ferry_routes():
    """Get all ferry routes from ferry_constants directory."""
    ferry_dir = CONSTANTS_DIR / "ferry_constants"
    if not ferry_dir.exists():
        return {}

    ferry_routes = {}
    for json_file in ferry_dir.glob("*.json"):
        data = _load_json(json_file)
        if data:
            ferry_routes.update(data)
    return ferry_routes


@lru_cache(maxsize=1)
def get_all_routes_manifest():
    """
    Get a manifest of all available routes in the dashboard.
    Returns a dictionary with route categories and their available route IDs.
    """
    rapid_transit = _get_rapid_transit_routes()
    bus = _get_bus_routes()
    commuter_rail = _get_commuter_rail_routes()
    ferry = _get_ferry_routes()

    return {
        "rapid_transit": list(rapid_transit.keys()),
        "bus": list(bus.keys()),
        "commuter_rail": list(commuter_rail.keys()),
        "ferry": list(ferry.keys()),
    }


def get_route_stops(route_id: str):
    """
    Get the stop information for a specific route.
    Returns the LineMap data for the route, or None if not found.
    """
    # Check rapid transit routes first
    rapid_transit = _get_rapid_transit_routes()
    if route_id in rapid_transit:
        return rapid_transit[route_id]

    # Check bus routes
    bus = _get_bus_routes()
    if route_id in bus:
        return bus[route_id]

    # Check commuter rail routes
    commuter_rail = _get_commuter_rail_routes()
    if route_id in commuter_rail:
        return commuter_rail[route_id]

    # Check ferry routes
    ferry = _get_ferry_routes()
    if route_id in ferry:
        return ferry[route_id]

    return None
