"""Scheduled service data aggregation and day-kind service level lookups."""
from datetime import date, datetime
from typing import List, Dict, TypedDict, Union, Literal

from .dynamo import query_scheduled_service
from .data_funcs import index_by
from .sampling import resample_and_aggregate

ByHourServiceLevels = List[int]
DayKind = Union[Literal["weekday"], Literal["saturday"], Literal["sunday"]]
AggTypes = Union[Literal["daily"], Literal["weekly"], Literal["monthly"]]
ScheduledService = List[Dict]


class ByDayKindServiceLevels(TypedDict):
    """Service levels for a single day, with hourly trip count breakdowns."""

    date: str
    service_levels: ByHourServiceLevels


class ByDayKindServiceLevels(TypedDict):
    """Service levels grouped by day kind (weekday, saturday, sunday)."""

    weekday: ByDayKindServiceLevels
    saturday: ByDayKindServiceLevels
    sunday: ByDayKindServiceLevels


class GetScheduledServiceResponse(TypedDict):
    """Response shape for the scheduled service endpoint."""

    start_date_service_levels: ByDayKindServiceLevels
    end_date_service_levels: ByDayKindServiceLevels
    counts: Dict[str, int]
    service_hours: Dict[str, float]


def get_next_day_kind_service_levels(
    scheduled_service: ScheduledService,
    day_kind: DayKind,
) -> ByDayKindServiceLevels:
    """Find the first day in the scheduled service list matching the given day kind.

    Args:
      scheduled_service: ScheduledService: List of daily scheduled service records.
      day_kind: DayKind: One of "weekday", "saturday", or "sunday".

    Returns:
      dict | None: A dict with "date" and "service_levels" keys, or None if not found.
    """

    def predicate(scheduled_service_day):
        """Check if a service day record matches the target day kind.

        Args:
          scheduled_service_day: A daily service record with a "date" field.

        Returns:
          bool: True if the day's weekday matches the target day_kind.
        """
        day_of_week = datetime.fromisoformat(scheduled_service_day["date"]).weekday()
        if day_kind == "weekday":
            return day_of_week < 5
        elif day_kind == "saturday":
            return day_of_week == 5
        elif day_kind == "sunday":
            return day_of_week == 6
        return False

    for daily_service_count in scheduled_service:
        if predicate(daily_service_count):
            return {
                "date": daily_service_count["date"],
                "service_levels": daily_service_count.get("byHour", {}).get("totals", []),
            }
    return None


def get_service_levels(
    scheduled_service: ScheduledService,
    search_from_end: bool,
) -> ByDayKindServiceLevels:
    """Get representative service levels for each day kind from a service list.

    Searches from the start or end of the list to find the first weekday, saturday,
    and sunday, returning their hourly service levels.

    Args:
      scheduled_service: ScheduledService: List of daily scheduled service records.
      search_from_end: bool: If True, search from the end of the list (for end-date levels).

    Returns:
      dict: Service levels keyed by "weekday", "saturday", and "sunday".
    """
    if search_from_end:
        scheduled_service = list(reversed(scheduled_service))
    return {
        "weekday": get_next_day_kind_service_levels(scheduled_service, "weekday"),
        "saturday": get_next_day_kind_service_levels(scheduled_service, "saturday"),
        "sunday": get_next_day_kind_service_levels(scheduled_service, "sunday"),
    }


def get_scheduled_service(
    start_date: date,
    end_date: date,
    agg: AggTypes,
    route_id: str = None,
) -> GetScheduledServiceResponse:
    """Fetch and aggregate scheduled service data for a route over a date range.

    Queries DynamoDB for daily scheduled service, then resamples trip counts and
    service minutes according to the aggregation type (daily/weekly/monthly).

    Args:
      start_date: date: Start of date range (inclusive).
      end_date: date: End of date range (inclusive).
      agg: AggTypes: Aggregation period ("daily", "weekly", or "monthly").
      route_id: str: The route ID to query. (Default value = None)

    Returns:
      dict: Contains "counts", "service_minutes", date range, and service level breakdowns.
    """
    scheduled_service = query_scheduled_service(
        start_date=start_date,
        end_date=end_date,
        route_id=route_id,
    )
    scheduled_service_by_day = index_by(scheduled_service, "date")
    counts_by_day = {}
    service_minutes_by_day = {}
    for current_day, current_day_service in scheduled_service_by_day.items():
        counts_by_day[current_day] = current_day_service["count"]
        service_minutes_by_day[current_day] = current_day_service["serviceMinutes"]
    counts = resample_and_aggregate(
        values=counts_by_day,
        agg=agg,
        avg_type="median",
    )
    service_minutes = resample_and_aggregate(
        values=service_minutes_by_day,
        agg=agg,
        avg_type="median",
    )
    return {
        "counts": counts,
        "service_minutes": service_minutes,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "start_date_service_levels": get_service_levels(scheduled_service, False),
        "end_date_service_levels": get_service_levels(scheduled_service, True),
    }


def get_scheduled_service_counts(
    start_date: date,
    end_date: date,
    agg: AggTypes,
    route_id: str = None,
):
    """Fetch scheduled service and return trip counts formatted for the API response.

    Args:
      start_date: date: Start of date range (inclusive).
      end_date: date: End of date range (inclusive).
      agg: AggTypes: Aggregation period ("daily", "weekly", or "monthly").
      route_id: str: The route ID to query. (Default value = None)

    Returns:
      dict: Contains date range, service levels, and counts as a list of {date, count} dicts.
    """
    result = get_scheduled_service(
        start_date=start_date,
        end_date=end_date,
        agg=agg,
        route_id=route_id,
    )
    return {
        "start_date": result["start_date"],
        "end_date": result["end_date"],
        "start_date_service_levels": result["start_date_service_levels"],
        "end_date_service_levels": result["end_date_service_levels"],
        "counts": [{"date": date, "count": count} for (date, count) in result["counts"].items()],
    }


def get_scheduled_service_hours(
    start_date: date,
    end_date: date,
    agg: AggTypes,
    route_id: str = None,
):
    """Fetch scheduled service and return service hours (minutes converted to hours).

    Args:
      start_date: date: Start of date range (inclusive).
      end_date: date: End of date range (inclusive).
      agg: AggTypes: Aggregation period ("daily", "weekly", or "monthly").
      route_id: str: The route ID to query. (Default value = None)

    Returns:
      dict: A dict mapping date strings to service hours (integer).
    """
    result = get_scheduled_service(
        start_date=start_date,
        end_date=end_date,
        agg=agg,
        route_id=route_id,
    )
    return {date: result["service_minutes"][date] // 60 for date in result["service_minutes"]}
