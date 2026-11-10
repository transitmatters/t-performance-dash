"""Date parsing and formatting utilities for transit event data.

Handles parsing of event timestamps in multiple formats (with and without
timezone info) and provides the cutoff date between monthly and daily
S3 archives.
"""

from datetime import date, datetime, time, timedelta, timezone
from functools import lru_cache
from zoneinfo import ZoneInfo


DATE_FORMAT_MASSDOT = "%Y-%m-%d %H:%M:%S"
DATE_FORMAT_TIMEZONE = "%Y-%m-%d %H:%M:%S%z"
# Gobble's Commuter Rail terminal arrivals from 2026-10-04 carry microseconds
DATE_FORMAT_TIMEZONE_FRACTIONAL = "%Y-%m-%d %H:%M:%S.%f%z"
DATE_FORMAT_OUT = "%Y-%m-%dT%H:%M:%S"
EASTERN_TIME = ZoneInfo("US/Eastern")

# The most recent date for which we have monthly data
MAX_MONTH_DATA_DATE = "2026-06-30"
MAX_FERRY_MONTH_DATA_DATE = "2026-03-31"


def get_max_monthly_data_date():
    """Return the cutoff date between monthly archives and daily data.

    Dates on or before this value have monthly S3 archives available.
    Dates after require daily file downloads.

    Returns:
        ``datetime.date`` of the most recent monthly archive.
    """
    return datetime.strptime(MAX_MONTH_DATA_DATE, "%Y-%m-%d").date()


def get_max_ferry_monthly_data_date():
    """Return the cutoff date between monthly ferry archives and daily Gobble ferry data."""
    return datetime.strptime(MAX_FERRY_MONTH_DATA_DATE, "%Y-%m-%d").date()


def parse_event_date(date_str: str):
    """Parse a transit event timestamp string into a timezone-aware datetime.

    Handles three formats:

    - 19-character strings (``YYYY-MM-DD HH:MM:SS``) — assumed Eastern Time.
    - Longer strings with timezone offset (``YYYY-MM-DD HH:MM:SS±HHMM``).
    - The same with fractional seconds (``YYYY-MM-DD HH:MM:SS.ffffff±HHMM``).

    Args:
        date_str: Timestamp string from an event CSV.

    Returns:
        Timezone-aware ``datetime`` object.
    """
    if len(date_str) == 19:
        return datetime.strptime(date_str, DATE_FORMAT_MASSDOT).replace(tzinfo=EASTERN_TIME)
    elif "." in date_str:
        return datetime.strptime(date_str, DATE_FORMAT_TIMEZONE_FRACTIONAL)
    else:
        return datetime.strptime(date_str, DATE_FORMAT_TIMEZONE)


@lru_cache(maxsize=4096)
def dst_eve_next_day_offset(service_date: str) -> timedelta | None:
    """Return the next day's UTC offset if ``service_date`` is the day before a DST change.

    The MBTA's monthly rapid transit archive converts predicted (PRA/PRD) events on
    these days to local time with the next day's offset, so they are an hour late on
    the Saturday before clocks spring forward and an hour early before they fall back.

    Args:
        service_date: Service date as ``YYYY-MM-DD``.

    Returns:
        The next day's UTC offset, or ``None`` if the offset doesn't change.
    """
    day = date.fromisoformat(service_date)
    today = datetime.combine(day, time(12), EASTERN_TIME).utcoffset()
    tomorrow = datetime.combine(day + timedelta(days=1), time(12), EASTERN_TIME).utcoffset()
    return tomorrow if tomorrow != today else None


def fix_dst_eve_event_time(event_time: str, next_day_offset: timedelta) -> str:
    """Undo the archive's next-day-offset conversion of a predicted event's local time.

    Recovers the UTC instant the archive started from, then converts it to Eastern
    time properly. Events after the clock change were already right and come back
    unchanged.

    Args:
        event_time: Local ``YYYY-MM-DD HH:MM:SS`` time from the archive.
        next_day_offset: Offset returned by ``dst_eve_next_day_offset``.

    Returns:
        The corrected local time in the same format.
    """
    instant = (datetime.strptime(event_time, DATE_FORMAT_MASSDOT) - next_day_offset).replace(tzinfo=timezone.utc)
    return instant.astimezone(EASTERN_TIME).strftime(DATE_FORMAT_MASSDOT)


def return_formatted_date(date: datetime):
    """Format a datetime as an ISO-style string for API responses.

    Args:
        date: Datetime object to format.

    Returns:
        String in ``YYYY-MM-DDTHH:MM:SS`` format.
    """
    return date.strftime(DATE_FORMAT_OUT)
