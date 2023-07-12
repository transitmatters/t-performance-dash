from datetime import date, datetime
from typing import List, Dict, TypedDict, Union, Literal
import pandas as pd

from .dynamo import query_scheduled_service
from .data_funcs import index_by, date_range

ByHourServiceLevels = List[int]
DayKind = Union[Literal["weekday"], Literal["saturday"], Literal["sunday"]]
AggTypes = Union[Literal["daily"], Literal["weekly"], Literal["monthly"]]
ScheduledService = List[Dict]


class ByDayKindServiceLevels(TypedDict):
    date: str
    service_levels: ByHourServiceLevels


class ByDayKindServiceLevels(TypedDict):
    weekday: ByDayKindServiceLevels
    saturday: ByDayKindServiceLevels
    sunday: ByDayKindServiceLevels


class GetScheduledServiceResponse(TypedDict):
    start_date_service_levels: ByDayKindServiceLevels
    end_date_service_levels: ByDayKindServiceLevels
    start_date: str
    end_date: str
    counts: List[int]


def get_next_day_kind_service_levels(
    scheduled_service: ScheduledService,
    day_kind: DayKind,
) -> ByDayKindServiceLevels:
    def predicate(scheduled_service_day):
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
    if search_from_end:
        scheduled_service = list(reversed(scheduled_service))
    return {
        "weekday": get_next_day_kind_service_levels(scheduled_service, "weekday"),
        "saturday": get_next_day_kind_service_levels(scheduled_service, "saturday"),
        "sunday": get_next_day_kind_service_levels(scheduled_service, "sunday"),
    }


def get_weekly_scheduled_service(scheduled_service_arr, start_date, end_date):
    df = pd.DataFrame({'value': scheduled_service_arr}, index=pd.date_range(start_date, end_date))
    weekly_df = df.resample('W-SUN').median()
    # Drop the first week if it is incomplete
    if datetime.fromisoformat(start_date.isoformat()).weekday() != 6:
        weekly_df = weekly_df[1:]
    return weekly_df['value'].tolist()


def get_monthly_scheduled_service(scheduled_service_arr, start_date, end_date):
    df = pd.DataFrame({'value': scheduled_service_arr}, index=pd.date_range(start_date, end_date))
    monthly_df = df.resample('M').median()
    # Drop the first month if it is incomplete
    if datetime.fromisoformat(start_date.isoformat()).day != 1:
        monthly_df = monthly_df[1:]
    return monthly_df['value'].tolist()


def get_scheduled_service(
    start_date: date,
    end_date: date,
    agg: AggTypes,
    route_id: str = None,
) -> GetScheduledServiceResponse:
    scheduled_service = query_scheduled_service(
        start_date=start_date,
        end_date=end_date,
        route_id=route_id,
    )
    scheduled_service_by_day = index_by(scheduled_service, "date")
    scheduled_service_arr = []
    for current_day in date_range(start_date, end_date):
        current_day_iso = current_day.isoformat()
        if current_day_iso in scheduled_service_by_day:
            scheduled_service_count = scheduled_service_by_day[current_day_iso]["count"]
        else:
            scheduled_service_count = 0
        scheduled_service_arr.append(scheduled_service_count)
    counts = []
    if agg == 'daily':
        counts = scheduled_service_arr
    if agg == 'weekly':
        counts = get_weekly_scheduled_service(scheduled_service_arr, start_date, end_date)
    if agg == 'monthly':
        counts = get_monthly_scheduled_service(scheduled_service_arr, start_date, end_date)

    return {
        "counts": counts,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "start_date_service_levels": get_service_levels(scheduled_service, False),
        "end_date_service_levels": get_service_levels(scheduled_service, True),
    }
