"""Trip metrics aggregation for transit lines.

Queries DynamoDB for delivered trip metrics (count, time, miles) at
daily, weekly, or monthly granularity. Daily data is aggregated
on-the-fly from per-route records; weekly/monthly use pre-aggregated tables.
"""

from typing import NotRequired, TypedDict
from chalice import BadRequestError, ForbiddenError
from chalicelib import dynamo, s3, cache
from datetime import date, datetime, timedelta
from botocore.exceptions import ClientError
import json
import time
import zlib
import pandas as pd
import numpy as np
from chalicelib.constants import DATE_FORMAT_BACKEND


class BusTripMetricsParams(TypedDict):
    """Parameters for the bus trip metrics query.

    Attributes:
        start_date: Start of date range (YYYY-MM-DD).
        end_date: End of date range (YYYY-MM-DD).
        route: Bus route_id, e.g. ``"1"``, ``"57"``, ``"111"``, or a comma-separated list
            (``"114,116,117"``) for the dashboard's grouped routes, which are summed per period.
        agg: Optional aggregation level (``"daily"``, ``"weekly"``, ``"monthly"``). Defaults to daily.
        time_band: Optional time band (one of ``BUS_TIME_BANDS``) to report in place of the whole day.
        day_type: Optional day type (one of ``BUS_DAY_TYPES``) to keep, dropping every other day.
    """

    start_date: str | date
    end_date: str | date
    route: str
    agg: NotRequired[str]
    time_band: NotRequired[str]
    day_type: NotRequired[str]


BUS_TRIP_METRICS_TABLE = "DeliveredTripMetricsBus"
# Matches the daily rail delta above -- an approximate limit of 150 entries per table.
BUS_TRIP_METRICS_MAX_DAYS = 150
# Bus has no pre-aggregated weekly/monthly tables, so longer ranges are rolled up from the
# daily table on the fly. Limits mirror the rail deltas in AGG_TO_CONFIG_MAP (~150 values).
BUS_AGG_MAX_DAYS = {
    "daily": BUS_TRIP_METRICS_MAX_DAYS,
    "weekly": 7 * BUS_TRIP_METRICS_MAX_DAYS,
    "monthly": 30 * BUS_TRIP_METRICS_MAX_DAYS,
}
BUS_SUMMED_FIELDS = ("miles_covered", "total_time", "count", "n_traversals")
# The departure windows a DeliveredTripMetricsBus row breaks its totals down by, in its `time_bands`
# map -- TIME_BANDS in mbta-performance's chalicelib/lamp/bus/constants.py, the same bands the bus
# speed map uses. The row's top-level fields are the all-day figure, so there is no "all_day" band:
# leave time_band unset for that.
BUS_TIME_BANDS = ("early_am", "am_peak", "midday", "pm_peak", "evening", "late_night")
# A row's `day_type`, from MBTA's GTFS holiday calendar -- the split the bus speed map's weekly/monthly
# tiles use. Deliberately not pandas' USFederalHolidayCalendar: that isn't MBTA's calendar, and any day
# the two differ on would put the graph and the map at odds.
BUS_DAY_TYPES = ("business_day", "weekend_or_holiday")
# Everything a `time_bands` entry holds. Band counts don't add up to the row's `count` (a trip crossing
# a band boundary counts in both), but each is still a straight sum across days.
BUS_BAND_FIELDS = ("count", "n_traversals", "n_interpolated", "miles_covered", "total_time")
# Only exist for the whole day: medians and means can't be split into bands or summed back together.
BUS_ALL_DAY_ONLY_FIELDS = ("median_speed_mph", "mean_speed_mph")


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
        count, line, and (when present) avg_car_age/pct_new_trips/fleet_mix_* fields.
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
    agg_dict = {
        "miles_covered": "sum",
        "total_time": "sum",
        "count": "sum",
        "line": "first",
    }
    # Fleet metrics (see data-ingestion's car_ages.py) are computed once per line and
    # copied onto every branch's record, so "first" recovers the line-level value untouched.
    fleet_cols = [col for col in df.columns if col in ("avg_car_age", "pct_new_trips") or col.startswith("fleet_mix_")]
    for col in fleet_cols:
        agg_dict[col] = "first"
    df_grouped = df.groupby("date").agg(agg_dict).reset_index()
    # Dates with no fleet data come out of "first" as NaN, which json.dumps writes as a bare `NaN` —
    # invalid JSON that makes the whole response unparseable in the browser. Send null instead.
    for col in ("avg_car_age", "pct_new_trips"):
        if col in df_grouped.columns:
            df_grouped[col] = df_grouped[col].astype(object).where(df_grouped[col].notna(), None)
    # set index to use datetime object.
    df_grouped.set_index(pd.to_datetime(df_grouped["date"]), inplace=True)
    records = df_grouped.to_dict(orient="records")
    # Drop NaN fleet fields: json.dumps writes them as bare NaN, which isn't valid JSON
    for record in records:
        for col in fleet_cols:
            if pd.isna(record[col]):
                del record[col]
    return records


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
    """Fetch speed/trip metrics for a single bus route, daily or rolled up by week/month.

    Bus routes are independent of one another (no line/branch grouping like rail), and
    the source table only holds daily granularity, so weekly/monthly requests query the
    daily rows and sum them per ISO week (Monday start) or calendar month here. Summing
    miles_covered and total_time keeps mph = miles_covered / (total_time / 3600) weighted
    by distance, the same as the rest of the dashboard.

    time_band and day_type narrow each daily row before anything is summed (see
    _filter_bus_rows). They filter the rows the query returns rather than the query itself,
    so they don't change what's read from DynamoDB.

    Args:
        params: Query parameters including start_date, end_date, route, and optional agg,
            time_band and day_type.

    Returns:
        List of trip metric records for the route, one per day/week/month.

    Raises:
        BadRequestError: If required parameters are missing, or agg, time_band or day_type is
            unrecognized.
        ForbiddenError: If the date range exceeds the maximum allowed for the agg level.
    """
    try:
        start_date = params["start_date"]
        end_date = params["end_date"]
        route = params["route"]
    except KeyError:
        raise BadRequestError("Missing or invalid parameters.")
    agg = params.get("agg", "daily")
    if agg not in BUS_AGG_MAX_DAYS:
        raise BadRequestError(f"Invalid agg parameter. Expected one of: {', '.join(BUS_AGG_MAX_DAYS)}.")
    time_band, day_type = validate_bus_trip_filters(params)
    if is_invalid_range(start_date, end_date, BUS_AGG_MAX_DAYS[agg]):
        raise ForbiddenError(
            f"Date range too long. The maximum number of requested values is {BUS_TRIP_METRICS_MAX_DAYS}."
        )
    route_ids = [route_id.strip() for route_id in route.split(",") if route_id.strip()]
    if not route_ids:
        raise BadRequestError("Missing or invalid parameters.")
    if len(route_ids) == 1:
        rows = dynamo.query_daily_trips_on_route(BUS_TRIP_METRICS_TABLE, route_ids[0], start_date, end_date)
        rows = _filter_bus_rows(rows, time_band, day_type)
        if agg == "daily":
            return rows
    else:
        per_route = dynamo.query_daily_trips_on_routes(BUS_TRIP_METRICS_TABLE, route_ids, start_date, end_date)
        rows = _filter_bus_rows([row for route_rows in per_route for row in route_rows], time_band, day_type)
    return _rollup_bus_trip_metrics(rows, agg, route=",".join(route_ids))


def validate_bus_trip_filters(params: dict) -> tuple[str | None, str | None]:
    """Return the request's (time_band, day_type), each None when absent.

    Raises:
        BadRequestError: If either is set to something other than a known band or day type.
    """
    time_band = params.get("time_band")
    if time_band is not None and time_band not in BUS_TIME_BANDS:
        raise BadRequestError(
            f"Invalid time_band parameter. Expected one of: {', '.join(BUS_TIME_BANDS)}. Omit it for the whole day."
        )
    day_type = params.get("day_type")
    if day_type is not None and day_type not in BUS_DAY_TYPES:
        raise BadRequestError(
            f"Invalid day_type parameter. Expected one of: {', '.join(BUS_DAY_TYPES)}. Omit it for every day."
        )
    return time_band, day_type


def _filter_bus_rows(rows: list[dict], time_band: str | None, day_type: str | None) -> list[dict]:
    """Keep only day_type's days, and/or swap in time_band's totals for each row's all-day ones.

    Done per daily row, per route_id, so a grouped label (114,116,117) still sums band-for-band
    and a week or month rolls up from band totals exactly the way it does from all-day ones.

    Rows written before the pipeline recorded `day_type`/`time_bands` (and fleet-only rows, and
    the route "all" row) can't be placed: a day_type filter drops them, and a time band reads
    them as zero -- a gap in the graph, rather than the all-day figure passed off as the band's.
    """
    if day_type is not None:
        rows = [row for row in rows if row.get("day_type") == day_type]
    if time_band is not None:
        rows = [_band_row(row, time_band) for row in rows]
    return rows


def _band_row(row: dict, time_band: str) -> dict:
    """The row with one band's totals in place of its all-day ones. A band absent from the
    row's `time_bands` had no traversals that day."""
    band = (row.get("time_bands") or {}).get(time_band) or {}
    all_day_only = ("time_bands", *BUS_ALL_DAY_ONLY_FIELDS)
    return {key: value for key, value in row.items() if key not in all_day_only} | {
        field: band.get(field, 0) for field in BUS_BAND_FIELDS
    }


def _rollup_bus_trip_metrics(rows: list[dict], agg: str, route: str) -> list[dict]:
    """Sum daily bus rows (from one or more routes) per day, ISO week (dated by its Monday),
    or calendar month (dated the 1st).

    Per-day medians/means can't be combined by summing, so rolled-up rows carry only the
    summed fields plus date and route.
    """
    buckets = {}
    for row in rows:
        day = datetime.strptime(row["date"], DATE_FORMAT_BACKEND).date()
        if agg == "weekly":
            period_start = day - timedelta(days=day.weekday())
        elif agg == "monthly":
            period_start = day.replace(day=1)
        else:
            period_start = day
        entry = buckets.setdefault(
            period_start,
            {"date": period_start.isoformat(), "route": route, **{field: 0 for field in BUS_SUMMED_FIELDS}},
        )
        for field in BUS_SUMMED_FIELDS:
            entry[field] += row.get(field) or 0
    return [buckets[period_start] for period_start in sorted(buckets)]


def _leaderboard_cache_key(start_date: str | date, end_date: str | date) -> str:
    """S3 key for a cached leaderboard, scoped to a date range only (not limit).

    The full ranked list is cached once per range and sliced to `limit` on every
    read, since the scan/aggregation work is identical regardless of how many
    rows the caller asked for.
    """
    return f"bus-speed-leaderboard/{start_date}_{end_date}.json"


def _read_cached_leaderboard(start_date: str | date, end_date: str | date):
    """Return the cached ranked list for a date range, or None on a miss/stale/corrupt entry."""
    key = _leaderboard_cache_key(start_date, end_date)
    try:
        cached = json.loads(s3.download(key))
        computed_at = float(cached["computed_at"])
        data = cached["data"]
    except ClientError as ex:
        if ex.response["Error"]["Code"] not in ("NoSuchKey", "404"):
            raise
        return None
    # Anything unreadable -- not zlib, not UTF-8, not JSON, or not the expected shape -- is
    # treated as a miss so the caller rescans and overwrites it, rather than 500ing forever.
    except (zlib.error, UnicodeDecodeError, json.JSONDecodeError, KeyError, TypeError, ValueError):
        return None
    if not isinstance(data, list):
        return None

    max_age = cache.get_cache_max_age({"end_date": end_date})
    if time.time() - computed_at >= max_age:
        return None
    return data


def bus_speed_leaderboard(start_date: str | date, end_date: str | date, limit: int = 10):
    """Rank bus routes by average speed over a date range, slowest first.

    Sums miles_covered and total_time per route across the range -- the same
    mph = miles_covered / (total_time / 3600) formula used everywhere else on the
    dashboard -- rather than averaging each day's speed naively, so the ranking isn't
    skewed by lighter-traffic days. Requires a full table scan (see
    dynamo.scan_trip_metrics_in_range for why), so the ranked list is cached to S3 per
    date range (see _leaderboard_cache_key) -- the first request for a given range pays
    for the scan, later requests for the same range read the cached JSON back until it
    goes stale (cache.get_cache_max_age, keyed on how recent end_date is).

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

    ranked = _read_cached_leaderboard(start_date, end_date)
    if ranked is None:
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

        key = _leaderboard_cache_key(start_date, end_date)
        s3.upload(key, json.dumps({"computed_at": time.time(), "data": ranked}).encode())

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
