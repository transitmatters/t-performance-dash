#!/usr/bin/env python3
from chalicelib.dynamo import query_historic_max_ridership
from datetime import date, datetime
from dateutil.relativedelta import relativedelta
import json
import pathlib
import sys
import os

BUS_CONSTANTS = pathlib.Path(__file__).resolve().parents[2] / "common" / "constants" / "bus_constants"
# Mirrors getRidershipLineId in common/utils/ridership.ts
BUS_RIDERSHIP_ALIASES = {
    "34": "3434E",
    "57": "5757A",
    "CT2": "747",
    "CT3/171": "171708",
    "SL1/SL2/SL3/SLW": "SLWaterfront",
    "SL4/SL5": "SLWashington",
}


def current_bus_routes() -> list[str]:
    """Dashboard bus route keys (e.g. '1', '114/116/117') that are still running, from the station manifests."""
    routes = []
    for path in sorted(BUS_CONSTANTS.glob("*.json")):
        for key, route in json.loads(path.read_text()).items():
            if not route.get("service_end") and not key.endswith("-legacy"):
                routes.append(key)
    return routes


# To run: cd server && PYTHONPATH=. uv run python scripts/update_max_ridership.py


def get_max_ridership_by_lineId(line_id: str, start_date: date, end_date: date):
    """
    Get the maximum ridership for a given line within a date range.

    Args:
        line_id: Line identifier (e.g., 'line-Red', 'line-Blue', 'line-Green', 'line-Orange', 'line-Fairmount','line-1')
        start_date: Start date for the query
        end_date: End date for the query

    Returns:
        Maximum ridership count for the specified line and date range
    """
    max_ridership = query_historic_max_ridership(start_date, end_date, line_id)
    print(f"Maximum ridership for {line_id} from {start_date} to {end_date}: {max_ridership}")
    return max_ridership


def get_line_id(line_id: str) -> str:
    if line_id.startswith("CR-"):
        line_id = line_id.replace("CR-", "line-")
        return line_id
    if line_id in BUS_ROUTES:
        return "line-" + BUS_RIDERSHIP_ALIASES.get(line_id, line_id.replace("/", ""))
    # This is meant for Red, Blue, Orange, Green, and Mattapan
    if line_id in [
        "line-red",
        "line-orange",
        "line-blue",
        "line-green",
        "line-mattapan",
    ]:
        line_id = "line-" + line_id.replace("line-", "").capitalize()
        return line_id


BUS_ROUTES = current_bus_routes()

if __name__ == "__main__":
    # Example: Get max ridership for all lines
    lines = [
        "line-red",
        "line-orange",
        "line-blue",
        "line-green",
        "line-mattapan",
        *BUS_ROUTES,
        "CR-Fitchburg",
        "CR-Franklin",
        "CR-Greenbush",
        "CR-Haverhill",
        "CR-Lowell",
        "CR-Worcester",
        "CR-Fairmount",
        "CR-Kingston",
        "CR-Middleborough",
        "CR-Needham",
        "CR-Newburyport",
        "CR-NewBedford",
        "CR-Providence",
        "line-commuter-rail",
    ]
    # Example usage with command line arguments
    if len(sys.argv) >= 4:
        line_id = sys.argv[1]
        start_date_str = sys.argv[2]  # Format: YYYY-MM-DD
        end_date_str = sys.argv[3]  # Format: YYYY-MM-DD

        start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
        end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()
        peak_ridership = {}

        for line in lines:
            if line and line != "line-commuter-rail":
                line_id = get_line_id(line)
                try:
                    max_ridership = get_max_ridership_by_lineId(line_id, start_date, end_date)
                    peak_ridership[line.replace("/", "")] = max_ridership

                except Exception as e:
                    print(f"Error getting ridership for {line}: {e}")

        if os.path.isdir("data"):
            pass
        else:
            os.mkdir("data")

        with open("data/peakridership.txt", "w") as f:
            f.write(str(peak_ridership))
    else:
        # Default value is 1 year before today's date -> 2016
        print("Usage: python update_max_ridership.py <line_id> <start_date> <end_date>")
        print("\nRunning with default values...")
        start_date = date(2016, 1, 1)
        end_date = datetime.now() - relativedelta(years=1)

        peak_ridership = {}
        for line in lines:
            if line and line != "line-commuter-rail":
                line_id = get_line_id(line)
                try:
                    max_ridership = get_max_ridership_by_lineId(line_id, start_date, end_date)
                    peak_ridership[line.replace("/", "")] = max_ridership

                except Exception as e:
                    print(f"Error getting ridership for {line}: {e}")

        if os.path.isdir("data"):
            pass
        else:
            os.mkdir("data")

        with open("data/peakridership.txt", "w") as f:
            f.write(str(peak_ridership))
