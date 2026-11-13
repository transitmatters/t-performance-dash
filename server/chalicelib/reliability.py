"""Reliability counts, written daily by data-ingestion.

- The RIDE and commuter rail: on-time performance from the MBTA open data portal, in the
  ``Reliability`` table keyed by ``routeId`` (``"RIDE"``, ``"CR-Worcester"``, ...) and ``date``.
- Excess trip time on the Red, Orange and Blue Lines: riders and passenger-weighted minutes from the
  MBTA open data portal, in the same ``Reliability`` table under ``"line-red"``, ... (weekly, ~5 weeks behind).
- Subway lines: headways bucketed by their ratio to the scheduled headway, measured by TransitMatters
  from per-stop events, in the ``HeadwayReliability`` table keyed by ``route`` (``"line-red"``, ...).
- Bus routes: the same five headway buckets at mid-route timepoints, written by mbta-performance from
  LAMP onto each route/day row of ``DeliveredTripMetricsBus`` (from 2025-12-24).

Everything here is a raw count (or, for excess trip time, a sum of minutes over riders), so rolling up to
weekly/monthly or across commuter rail routes is a sum; percentages and averages are computed by the client.
"""

from datetime import date, timedelta
from typing import Dict, Iterable, List

from .delays import BUS_ROUTE_ID
from .dynamo import query_daily_trips_on_routes, query_headway_reliability, query_reliability

THE_RIDE_ROUTE_ID = "RIDE"
COMMUTER_RAIL_ROUTE_ID = "commuter-rail"
SUBWAY_LINES = {"line-red", "line-orange", "line-blue", "line-green", "line-mattapan"}
# The lines the MBTA publishes excess trip time for. It plans to add the Green Line.
EXCESS_TRIP_TIME_LINES = ("line-red", "line-orange", "line-blue")

COMMUTER_RAIL_ROUTES = [
    "CR-Fairmount",
    "CR-Fitchburg",
    "CR-Foxboro",
    "CR-Franklin",
    "CR-Greenbush",
    "CR-Haverhill",
    "CR-Kingston",
    "CR-Lowell",
    "CR-Middleborough",
    "CR-Needham",
    "CR-NewBedford",
    "CR-Newburyport",
    "CR-Providence",
    "CR-Worcester",
    "CapeFlyer",
]

BUS_TRIP_METRICS_TABLE = "DeliveredTripMetricsBus"
HEADWAY_FIELDS = ("headways_under_50", "headways_50_75", "headways_75_125", "headways_125_150", "headways_over_150")

# Attributes that aren't additive counts. MBTA's published RIDE OTP is recomputed client-side
# from the counts so it stays correct when aggregated.
NON_COUNT_KEYS = {"routeId", "route", "date", "timestamp", "mode", "source", "otp"}

AGGS = ("daily", "weekly", "monthly")


def bucket_start(day: date, agg: str) -> date:
    """Label a date by the start of its bucket: itself, its Monday, or the first of its month."""
    if agg == "weekly":
        return day - timedelta(days=day.weekday())
    if agg == "monthly":
        return day.replace(day=1)
    return day


def _counts(item: Dict) -> Dict:
    counts = {}
    for key, value in item.items():
        if key in NON_COUNT_KEYS:
            continue
        counts[key] = _counts(value) if isinstance(value, dict) else value
    return counts


def _sum_counts(rows: List[Dict]) -> Dict:
    """Sum counts across rows. A field is only kept if every row has it (e.g. RIDE no-shows,
    which weren't recorded before 2026-01-07), so partial totals are never reported."""
    shared = set.intersection(*(set(row) for row in rows))
    total = {}
    for key in sorted(shared):
        values = [row[key] for row in rows]
        total[key] = _sum_counts(values) if isinstance(values[0], dict) else sum(values)
    return total


def aggregate(items: Iterable[Dict], agg: str) -> List[Dict]:
    """Sum daily items into daily/weekly/monthly buckets.

    Each bucket also reports ``days``: the number of service days with data, since a period
    at either end of the range (or a gap in MBTA's data) may be partial.
    """
    by_bucket: Dict[date, Dict[date, List[Dict]]] = {}
    for item in items:
        day = date.fromisoformat(item["date"])
        by_bucket.setdefault(bucket_start(day, agg), {}).setdefault(day, []).append(_counts(item))

    results = []
    for start in sorted(by_bucket):
        days = by_bucket[start]
        # Several routes on the same day are summed first, so `days` counts service days
        rows = [_sum_counts(route_rows) for route_rows in days.values()]
        results.append({"date": start.isoformat(), "days": len(days), **_sum_counts(rows)})
    return results


def bus_route_ids(route_id: str) -> List[str] | None:
    """The raw GTFS bus route ids in a comma-separated ``route_id`` (``"114,116,117"``), or None if it isn't one."""
    route_ids = [rid.strip() for rid in route_id.split(",") if rid.strip()]
    if route_ids and all(BUS_ROUTE_ID.match(rid) for rid in route_ids):
        return route_ids
    return None


def _bus_headway_items(rows: Iterable[Dict]) -> List[Dict]:
    """Just the date and headway counts of each bus row. Rows without them (fleet-only rows, and every
    day before LAMP bus data starts) are dropped, so they neither count as days with data nor make
    ``_sum_counts`` discard the headway fields for a period they share."""
    return [
        {"date": row["date"], **{field: row[field] for field in HEADWAY_FIELDS}}
        for row in rows
        if all(field in row for field in HEADWAY_FIELDS)
    ]


def get_reliability(route_id: str, start_date: date, end_date: date, agg: str) -> List[Dict]:
    """Retrieve reliability counts for The RIDE, commuter rail, a subway line, or bus routes.

    Args:
        route_id: ``"RIDE"``, a commuter rail route (``"CR-Worcester"``), ``"commuter-rail"`` for
            every commuter rail route combined, or a subway line (``"line-red"``).
            Bus routes are raw GTFS route ids (``"28"``, ``"741"`` for SL1), comma-separated to sum
            a group (``"114,116,117"``).
        start_date: First date of the range (inclusive).
        end_date: Last date of the range (inclusive).
        agg: ``daily``, ``weekly``, or ``monthly``.

    Returns:
        A list of dicts with ``date`` (bucket start), ``days``, and summed counts. The RIDE has
        ``completed``, ``onTime``, and (when recorded) ``requests``, ``noShows``, ``missed``.
        Commuter rail has ``otpNumerator``, ``otpDenominator``, ``cancelled``, and the same
        three counts under ``peak`` and ``offPeak``. Subway lines have five headway counts
        (``headways_under_50`` ... ``headways_over_150``) and the same per direction under
        ``byDirection``. Bus routes have the five headway counts only.
    """
    if route_id in SUBWAY_LINES:
        return aggregate(query_headway_reliability(route_id, start_date, end_date), agg)
    bus_routes = bus_route_ids(route_id)
    if bus_routes:
        per_route = query_daily_trips_on_routes(
            BUS_TRIP_METRICS_TABLE, bus_routes, start_date.isoformat(), end_date.isoformat()
        )
        return aggregate(_bus_headway_items(row for rows in per_route for row in rows), agg)
    route_ids = COMMUTER_RAIL_ROUTES if route_id == COMMUTER_RAIL_ROUTE_ID else [route_id]
    items = [item for rid in route_ids for item in query_reliability(rid, start_date, end_date)]
    return aggregate(items, agg)


def _round_sums(counts: Dict) -> Dict:
    """Round summed minutes and riders to a tenth, which is how they're stored, so float noise from
    adding them up (``1234.5000000001``) doesn't bloat the response."""
    return {
        key: _round_sums(value) if isinstance(value, dict) else round(value, 1) if isinstance(value, float) else value
        for key, value in counts.items()
    }


def get_excess_trip_time(line: str, start_date: date, end_date: date, agg: str) -> List[Dict]:
    """Retrieve excess trip time sums for a subway line, rolled up to days, weeks, or months.

    Args:
        line: One of ``EXCESS_TRIP_TIME_LINES``.
        start_date: First date of the range (inclusive).
        end_date: Last date of the range (inclusive).
        agg: ``daily``, ``weekly``, or ``monthly``.

    Returns:
        A list of dicts with ``date`` (bucket start), ``days``, ``riders``, actual and baseline
        passenger-minutes (``waitTime``, ``travelTime``, ``baselineTripTime``, ``baselineWaitTime``,
        ``baselineTravelTime``) and riders within each threshold of the baseline (``withinFiveMin``,
        ``withinTwentyMin``, ``withinTwentyPct``, ``withinThirtyPct``). The same sums per service
        period are under ``byPeriod`` (``amPeak``, ``pmPeak``, ``offPeak``), and both again per
        GTFS direction under ``byDirection`` (``"0"``, ``"1"``).
    """
    return [_round_sums(entry) for entry in aggregate(query_reliability(line, start_date, end_date), agg)]
