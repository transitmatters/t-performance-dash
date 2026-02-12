"""Scheduled vs. delivered service hours comparison.

Queries both scheduled service data and delivered trip metrics from DynamoDB,
then computes and compares service hours at the requested aggregation level.
"""

from datetime import date
from concurrent import futures
from typing import List, TypedDict, Literal, Dict
import pandas as pd

from chalicelib.scheduled_service import get_scheduled_service_hours
from chalicelib.dynamo import query_extended_trip_metrics
from chalicelib.sampling import resample_and_aggregate

AggType = Literal["daily", "weekly", "monthly"]

ROUTE_IDS_BY_LINE = {
    "line-blue": ("line-blue",),
    "line-orange": ("line-orange",),
    "line-red": ("line-red", "line-red-a", "line-red-b"),
    "line-green": ("line-green-b", "line-green-c", "line-green-d", "line-green-e"),
    "line-mattapan": ("line-mattapan"),
}

SINGLE_ROUTE_IDS_BY_LINE_KEY = {
    "line-blue": "Blue",
    "line-orange": "Orange",
    "line-red": "Red",
    "line-green": "Green",
    "line-mattapan": "Mattapan",
}


class ServiceHoursEntry(TypedDict):
    """A single day's scheduled vs. delivered service hours.

    Attributes:
        date: Date string (YYYY-MM-DD).
        scheduled: Scheduled service hours for the day.
        delivered: Delivered service hours for the day.
    """
    date: str
    scheduled: int
    delivered: int


def get_delivered_service_times(response_dicts: List[Dict[str, any]], agg: AggType):
    """Calculate delivered service hours from extended trip metric records.

    Computes total delivered hours per date by multiplying trip counts by
    mean trip times for each direction, then resamples to the requested
    aggregation level using median.

    Args:
        response_dicts: List of extended trip metric records from DynamoDB.
        agg: Aggregation level — ``"daily"``, ``"weekly"``, or ``"monthly"``.

    Returns:
        Dictionary mapping date strings to delivered service hours.
    """
    df = pd.DataFrame.from_records(response_dicts)
    service_hours = {}
    # unique service_dates
    service_dates = df["date"].unique()
    for today in service_dates:
        df_for_date = df[df["date"] == today][
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
        service_hours[today] = df_for_date.sum()["total_time"]
    return resample_and_aggregate(values=service_hours, agg=agg, avg_type="median")


def get_service_hours(
    single_route_id: str,
    start_date: date,
    end_date: date,
    agg: AggType,
) -> List[ServiceHoursEntry]:
    """Compare scheduled vs. delivered service hours for a transit line.

    Queries scheduled service and delivered trip metrics concurrently using
    a thread pool, then matches dates where both values are available.

    Args:
        single_route_id: Line identifier (e.g., ``line-red``, ``line-green``).
        start_date: Start of the date range.
        end_date: End of the date range.
        agg: Aggregation level — ``"daily"``, ``"weekly"``, or ``"monthly"``.

    Returns:
        List of ``ServiceHoursEntry`` dicts with date, scheduled, and delivered fields.
    """
    responses = []
    route_ids = ROUTE_IDS_BY_LINE[single_route_id]
    single_route_id = SINGLE_ROUTE_IDS_BY_LINE_KEY[single_route_id]
    with futures.ThreadPoolExecutor(max_workers=2) as executor:
        scheduled_service_hours = executor.submit(
            get_scheduled_service_hours,
            start_date=start_date,
            end_date=end_date,
            route_id=single_route_id,
            agg=agg,
        ).result()
        extended_trip_metrics = executor.submit(
            query_extended_trip_metrics,
            start_date=start_date,
            end_date=end_date,
            route_ids=route_ids,
        ).result()
    delivered_service_hours = get_delivered_service_times(extended_trip_metrics, agg)
    for date_str in scheduled_service_hours.keys():
        scheduled = scheduled_service_hours.get(date_str)
        delivered = delivered_service_hours.get(date_str)
        if scheduled and delivered:
            responses.append(
                {
                    "date": date_str,
                    "scheduled": scheduled,
                    "delivered": delivered,
                }
            )
    return responses
