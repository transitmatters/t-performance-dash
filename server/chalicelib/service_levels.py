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
    service_minutes: List[int]


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
                "service_levels": daily_service_count.get("byHour", {}).get(
                    "totals", []
                ),
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


def sample_weekly(
    values: List[float],
    start_date: date,
    end_date: date,
    avg_type=Literal["mean", "median"],
):
    df = pd.DataFrame({"value": values}, index=pd.date_range(start_date, end_date))
    resampled = df.resample("W-SUN")
    weekly_df = resampled.mean() if avg_type == "mean" else resampled.median()
    # Drop the first week if it is incomplete
    if datetime.fromisoformat(start_date.isoformat()).weekday() != 6:
        weekly_df = weekly_df[1:]
    return weekly_df["value"].tolist()


def sample_monthly(
    values: List[float],
    start_date: date,
    end_date: date,
    avg_type=Literal["mean", "median"],
):
    df = pd.DataFrame(
        {"value": values},
        index=pd.date_range(start_date, end_date),
    )
    resampled = df.resample("M")
    monthly_df = resampled.mean() if avg_type == "mean" else resampled.median()
    # Drop the first month if it is incomplete
    if datetime.fromisoformat(start_date.isoformat()).day != 1:
        monthly_df = monthly_df[1:]
    return monthly_df["value"].tolist()


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
    daily_counts = []
    daily_service_minutes = []
    for current_day in date_range(start_date, end_date):
        current_day_iso = current_day.isoformat()
        if current_day_iso in scheduled_service_by_day:
            entry_today = scheduled_service_by_day[current_day_iso]
            count_today = entry_today["count"]
            service_minutes_today = entry_today["serviceMinutes"]
        else:
            count_today = 0
            service_minutes_today = 0
        daily_counts.append(count_today)
        daily_service_minutes.append(service_minutes_today)
    counts = []
    if agg == "daily":
        counts = daily_counts
        service_minutes = daily_service_minutes
    if agg == "weekly":
        counts = sample_weekly(
            values=daily_counts,
            start_date=start_date,
            end_date=end_date,
            avg_type="median",
        )
        service_minutes = sample_weekly(
            values=daily_service_minutes,
            start_date=start_date,
            end_date=end_date,
            avg_type="mean",
        )
    if agg == "monthly":
        counts = sample_monthly(
            values=daily_counts,
            start_date=start_date,
            end_date=end_date,
            avg_type="median",
        )
        service_minutes = sample_monthly(
            values=daily_service_minutes,
            start_date=start_date,
            end_date=end_date,
            avg_type="mean",
        )
    return {
        "counts": counts,
        "service_minutes": service_minutes,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "start_date_service_levels": get_service_levels(scheduled_service, False),
        "end_date_service_levels": get_service_levels(scheduled_service, True),
    }
