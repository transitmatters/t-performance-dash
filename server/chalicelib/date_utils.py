from datetime import datetime
from zoneinfo import ZoneInfo


DATE_FORMAT_MASSDOT = "%Y-%m-%d %H:%M:%S"
DATE_FORMAT_TIMEZONE = "%Y-%m-%d %H:%M:%S%z"
DATE_FORMAT_OUT = "%Y-%m-%dT%H:%M:%S"
EASTERN_TIME = ZoneInfo("US/Eastern")

# The most recent date for which we have monthly data
MAX_MONTH_DATA_DATE = "2025-10-31"


def get_max_monthly_data_date():
    """
    Returns the most recent date for which we have monthly data
    """
    return datetime.strptime(MAX_MONTH_DATA_DATE, "%Y-%m-%d").date()


def parse_event_date(date_str: str):
    if len(date_str) == 19:
        return datetime.strptime(date_str, DATE_FORMAT_MASSDOT).replace(tzinfo=EASTERN_TIME)
    else:
        return datetime.strptime(date_str, DATE_FORMAT_TIMEZONE)


def return_formatted_date(date: datetime):
    return date.strftime(DATE_FORMAT_OUT)
