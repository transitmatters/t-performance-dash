from datetime import date, datetime
from typing import List, Dict, TypedDict, Union, Literal
import pandas as pd

from .dynamo import query_trip_counts
from .data_funcs import index_by, date_range

ByHourServiceLevels = List[int]
DayKind = Union[Literal["weekday"], Literal["saturday"], Literal["sunday"]]
AggTypes = Union[Literal["daily"], Literal["weekly"], Literal["monthly"]]
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


def get_weekly_trip_counts(trip_counts_arr, start_date, end_date):
    df = pd.DataFrame({'value': trip_counts_arr}, index=pd.date_range(start_date, end_date))
    weekly_df = df.resample('W-SUN').median()
    # Drop the first week if it is incomplete
    if datetime.fromisoformat(start_date.isoformat()).weekday() != 6:
        weekly_df = weekly_df[1:]
    return weekly_df['value'].tolist()


def get_monthly_trip_counts(trip_counts_arr, start_date, end_date):
    df = pd.DataFrame({'value': trip_counts_arr}, index=pd.date_range(start_date, end_date))
    monthly_df = df.resample('M').median()
    # Drop the first month if it is incomplete
    if datetime.fromisoformat(start_date.isoformat()).day != 1:
        monthly_df = monthly_df[1:]
    return monthly_df['value'].tolist()


def get_trip_counts(
    start_date: date,
    end_date: date,
    agg: AggTypes,
    route_id: str = None,
) -> GetTripCountsResponse:
    trip_counts = query_trip_counts(
        start_date=start_date,
        end_date=end_date,
        route_id=route_id,
    )
    trip_counts_by_date = index_by(trip_counts, "date")
    trip_counts_arr = []
    for current_day in date_range(start_date, end_date):
        current_day_iso = current_day.isoformat()
        if current_day_iso in trip_counts_by_date:
            trip_count = trip_counts_by_date[current_day_iso]["count"]
        else:
            trip_count = 0
        trip_counts_arr.append(trip_count)
    counts = []
    if agg == 'daily':
        counts = trip_counts_arr
    if agg == 'weekly':
        counts = get_weekly_trip_counts(trip_counts_arr, start_date, end_date)
    if agg == 'monthly':
        counts = get_monthly_trip_counts(trip_counts_arr, start_date, end_date)

    return {
        "counts": counts,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "start_date_service_levels": get_service_levels(trip_counts, False),
        "end_date_service_levels": get_service_levels(trip_counts, True),
    }
