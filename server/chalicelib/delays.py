from typing import TypedDict
from chalice import BadRequestError, ForbiddenError
from chalicelib import dynamo
from datetime import date, datetime, timedelta
from chalicelib.constants import DATE_FORMAT_BACKEND


# Config map for daily vs weekly delay queries
AGG_TO_CONFIG_MAP = {
    "daily": {"table_name": "AlertDelaysDaily", "delta": 150},
    "weekly": {"table_name": "AlertDelaysWeekly", "delta": 7 * 150},
}


class AlertDelaysByLineParams(TypedDict):
    start_date: str | date
    end_date: str | date
    line: str
    agg: str


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
        agg = params.get("agg", "weekly")  # Default to weekly if not specified
        config = AGG_TO_CONFIG_MAP.get(agg)
        if not config:
            raise BadRequestError("Invalid aggregation type. Must be 'daily' or 'weekly'.")
        valid_lines = [
            "Red",
            "Blue",
            "Orange",
            "Green-B",
            "Green-C",
            "Green-D",
            "Green-E",
            "Mattapan",
            "CR-Fairmount",
            "CR-Fitchburg",
            "CR-Worcester",
            "CR-Franklin",
            "CR-Greenbush",
            "CR-Haverhill",
            "CR-Kingston",
            "CR-Lowell",
            "CR-Middleborough",
            "CR-NewBedford",
            "CR-Needham",
            "CR-Newburyport",
            "CR-Providence",
        ]
        if line not in valid_lines:
            raise BadRequestError("Invalid Line key.")
    except KeyError:
        raise BadRequestError("Missing or invalid parameters.")
    # Prevent queries of more than max allowed items (150 for the aggregation type).
    if is_invalid_range(start_date, end_date, config["delta"]):
        raise ForbiddenError("Date range too long. The maximum number of requested values is 150.")
    # Return the query from the appropriate table
    return dynamo.query_agg_trip_metrics(start_date, end_date, config["table_name"], line)
