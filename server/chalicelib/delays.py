from typing import TypedDict
from chalice import BadRequestError, ForbiddenError
from chalicelib import dynamo
from datetime import date, datetime, timedelta
from chalicelib.constants import DATE_FORMAT_BACKEND


TABLE_NAME = "AlertDelaysWeekly"
MAX_DELTA = 5000


class AlertDelaysByLineParams(TypedDict):
    start_date: str | date
    end_date: str | date
    line: str


def is_invalid_range(start_date, end_date, max_delta):
    """Check if number of requested entries is more than maximum for the table"""
    start_datetime = datetime.strptime(start_date, DATE_FORMAT_BACKEND)
    end_datetime = datetime.strptime(end_date, DATE_FORMAT_BACKEND)
    return start_datetime + timedelta(days=max_delta) < end_datetime


def delay_time_by_line(params: AlertDelaysByLineParams):
    try:
        start_date = params["start_date"]
        end_date = params["end_date"]
        line = params["line"]
        if line not in [
            "Red",
            "Blue",
            "Orange",
            "Green-B",
            "Green-C",
            "Green-D",
            "Green-E",
        ]:
            raise BadRequestError("Invalid Line key.")
    except KeyError:
        raise BadRequestError("Missing or invalid parameters.")
    # Prevent queries of more than 5000 items.
    if is_invalid_range(start_date, end_date, MAX_DELTA):
        raise ForbiddenError("Date range too long. The maximum number of requested values is 150.")
    # If querying for weekly/monthly data, can just return the query.
    return dynamo.query_agg_trip_metrics(start_date, end_date, TABLE_NAME, line)
