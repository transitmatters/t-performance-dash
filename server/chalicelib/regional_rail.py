"""Commuter Rail schedules measured against TransitMatters' Regional Rail standards.

data-ingestion writes one row per Commuter Rail route per day to ``ScheduledServiceRegionalRail``,
computed from the GTFS schedule. Each direction (measured at its Boston terminal) has its trips,
first and last train (seconds after midnight), longest midday and evening waits (minutes), hours
from 5am to 1am with a train at least every 30 minutes, the share of trains on a repeating hourly
pattern, and trains by hour. Peak and reverse-peak trip counts cover both directions.

Weekdays, Saturdays and Sundays run different schedules, so each request covers one kind of day,
and weekly or monthly values are averages over the days of that kind. Day-by-day views can ask
for every day instead.
"""

from datetime import date
from typing import Dict, List, Optional

from .dynamo import query_regional_rail_scorecard
from .reliability import COMMUTER_RAIL_ROUTE_ID, COMMUTER_RAIL_ROUTES, bucket_start

AGGS = ("daily", "weekly", "monthly")
# "all" mixes the schedules, for day-by-day views
DAY_KINDS = ("weekday", "saturday", "sunday", "all")
DIRECTIONS = ("outbound", "inbound")
DIRECTION_FIELDS = (
    "trips",
    "firstTrip",
    "lastTrip",
    "maxGapMidday",
    "maxGapEvening",
    "hoursAtTarget",
    "clockFaceShare",
    "byHour",
)
ROUTE_FIELDS = ("peakTrips", "reversePeakTrips")


def day_kind(day: date) -> str:
    """Whether a date runs a weekday, Saturday or Sunday schedule (holidays aren't singled out)."""
    weekday = day.weekday()
    return "weekday" if weekday < 5 else "saturday" if weekday == 5 else "sunday"


def _metrics(item: Dict) -> Dict:
    return {
        **{direction: {field: item[direction].get(field) for field in DIRECTION_FIELDS} for direction in DIRECTIONS},
        **{field: item.get(field) for field in ROUTE_FIELDS},
    }


def _mean(values: List) -> Optional[float]:
    """Mean of the values that are present; None when there are none (e.g. no clock-face share)."""
    present = [value for value in values if value is not None]
    return round(sum(present) / len(present), 3) if present else None


def _average(rows: List) -> Dict:
    """Average rows of the same shape field by field, and hourly counts hour by hour."""
    averaged = {}
    for key, value in rows[0].items():
        values = [row[key] for row in rows]
        if isinstance(value, dict):
            averaged[key] = _average(values)
        elif isinstance(value, list):
            averaged[key] = [_mean(list(hour)) for hour in zip(*values)]
        else:
            averaged[key] = _mean(values)
    return averaged


def aggregate(items: List[Dict], agg: str) -> List[Dict]:
    """Average daily items into daily/weekly/monthly buckets, each with the number of ``days`` averaged."""
    by_bucket: Dict[date, List[Dict]] = {}
    for item in items:
        by_bucket.setdefault(bucket_start(date.fromisoformat(item["date"]), agg), []).append(_metrics(item))
    return [
        {"date": start.isoformat(), "days": len(rows), **_average(rows)} for start, rows in sorted(by_bucket.items())
    ]


def get_scorecard(route_id: str, start_date: date, end_date: date, agg: str, kind: str) -> List[Dict]:
    """Retrieve Regional Rail scorecard metrics for one Commuter Rail route, or compare every route.

    Args:
        route_id: A Commuter Rail route (``"CR-Worcester"``), or ``"commuter-rail"`` for one
            summary per route over the whole range.
        start_date: First date of the range (inclusive).
        end_date: Last date of the range (inclusive).
        agg: ``daily``, ``weekly``, or ``monthly``. Ignored for ``"commuter-rail"``.
        kind: ``weekday``, ``saturday``, or ``sunday`` to include only days of that kind, or ``all``.

    Returns:
        For a route, one entry per period with ``date`` (bucket start), ``days``, ``outbound``,
        ``inbound``, ``peakTrips`` and ``reversePeakTrips``. For ``"commuter-rail"``, one entry per
        route with ``routeId`` and ``days`` in place of ``date``.
    """

    def matching_days(route: str) -> List[Dict]:
        items = query_regional_rail_scorecard(route, start_date, end_date)
        return [item for item in items if kind == "all" or day_kind(date.fromisoformat(item["date"])) == kind]

    if route_id != COMMUTER_RAIL_ROUTE_ID:
        return aggregate(matching_days(route_id), agg)
    summaries = []
    for route in COMMUTER_RAIL_ROUTES:
        items = matching_days(route)
        if items:
            summaries.append({"routeId": route, "days": len(items), **_average([_metrics(item) for item in items])})
    return summaries
