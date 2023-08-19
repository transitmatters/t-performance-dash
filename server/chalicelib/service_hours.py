from datetime import date, datetime
from concurrent import futures
from calendar import monthrange
from typing import List, TypedDict, Literal

from chalicelib.service_levels import get_scheduled_service, GetScheduledServiceResponse
from chalicelib.speed import trip_metrics_by_line

AggType = Literal["daily", "weekly", "monthly"]

LINE_AND_ROUTE_IDS = {
    "line-blue": ("line-blue", "Blue"),
    "line-orange": ("line-orange", "Orange"),
    "line-red": ("line-red", "Red"),
    "line-green": ("line-green", "Green"),
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


def get_service_hours(
    line_id: str,
    start_date: date,
    end_date: date,
    agg: AggType,
) -> List[ServiceHoursEntry]:
    (line_id, route_id) = LINE_AND_ROUTE_IDS[line_id]
    with futures.ThreadPoolExecutor(max_workers=2) as executor:
        scheduled_service = executor.submit(
            get_scheduled_service,
            start_date=start_date,
            end_date=end_date,
            route_id=route_id,
            agg=agg,
        )
        trip_metrics = executor.submit(
            trip_metrics_by_line,
            {
                "start_date": start_date.strftime("%Y-%m-%d"),
                "end_date": end_date.strftime("%Y-%m-%d"),
                "agg": agg,
                "line": line_id,
            },
        )
        scheduled_service = scheduled_service.result()
        trip_metrics = trip_metrics.result()
    responses = []
    for idx, trip_metric in enumerate(trip_metrics):
        date = datetime.fromisoformat(trip_metric["date"]).date()
        scheduled = scheduled_service["service_minutes"][idx] // 60
        delivered = get_daily_delivered_hours(
            trip_metric["total_time"],
            date,
            agg,
        )
        responses.append(
            {
                "date": date.isoformat(),
                "scheduled": scheduled,
                "delivered": delivered,
            }
        )
    return responses
