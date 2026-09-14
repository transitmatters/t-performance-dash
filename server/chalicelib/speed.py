"""Trip metrics aggregation for transit lines.

Queries DynamoDB for delivered trip metrics (count, time, miles) at
daily, weekly, or monthly granularity. Daily data is aggregated
on-the-fly from per-route records; weekly/monthly use pre-aggregated tables.
"""

from typing import TypedDict
from chalice import BadRequestError, ForbiddenError
from chalicelib import dynamo
from datetime import date, datetime, timedelta
import pandas as pd
import numpy as np
from chalicelib.constants import DATE_FORMAT_BACKEND


class BusTripMetricsParams(TypedDict):
    """Parameters for the bus trip metrics query.

    Attributes:
        start_date: Start of date range (YYYY-MM-DD).
        end_date: End of date range (YYYY-MM-DD).
        route: Bus route_id, e.g. ``"1"``, ``"57"``, ``"111"``.
    """

    start_date: str | date
    end_date: str | date
    route: str


BUS_TRIP_METRICS_TABLE = "DeliveredTripMetricsBus"
# Matches the daily rail delta above -- an approximate limit of 150 entries per table.
BUS_TRIP_METRICS_MAX_DAYS = 150


class TripMetricsByLineParams(TypedDict):
    """Parameters for trip metrics queries.

    Attributes:
        start_date: Start of date range (YYYY-MM-DD).
        end_date: End of date range (YYYY-MM-DD).
        agg: Aggregation level — ``"daily"``, ``"weekly"``, or ``"monthly"``.
        line: Line identifier (e.g., ``line-red``, ``line-green``).
    """

    start_date: str | date
    end_date: str | date
    agg: str
    line: str


# Delta values put limits on the numbers of days for which data that can be requested. For each table it is approximately 150 entries.
AGG_TO_CONFIG_MAP = {
    "daily": {"table_name": "DeliveredTripMetrics", "delta": 150},
    "weekly": {"table_name": "DeliveredTripMetricsWeekly", "delta": 7 * 150},
    "monthly": {"table_name": "DeliveredTripMetricsMonthly", "delta": 30 * 150},
}


def aggregate_actual_trips(actual_trips, agg, start_date):
    """Aggregate per-route daily trip metrics into per-line totals.

    Flattens branch-level records, handles NaN propagation for miles_covered,
    and groups by date to produce one record per day per line.

    Args:
        actual_trips: List of lists of trip metric records (one list per route).
        agg: Aggregation level (used for context, not for resampling here).
        start_date: Start date of the query range.

    Returns:
        List of aggregated record dicts with date, miles_covered, total_time,
        count, and line fields.
    """
    flat_data = [entry for sublist in actual_trips for entry in sublist]
    # Create a DataFrame from the flattened data
    df = pd.DataFrame(flat_data)
    # Set miles_covered to NaN for each date with any entry having miles_covered as nan
    if "miles_covered" in df.columns:
        df.loc[
            df.groupby("date")["miles_covered"].transform(lambda x: (np.isnan(x)).any()),
            ["count", "total_time", "miles_covered"],
        ] = np.nan
    # Group each branch into one entry. Keep NaN entries as NaN
    df_grouped = (
        df.groupby("date")
        .agg(
            {
                "miles_covered": "sum",
                "total_time": "sum",
                "count": "sum",
                "line": "first",
            }
        )
        .reset_index()
    )
    # set index to use datetime object.
    df_grouped.set_index(pd.to_datetime(df_grouped["date"]), inplace=True)
    return df_grouped.to_dict(orient="records")


def trip_metrics_by_line(params: TripMetricsByLineParams):
    """Fetch trip metrics for a transit line at the requested aggregation level.

    For daily data, queries per-route records from ``DeliveredTripMetrics``
    and aggregates on-the-fly. For weekly/monthly, returns pre-aggregated
    records directly from DynamoDB.

    Args:
        params: Query parameters including start_date, end_date, agg, and line.

    Returns:
        List of trip metric records.

    Raises:
        BadRequestError: If the line key is invalid or parameters are missing.
        ForbiddenError: If the date range exceeds the maximum allowed entries (150).
    """
    try:
        start_date = params["start_date"]
        end_date = params["end_date"]
        config = AGG_TO_CONFIG_MAP[params["agg"]]
        line = params["line"]
        if line not in ["line-red", "line-blue", "line-green", "line-orange", "line-mattapan"]:
            raise BadRequestError("Invalid Line key.")
    except KeyError:
        raise BadRequestError("Missing or invalid parameters.")
    # Prevent queries of more than 150 items.
    if is_invalid_range(start_date, end_date, config["delta"]):
        raise ForbiddenError("Date range too long. The maximum number of requested values is 150.")
    # If querying for daily data, query then aggregate.
    if params["agg"] == "daily":
        actual_trips = dynamo.query_daily_trips_on_line(config["table_name"], line, start_date, end_date)
        return aggregate_actual_trips(actual_trips, params["agg"], params["start_date"])
    # If querying for weekly/monthly data, can just return the query.
    return dynamo.query_agg_trip_metrics(start_date, end_date, config["table_name"], line)


def trip_metrics_by_bus_route(params: BusTripMetricsParams):
    """Fetch daily speed/trip metrics for a single bus route.

    Bus routes are independent of one another (no line/branch grouping like rail), and
    the source table only holds daily granularity, so this is a direct per-route query
    with no fan-out or on-the-fly aggregation.

    Args:
        params: Query parameters including start_date, end_date, and route.

    Returns:
        List of daily trip metric records for the route.

    Raises:
        BadRequestError: If required parameters are missing.
        ForbiddenError: If the date range exceeds the maximum allowed entries (150).
    """
    try:
        start_date = params["start_date"]
        end_date = params["end_date"]
        route = params["route"]
    except KeyError:
        raise BadRequestError("Missing or invalid parameters.")
    if is_invalid_range(start_date, end_date, BUS_TRIP_METRICS_MAX_DAYS):
        raise ForbiddenError(
            f"Date range too long. The maximum number of requested values is {BUS_TRIP_METRICS_MAX_DAYS}."
        )
    return dynamo.query_daily_trips_on_route(BUS_TRIP_METRICS_TABLE, route, start_date, end_date)


def bus_speed_leaderboard(start_date: str | date, end_date: str | date, limit: int = 10):
    """Rank bus routes by average speed over a date range, slowest first.

    Sums miles_covered and total_time per route across the range -- the same
    mph = miles_covered / (total_time / 3600) formula used everywhere else on the
    dashboard -- rather than averaging each day's speed naively, so the ranking isn't
    skewed by lighter-traffic days. Requires a full table scan (see
    dynamo.scan_trip_metrics_in_range for why); fine at today's table size, but this
    should stay cached and may need a different approach if the table grows much larger.

    Args:
        start_date: Start of date range (YYYY-MM-DD).
        end_date: End of date range (YYYY-MM-DD).
        limit: Maximum number of routes to return (default 10).

    Returns:
        The `limit` slowest routes, each a dict with route, miles_covered, total_time,
        count, and n_traversals summed across the range, sorted slowest (lowest mph) first.

    Raises:
        ForbiddenError: If the date range exceeds the maximum allowed entries (150).
    """
    if is_invalid_range(start_date, end_date, BUS_TRIP_METRICS_MAX_DAYS):
        raise ForbiddenError(
            f"Date range too long. The maximum number of requested values is {BUS_TRIP_METRICS_MAX_DAYS}."
        )
    rows = dynamo.scan_trip_metrics_in_range(BUS_TRIP_METRICS_TABLE, start_date, end_date)

    totals = {}
    for row in rows:
        entry = totals.setdefault(
            row["route"],
            {"route": row["route"], "miles_covered": 0, "total_time": 0, "count": 0, "n_traversals": 0},
        )
        entry["miles_covered"] += row.get("miles_covered", 0)
        entry["total_time"] += row.get("total_time", 0)
        entry["count"] += row.get("count", 0)
        entry["n_traversals"] += row.get("n_traversals", 0)

    # Routes with no recorded time have no usable speed and would divide by zero below.
    ranked = [entry for entry in totals.values() if entry["total_time"] > 0]
    ranked.sort(key=lambda entry: entry["miles_covered"] / (entry["total_time"] / 3600))
    return ranked[:limit]


def is_invalid_range(start_date, end_date, max_delta):
    """Check if a date range exceeds the maximum allowed number of entries.

    Args:
        start_date: Start date string (YYYY-MM-DD).
        end_date: End date string (YYYY-MM-DD).
        max_delta: Maximum number of days allowed in the range.

    Returns:
        ``True`` if the range exceeds ``max_delta`` days.
    """
    start_datetime = datetime.strptime(start_date, DATE_FORMAT_BACKEND)
    end_datetime = datetime.strptime(end_date, DATE_FORMAT_BACKEND)
    return start_datetime + timedelta(days=max_delta) < end_datetime
