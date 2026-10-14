#!/usr/bin/env python
"""
Capture real responses from the production API as test fixtures for the response models.

Each sample below is fetched from production, trimmed so the fixture stays small, and written to
tests/fixtures/api_samples/<endpoint>/<case>.json. A manifest.json next to them records the URL,
HTTP status and capture time of every sample. tests/test_api_models.py validates every fixture
against the Pydantic response models and against the generated openapi.json.

Re-run this when the API's response shapes change, then review the fixture diff:

    cd server && uv run python -m scripts.capture_api_samples
"""

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import requests

PRODUCTION_API = "https://dashboard-api.labs.transitmatters.org"
OUTPUT_DIR = Path(__file__).parent.parent / "tests" / "fixtures" / "api_samples"

# Trim limits: lists keep their first MAX_LIST_ITEMS entries; objects with more than MAX_MAP_KEYS
# keys are keyed maps (by date, line ID, ...) and keep their first KEPT_MAP_KEYS entries.
MAX_LIST_ITEMS = 25
MAX_MAP_KEYS = 40
KEPT_MAP_KEYS = 10

DAY = "2026-10-07"
ARCHIVE_DAY = "2026-06-03"
MONTH = {"start_date": "2026-09-01", "end_date": "2026-09-30"}
QUARTER = {"start_date": "2026-06-01", "end_date": "2026-09-30"}
WEEK = {"start_date": "2026-09-01", "end_date": "2026-09-07"}

RT_TRAVEL = {"from_stop": ["70061"], "to_stop": ["70105"]}
BUS_TRAVEL = {"from_stop": ["28-1-1728"], "to_stop": ["28-1-21148"]}
CR_TRAVEL = {"from_stop": ["CR-Fairmount_1_FB-0095-04"], "to_stop": ["CR-Fairmount_1_NEC-2287"]}

# (fixture name, API path, query params, expected HTTP status)
SAMPLES = [
    ("headways/rapid_transit", f"/api/headways/{DAY}", {"stop": ["70061"]}, 200),
    ("headways/bus", f"/api/headways/{DAY}", {"stop": ["28-1-1728"]}, 200),
    ("headways/bus_without_benchmark", f"/api/headways/{DAY}", {"stop": ["1-0-93"]}, 200),
    ("headways/bus_monthly_archive", f"/api/headways/{ARCHIVE_DAY}", {"stop": ["28-1-1728"]}, 200),
    ("headways/commuter_rail", f"/api/headways/{DAY}", {"stop": ["CR-Fairmount_1_FB-0095-04"]}, 200),
    ("headways/empty", f"/api/headways/{DAY}", {"stop": ["unknown-stop"]}, 200),
    ("dwells/rapid_transit", f"/api/dwells/{DAY}", {"stop": ["70063"]}, 200),
    ("dwells/bus", f"/api/dwells/{DAY}", {"stop": ["1-0-93"]}, 200),
    ("dwells/commuter_rail", f"/api/dwells/{DAY}", {"stop": ["CR-Fairmount_1_DB-2240-02"]}, 200),
    ("traveltimes/rapid_transit", f"/api/traveltimes/{DAY}", RT_TRAVEL, 200),
    ("traveltimes/bus", f"/api/traveltimes/{DAY}", BUS_TRAVEL, 200),
    ("traveltimes/bus_monthly_archive", f"/api/traveltimes/{ARCHIVE_DAY}", BUS_TRAVEL, 200),
    ("traveltimes/commuter_rail", f"/api/traveltimes/{DAY}", CR_TRAVEL, 200),
    ("alerts_by_date/v2_archive", "/api/alerts/2023-05-01", {"route": ["Red"]}, 200),
    ("alerts_by_date/v3_archive", f"/api/alerts/{DAY}", {"route": ["Red"]}, 200),
    ("alerts_by_date/bus", f"/api/alerts/{DAY}", {"route": ["1"]}, 200),
    ("alerts_by_date/before_archive", "/api/alerts/2016-01-01", {"route": ["Red"]}, 200),
    ("alerts_live/rapid_transit", "/api/alerts", {"route_type": "0,1", "activity": "BOARD,EXIT,RIDE"}, 200),
    (
        "alerts_live/bus",
        "/api/alerts",
        {"route": "1,15,22,23,28,32,39,57,66,71,73,77,111,116,117", "activity": "BOARD,EXIT,RIDE"},
        200,
    ),
    (
        "alerts_live/accessibility",
        "/api/alerts",
        {"activity": "USING_ESCALATOR,USING_WHEELCHAIR", "stop": "place-dwnxg,place-pktrm,place-alfcl"},
        200,
    ),
    ("facilities/alewife", "/api/facilities", {"stop": "place-alfcl"}, 200),
    ("aggregate_traveltimes/rapid_transit", "/api/aggregate/traveltimes", {**MONTH, **RT_TRAVEL}, 200),
    ("aggregate_traveltimes/bus", "/api/aggregate/traveltimes", {**MONTH, **BUS_TRAVEL}, 200),
    ("aggregate_traveltimes2/rapid_transit", "/api/aggregate/traveltimes2", {**MONTH, **RT_TRAVEL}, 200),
    ("aggregate_traveltimes2/bus", "/api/aggregate/traveltimes2", {**MONTH, **BUS_TRAVEL}, 200),
    ("aggregate_traveltimes2/commuter_rail", "/api/aggregate/traveltimes2", {**MONTH, **CR_TRAVEL}, 200),
    (
        "aggregate_traveltimes2/empty",
        "/api/aggregate/traveltimes2",
        {**MONTH, "from_stop": ["unknown-stop"], "to_stop": ["unknown-stop"]},
        200,
    ),
    ("aggregate_headways/rapid_transit", "/api/aggregate/headways", {**MONTH, "stop": ["70061"]}, 200),
    ("aggregate_headways/bus", "/api/aggregate/headways", {**MONTH, "stop": ["28-1-1728"]}, 200),
    (
        "aggregate_headways/commuter_rail",
        "/api/aggregate/headways",
        {**MONTH, "stop": ["CR-Fairmount_1_FB-0095-04"]},
        200,
    ),
    ("aggregate_dwells/rapid_transit", "/api/aggregate/dwells", {**MONTH, "stop": ["70063"]}, 200),
    ("aggregate_dwells/bus", "/api/aggregate/dwells", {**MONTH, "stop": ["1-0-93"]}, 200),
    (
        "aggregate_dwells/commuter_rail",
        "/api/aggregate/dwells",
        {**MONTH, "stop": ["CR-Fairmount_1_DB-2240-02"]},
        200,
    ),
    ("linedelays/red_daily", "/api/linedelays", {**MONTH, "line": "Red", "agg": "daily"}, 200),
    ("linedelays/green_b_default_agg", "/api/linedelays", {**QUARTER, "line": "Green-B"}, 200),
    ("linedelays/commuter_rail_weekly", "/api/linedelays", {**QUARTER, "line": "CR-Fairmount", "agg": "weekly"}, 200),
    ("tripmetrics/red_daily", "/api/tripmetrics", {**WEEK, "line": "line-red", "agg": "daily"}, 200),
    ("tripmetrics/mattapan_weekly", "/api/tripmetrics", {**QUARTER, "line": "line-mattapan", "agg": "weekly"}, 200),
    (
        "tripmetrics/green_monthly",
        "/api/tripmetrics",
        {"start_date": "2026-01-01", "end_date": "2026-09-30", "line": "line-green", "agg": "monthly"},
        200,
    ),
    ("service_hours/red_daily", "/api/service_hours", {**WEEK, "line_id": "line-red", "agg": "daily"}, 200),
    ("service_hours/red_weekly", "/api/service_hours", {**QUARTER, "line_id": "line-red", "agg": "weekly"}, 200),
    (
        "service_hours/orange_monthly",
        "/api/service_hours",
        {**QUARTER, "line_id": "line-orange", "agg": "monthly"},
        200,
    ),
    ("time_predictions/red", "/api/time_predictions", {"route_id": "Red"}, 200),
    ("time_predictions/commuter_rail", "/api/time_predictions", {"route_id": "CR-Fairmount"}, 200),
    ("ridership/rapid_transit", "/api/ridership", {**QUARTER, "line_id": "line-Red"}, 200),
    ("ridership/bus", "/api/ridership", {**QUARTER, "line_id": "line-1"}, 200),
    ("ridership/commuter_rail", "/api/ridership", {**QUARTER, "line_id": "line-Fairmount"}, 200),
    (
        "scheduledservice/rapid_transit_weekly",
        "/api/scheduledservice",
        {**QUARTER, "route_id": "Red", "agg": "weekly"},
        200,
    ),
    (
        "scheduledservice/rapid_transit_two_days",
        "/api/scheduledservice",
        {"start_date": "2026-09-01", "end_date": "2026-09-02", "route_id": "Red", "agg": "daily"},
        200,
    ),
    ("scheduledservice/bus_monthly", "/api/scheduledservice", {**QUARTER, "route_id": "1", "agg": "monthly"}, 200),
    (
        "scheduledservice/commuter_rail_daily",
        "/api/scheduledservice",
        {**WEEK, "route_id": "CR-Fairmount", "agg": "daily"},
        200,
    ),
    ("speed_restrictions/available", "/api/speed_restrictions", {"line_id": "line-Red", "date": "2025-12-01"}, 200),
    ("speed_restrictions/unavailable", "/api/speed_restrictions", {"line_id": "line-Red", "date": "2010-01-01"}, 200),
    ("service_ridership_dashboard/latest", "/api/service_ridership_dashboard", {}, 200),
    ("routes/all", "/api/routes", {}, 200),
    ("stops/rapid_transit", "/api/stops/Red", {}, 200),
    ("stops/bus", "/api/stops/1", {}, 200),
    ("stops/bus_fractional_order", "/api/stops/111", {}, 200),
    ("stops/commuter_rail", "/api/stops/CR-Fairmount", {}, 200),
    ("stops/ferry", "/api/stops/Boat-F1", {}, 200),
    ("healthcheck/pass", "/api/healthcheck", {}, 200),
]


def trim(value):
    """Recursively shrink long lists and large keyed maps, preserving every field's shape."""
    if isinstance(value, list):
        return [trim(item) for item in value[:MAX_LIST_ITEMS]]
    if isinstance(value, dict):
        items = list(value.items())
        if len(items) > MAX_MAP_KEYS:
            items = items[:KEPT_MAP_KEYS]
        return {key: trim(item) for key, item in items}
    return value


def trim_dashboard(data):
    """Keep one line per lineKind from the dashboard's lineData before the generic trim.

    The generic trim would keep only the first few lines, which are all rapid transit.
    """
    by_kind = {}
    for line_id, line in data.get("lineData", {}).items():
        by_kind.setdefault(line.get("lineKind"), (line_id, line))
    data["lineData"] = dict(by_kind.values())
    return data


CUSTOM_TRIMS = {
    "service_ridership_dashboard/latest": trim_dashboard,
}


def capture(name, path, params, expected_status):
    """Fetch one sample from production and write it as a fixture. Returns its manifest entry."""
    response = requests.get(f"{PRODUCTION_API}{path}", params=params, timeout=120)
    if response.status_code != expected_status:
        raise RuntimeError(f"{name}: expected HTTP {expected_status}, got {response.status_code} from {response.url}")

    data = response.json()
    if name in CUSTOM_TRIMS:
        data = CUSTOM_TRIMS[name](data)
    data = trim(data)

    output_path = OUTPUT_DIR / f"{name}.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(data, f, indent=2)
        f.write("\n")

    print(f"  {name}: HTTP {response.status_code}, {output_path.stat().st_size / 1024:.1f} KB")
    return {
        "url": response.url,
        "status": response.status_code,
        "captured_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    }


def main():
    # Start from the existing manifest so a failed capture keeps the previous fixture's entry
    manifest_path = OUTPUT_DIR / "manifest.json"
    manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
    captured = 0
    failures = []
    for name, path, params, expected_status in SAMPLES:
        try:
            manifest[name] = capture(name, path, params, expected_status)
            captured += 1
        except (requests.RequestException, RuntimeError, ValueError) as e:
            print(f"  {name}: FAILED ({e})")
            failures.append(name)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with open(manifest_path, "w") as f:
        json.dump(dict(sorted(manifest.items())), f, indent=2)
        f.write("\n")

    print(f"Captured {captured} of {len(SAMPLES)} samples into {OUTPUT_DIR}")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
