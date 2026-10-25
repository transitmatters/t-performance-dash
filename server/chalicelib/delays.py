"""Alert-based delay calculations for transit lines.

Queries DynamoDB for daily or weekly alert delay data and validates
request parameters and date ranges.
"""

import re
from typing import TypedDict
from chalice import BadRequestError
from chalicelib import dynamo
from datetime import date


# Config map for daily vs weekly delay queries
AGG_TO_CONFIG_MAP = {
    "daily": {"table_name": "AlertDelaysDaily"},
    "weekly": {"table_name": "AlertDelaysWeekly"},
}

RAIL_LINES = [
    "Red",
    "Blue",
    "Orange",
    "Green-B",
    "Green-C",
    "Green-D",
    "Green-E",
    "Mattapan",
    "CR-Fairmount",
    "CR-Fitchburg",
    "CR-Worcester",
    "CR-Franklin",
    "CR-Greenbush",
    "CR-Haverhill",
    "CR-Kingston",
    "CR-Lowell",
    "CR-Middleborough",
    "CR-NewBedford",
    "CR-Needham",
    "CR-Newburyport",
    "CR-Providence",
]

# All bus routes summed together
BUS_AGGREGATE = "Bus"

# Raw GTFS bus route ids: "1", "34E", "741" (SL1)
BUS_ROUTE_ID = re.compile(r"^\d{1,3}[A-Z]?$")


class AlertDelaysByLineParams(TypedDict):
    """Parameters for alert delay queries.

    Attributes:
        start_date: Start of date range (YYYY-MM-DD).
        end_date: End of date range (YYYY-MM-DD).
        line: Line identifier (e.g., ``Red``, ``Green-B``, ``CR-Fairmount``), or comma-separated
            bus route ids (e.g., ``114,116,117``), or ``Bus`` for all bus routes.
        agg: Aggregation level — ``"daily"`` or ``"weekly"``.
    """

    start_date: str | date
    end_date: str | date
    line: str
    agg: str


def delay_time_by_line(params: AlertDelaysByLineParams):
    """Fetch alert-based delay data for a transit line.

    Validates the line identifier and date range, then queries the appropriate
    DynamoDB table (daily or weekly) for delay data.

    Args:
        params: Query parameters including start_date, end_date, line, and agg.

    Returns:
        List of delay records from DynamoDB.

    Raises:
        BadRequestError: If the line or aggregation type is invalid, or parameters are missing.
    """
    try:
        start_date = params["start_date"]
        end_date = params["end_date"]
        line = params["line"]
        agg = params.get("agg", "weekly")  # Default to weekly if not specified
        config = AGG_TO_CONFIG_MAP.get(agg)
        if not config:
            raise BadRequestError("Invalid aggregation type. Must be 'daily' or 'weekly'.")
    except KeyError:
        raise BadRequestError("Missing or invalid parameters.")
    if line in RAIL_LINES:
        # Return the query from the appropriate table
        return dynamo.query_agg_trip_metrics(start_date, end_date, config["table_name"], line)
    if line == BUS_AGGREGATE:
        return dynamo.query_agg_trip_metrics(start_date, end_date, config["table_name"], BUS_AGGREGATE)
    route_ids = [route_id.strip() for route_id in line.split(",") if route_id.strip()]
    if not route_ids or not all(BUS_ROUTE_ID.match(route_id) for route_id in route_ids):
        raise BadRequestError("Invalid Line key.")
    return bus_delays(start_date, end_date, config["table_name"], route_ids)


def bus_delays(start_date: str | date, end_date: str | date, table_name: str, route_ids: list[str]):
    """Delays for one or more bus routes, summed per date.

    A bus route only has rows on days (or weeks) it had a delay. The ``Bus`` total has
    one for every day the alerts were processed, so its dates fill the gaps with zeros.

    Args:
        start_date: Start of date range (inclusive).
        end_date: End of date range (inclusive).
        table_name: The daily or weekly delays table.
        route_ids: Raw GTFS bus route ids; a grouped route (114/116/117) passes several.

    Returns:
        One record per date, with every delay field summed across ``route_ids``.
    """
    line = ",".join(route_ids)
    totals = {
        row["date"]: {
            **{key: 0 for key, value in row.items() if key not in ("date", "line") and isinstance(value, (int, float))},
            "date": row["date"],
            "line": line,
        }
        for row in dynamo.query_agg_trip_metrics(start_date, end_date, table_name, BUS_AGGREGATE)
    }
    for route_id in route_ids:
        for row in dynamo.query_agg_trip_metrics(start_date, end_date, table_name, route_id):
            total = totals.setdefault(row["date"], {"date": row["date"], "line": line})
            for key, value in row.items():
                if key not in ("date", "line") and isinstance(value, (int, float)):
                    total[key] = total.get(key, 0) + value
    return sorted(totals.values(), key=lambda total: total["date"])
