"""Date parsing and formatting utilities for transit event data.

Handles parsing of event timestamps in multiple formats (with and without
timezone info) and provides the cutoff date between monthly and daily
S3 archives.
"""

from datetime import datetime
from zoneinfo import ZoneInfo


DATE_FORMAT_MASSDOT = "%Y-%m-%d %H:%M:%S"
DATE_FORMAT_TIMEZONE = "%Y-%m-%d %H:%M:%S%z"
DATE_FORMAT_OUT = "%Y-%m-%dT%H:%M:%S"
EASTERN_TIME = ZoneInfo("US/Eastern")

# The most recent date for which we have monthly data
MAX_MONTH_DATA_DATE = "2025-10-31"

# The earliest date for which LAMP bus data is published
LAMP_BUS_START_DATE = "2026-01-01"


def get_max_monthly_data_date():
    """Return the cutoff date between monthly archives and daily data.

    Dates on or before this value have monthly S3 archives available.
    Dates after require daily file downloads.

    Returns:
        ``datetime.date`` of the most recent monthly archive.
    """
    return datetime.strptime(MAX_MONTH_DATA_DATE, "%Y-%m-%d").date()


def get_lamp_bus_start_date():
    """Return the first date for which LAMP bus data is available.

    Bus dates on or after this value can be served from the LAMP S3 path.
    Earlier dates fall back to the Gobble pipeline.

    Returns:
        ``datetime.date`` of the LAMP bus data start.
    """
    return datetime.strptime(LAMP_BUS_START_DATE, "%Y-%m-%d").date()


def parse_event_date(date_str: str):
    """Parse a transit event timestamp string into a timezone-aware datetime.

    Handles two formats:

    - 19-character strings (``YYYY-MM-DD HH:MM:SS``) — assumed Eastern Time.
    - Longer strings with timezone offset (``YYYY-MM-DD HH:MM:SS±HHMM``).

    Args:
        date_str: Timestamp string from an event CSV.

    Returns:
        Timezone-aware ``datetime`` object.
    """
    if len(date_str) == 19:
        return datetime.strptime(date_str, DATE_FORMAT_MASSDOT).replace(tzinfo=EASTERN_TIME)
    else:
        return datetime.strptime(date_str, DATE_FORMAT_TIMEZONE)


def return_formatted_date(date: datetime):
    """Format a datetime as an ISO-style string for API responses.

    Args:
        date: Datetime object to format.

    Returns:
        String in ``YYYY-MM-DDTHH:MM:SS`` format.
    """
    return date.strftime(DATE_FORMAT_OUT)
