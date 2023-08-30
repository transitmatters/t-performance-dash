from datetime import date, datetime
from concurrent import futures
from calendar import monthrange
from typing import List, TypedDict, Literal, Dict
import pandas as pd

from chalicelib.service_levels import get_scheduled_service, GetScheduledServiceResponse
from chalicelib.speed import trip_metrics_by_line
from chalicelib.dynamo import query_extended_trip_metrics
from chalicelib.data_funcs import date_range

AggType = Literal["daily", "weekly", "monthly"]

ROUTE_IDS_BY_LINE = {
    "line-blue": ("line-blue",),
    "line-orange": ("line-orange",),
    "line-red": ("line-red", "line-red-a", "line-red-b"),
    "line-green": ("line-green-b", "line-green-c", "line-green-d", "line-green-e"),
}

SINGLE_ROUTE_IDS_BY_LINE_KEY = {
    "line-blue": "Blue",
    "line-orange": "Orange",
    "line-red": "Red",
    "line-green": "Green",
}


class ServiceHoursEntry(TypedDict):
    date: str
    scheduled: int
    delivered: int


def get_scheduled_hours(scheduled_response: GetScheduledServiceResponse):
    return [minutes // 60 for minutes in scheduled_response["service_minutes"]]


def get_daily_delivered_hours(total_seconds: float, date: date, agg: AggType):
    if agg == "daily":
        return total_seconds // 3600
    elif agg == "weekly":
        return total_seconds // (3600 * 7)
    elif agg == "monthly":
        days_in_month = monthrange(date.year, date.month)[1]
        return total_seconds // (3600 * days_in_month)


def get_delivered_service_times(response_dicts: List[Dict[str, any]]):
    df = pd.DataFrame.from_records(response_dicts)
    service_hours = {}
    # unique service_dates
    service_dates = df["date"].unique()
    for date in service_dates:
        df_for_date = df[df["date"] == date][
            [
                "dir_0_exclusive_count",
                "dir_1_exclusive_count",
                "dir_0_inclusive_mean",
                "dir_1_inclusive_mean",
            ]
        ]
        df_for_date["total_time"] = (
            df_for_date["dir_0_exclusive_count"] * df_for_date["dir_0_inclusive_mean"]
            + df_for_date["dir_1_exclusive_count"] * df_for_date["dir_1_inclusive_mean"]
        ) // 3600
        service_hours[date] = df_for_date.sum()["total_time"]
    return service_hours


def get_service_hours(
    single_route_id: str,
    start_date: date,
    end_date: date,
) -> List[ServiceHoursEntry]:
    responses = []
    route_ids = ROUTE_IDS_BY_LINE[single_route_id]
    single_route_id = SINGLE_ROUTE_IDS_BY_LINE_KEY[single_route_id]
    with futures.ThreadPoolExecutor(max_workers=2) as executor:
        scheduled_service_result = executor.submit(
            get_scheduled_service,
            start_date=start_date,
            end_date=end_date,
            route_id=single_route_id,
            agg="daily",
        )
        delivered_service_by_date = executor.submit(
            query_extended_trip_metrics,
            start_date=start_date,
            end_date=end_date,
            route_ids=route_ids,
        )
        scheduled_service_result = scheduled_service_result.result()
        delivered_service_by_date = delivered_service_by_date.result()
    delivered_service_by_date = get_delivered_service_times(delivered_service_by_date)
    for idx, date in enumerate(date_range(start_date, end_date)):
        date_str = date.isoformat()
        scheduled_service_hours = scheduled_service_result["service_minutes"][idx] // 60
        delivered_service_hours = delivered_service_by_date.get(date_str)
        if scheduled_service_hours and delivered_service_hours:
            responses.append(
                {
                    "date": date.isoformat(),
                    "scheduled": scheduled_service_hours,
                    "delivered": delivered_service_hours,
                }
            )
    return responses
