"""On-time performance for The RIDE and commuter rail, from the MBTA open data portal.

Daily rows are written to the ``Reliability`` table by data-ingestion, keyed by ``routeId``
(``"RIDE"``, ``"CR-Worcester"``, ...) and ``date``. Everything here is a raw count, so rolling
up to weekly/monthly or across commuter rail routes is a sum; percentages are computed by the client.
"""

from datetime import date, timedelta
from typing import Dict, Iterable, List

from .dynamo import query_reliability

THE_RIDE_ROUTE_ID = "RIDE"
COMMUTER_RAIL_ROUTE_ID = "commuter-rail"

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

# Attributes that aren't additive counts. MBTA's published RIDE OTP is recomputed client-side
# from the counts so it stays correct when aggregated.
NON_COUNT_KEYS = {"routeId", "date", "timestamp", "mode", "source", "otp"}

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


def get_reliability(route_id: str, start_date: date, end_date: date, agg: str) -> List[Dict]:
    """Retrieve on-time performance counts for The RIDE, one commuter rail route, or all of commuter rail.

    Args:
        route_id: ``"RIDE"``, a commuter rail route (``"CR-Worcester"``), or ``"commuter-rail"`` for
            every commuter rail route combined.
        start_date: First date of the range (inclusive).
        end_date: Last date of the range (inclusive).
        agg: ``daily``, ``weekly``, or ``monthly``.

    Returns:
        A list of dicts with ``date`` (bucket start), ``days``, and summed counts. The RIDE has
        ``completed``, ``onTime``, and (when recorded) ``requests``, ``noShows``, ``missed``.
        Commuter rail has ``otpNumerator``, ``otpDenominator``, ``cancelled``, and the same
        three counts under ``peak`` and ``offPeak``.
    """
    route_ids = COMMUTER_RAIL_ROUTES if route_id == COMMUTER_RAIL_ROUTE_ID else [route_id]
    items = [item for rid in route_ids for item in query_reliability(rid, start_date, end_date)]
    return aggregate(items, agg)
