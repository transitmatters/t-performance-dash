from datetime import date, datetime
from typing import List, Dict, TypedDict, Union, Literal

from .dynamo import query_trip_counts
from .data_funcs import index_by, date_range

ByHourServiceLevels = List[int]
DayKind = Union[Literal["weekday"], Literal["saturday"], Literal["sunday"]]
TripCounts = List[Dict]


class ByDayKindServiceLevels(TypedDict):
    date: str
    service_levels: ByHourServiceLevels


class ByDayKindServiceLevels(TypedDict):
    weekday: ByDayKindServiceLevels
    saturday: ByDayKindServiceLevels
    sunday: ByDayKindServiceLevels


class GetTripCountsResponse(TypedDict):
    start_date_service_levels: ByDayKindServiceLevels
    end_date_service_levels: ByDayKindServiceLevels
    start_date: str
    end_date: str
    counts: List[int]


def get_next_day_kind_service_levels(
    trip_counts: TripCounts,
    day_kind: DayKind,
) -> ByDayKindServiceLevels:
    def predicate(trip_count):
        day_of_week = datetime.fromisoformat(trip_count["date"]).weekday()
        if day_kind == "weekday":
            return day_of_week < 5
        elif day_kind == "saturday":
            return day_of_week == 5
        elif day_kind == "sunday":
            return day_of_week == 6
        return False

    for trip_count in trip_counts:
        if predicate(trip_count):
            return {
                "date": trip_count["date"],
                "service_levels": trip_count.get("byHour", {}).get("totals", []),
            }
    return None


def get_service_levels(
    trip_counts: TripCounts,
    search_from_end: bool,
) -> ByDayKindServiceLevels:
    if search_from_end:
        trip_counts = list(reversed(trip_counts))
    return {
        "weekday": get_next_day_kind_service_levels(trip_counts, "weekday"),
        "saturday": get_next_day_kind_service_levels(trip_counts, "saturday"),
        "sunday": get_next_day_kind_service_levels(trip_counts, "sunday"),
    }


def get_trip_counts(
    start_date: date,
    end_date: date,
    route_id: str = None,
    fill_zeros: bool = False,
) -> GetTripCountsResponse:
    trip_counts = query_trip_counts(
        start_date=start_date,
        end_date=end_date,
        route_id=route_id,
    )
    trip_counts_by_date = index_by(trip_counts, "date")
    counts = []
    for today in date_range(start_date, end_date):
        trips_today = trip_counts_by_date.get(today.isoformat())
        if trips_today:
            counts.append(trips_today["count"])
        else:
            counts.append(counts[-1] if len(counts) and fill_zeros else 0)
    assert len(counts) == (end_date - start_date).days + 1
    return {
        "counts": counts,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "start_date_service_levels": get_service_levels(trip_counts, False),
        "end_date_service_levels": get_service_levels(trip_counts, True),
    }
