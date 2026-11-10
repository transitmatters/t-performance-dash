"""Check that another repo's copy of stations.json still agrees with the dashboard's.

Other TransitMatters repos (slow-zones, shutdown-tracker, mbta-slow-zone-bot) keep their own copy of
common/constants/stations.json. A copy may drop fields it doesn't use, add its own, or lowercase the line keys, so
only fields that both files have are compared. Stations are matched by their `station` (parent stop) ID. The check
fails when a station is in one file but not the other, or when a shared field has a different value.

Those repos run this from .github/workflows/check-stations-copy.yml. It only uses the standard library so they don't
have to install anything.

Usage:
    python3 server/scripts/check_stations_copy.py path/to/stations.json [--lines Red,Orange,Blue,Green]
"""

import argparse
import json
import sys
from pathlib import Path

DASHBOARD_STATIONS = Path(__file__).resolve().parents[2] / "common" / "constants" / "stations.json"
DASHBOARD_STATIONS_URL = "https://github.com/transitmatters/t-performance-dash/blob/main/common/constants/stations.json"


def _field_diffs(where: str, dashboard: dict, copy: dict) -> list[str]:
    return [
        f"{where}: {field} is {copy[field]!r} in the copy but {dashboard[field]!r} in the dashboard"
        for field in dashboard
        if field in copy and field != "stations" and dashboard[field] != copy[field]
    ]


def _group_by_station(stations: list[dict]) -> dict[str, list[dict]]:
    # A station can appear more than once on a line (JFK/UMass has one entry per Red Line branch).
    groups: dict[str, list[dict]] = {}
    for stop in stations:
        groups.setdefault(stop["station"], []).append(stop)
    return groups


def compare_line(line: str, dashboard: dict, copy: dict) -> list[str]:
    """List the differences between one line in the dashboard's stations.json and the same line in a copy."""
    problems = _field_diffs(line, dashboard, copy)
    ours = _group_by_station(dashboard["stations"])
    theirs = _group_by_station(copy["stations"])
    for station in dict.fromkeys([*ours, *theirs]):
        dashboard_stops = ours.get(station, [])
        copy_stops = theirs.get(station, [])
        for dashboard_stop, copy_stop in zip(dashboard_stops, copy_stops):
            problems += _field_diffs(f"{line} {dashboard_stop['stop_name']} ({station})", dashboard_stop, copy_stop)
        for stop in dashboard_stops[len(copy_stops) :]:
            problems.append(f"{line}: {stop['stop_name']} ({station}) is missing from the copy")
        for stop in copy_stops[len(dashboard_stops) :]:
            problems.append(f"{line}: {stop['stop_name']} ({station}) is in the copy but not in the dashboard")
    return problems


def compare(dashboard: dict, copy: dict, lines: list[str] | None = None) -> list[str]:
    """List the differences between the dashboard's stations.json and a copy.

    Args:
        dashboard: The dashboard's stations.json.
        copy: Another repo's copy of it.
        lines: Only compare these lines (case-insensitive). By default every line in either file is compared, and a
            line that only one file has is a difference.
    """
    dashboard_lines = {key.lower(): key for key in dashboard}
    copy_lines = {key.lower(): key for key in copy}
    wanted = [line.lower() for line in lines] if lines else list(dict.fromkeys([*dashboard_lines, *copy_lines]))

    problems = []
    for line in wanted:
        if line not in dashboard_lines:
            problems.append(f"{copy_lines.get(line, line)} is in the copy but not in the dashboard")
        elif line not in copy_lines:
            problems.append(f"{dashboard_lines[line]} is missing from the copy")
        else:
            name = dashboard_lines[line]
            problems += compare_line(name, dashboard[name], copy[copy_lines[line]])
    return problems


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Check a copy of stations.json against the dashboard's.")
    parser.add_argument("copy", type=Path, help="The copy of stations.json to check")
    parser.add_argument("--lines", default="", help="Comma-separated lines to compare (default: all of them)")
    parser.add_argument("--dashboard", type=Path, default=DASHBOARD_STATIONS, help="The dashboard's stations.json")
    args = parser.parse_args(argv)

    dashboard = json.loads(args.dashboard.read_text())
    copy = json.loads(args.copy.read_text())
    lines = [line.strip() for line in args.lines.split(",") if line.strip()]

    problems = compare(dashboard, copy, lines)
    if not problems:
        print(f"{args.copy} matches the dashboard's stations.json on every field they share.")
        return 0

    print("\n".join(problems))
    print(
        f"\n{args.copy} has drifted from the dashboard's stations.json. Bring it in line with {DASHBOARD_STATIONS_URL}"
    )
    return 1


if __name__ == "__main__":
    sys.exit(main())
