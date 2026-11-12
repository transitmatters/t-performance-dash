"""Date parsing and formatting utilities for transit event data.

Handles parsing of event timestamps in multiple formats (with and without
timezone info) and provides the cutoff date between monthly and daily
S3 archives.
"""

from datetime import date, datetime, time, timedelta, timezone
from functools import lru_cache
from zoneinfo import ZoneInfo

DATE_FORMAT_OUT = "%Y-%m-%dT%H:%M:%S"
EASTERN_TIME = ZoneInfo("America/New_York")

# Service days run from 3 AM to 3 AM Eastern, the same cutoff as gobble, data-ingestion and mbta-performance,
# which write and summarize the events this backend reads. Routes 15 and 28 leave as early as 3:20 AM, so a
# later cutoff would file those trips under the day before.
SERVICE_DAY_START = timedelta(hours=3)

# The most recent date for which we have monthly data
MAX_MONTH_DATA_DATE = "2026-06-30"
MAX_FERRY_MONTH_DATA_DATE = "2026-03-31"

# The earliest date for which LAMP bus data is published
LAMP_BUS_START_DATE = "2025-07-30"


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
    Earlier dates skip LAMP and read the monthly archive or Gobble.

    Returns:
        ``datetime.date`` of the LAMP bus data start.
    """
    return datetime.strptime(LAMP_BUS_START_DATE, "%Y-%m-%d").date()


def get_max_ferry_monthly_data_date():
    """Return the cutoff date between monthly ferry archives and daily Gobble ferry data."""
    return datetime.strptime(MAX_FERRY_MONTH_DATA_DATE, "%Y-%m-%d").date()


def current_service_date(now: datetime | None = None) -> date:
    """Return today's service date in Boston. Service days start at ``SERVICE_DAY_START``.

    Args:
        now: The moment to check, for tests. Defaults to the current time.

    Returns:
        ``datetime.date`` of the current service day.
    """
    now = (now or datetime.now(EASTERN_TIME)).astimezone(EASTERN_TIME)
    # Aware datetime arithmetic moves the wall clock, so this holds across DST changes
    return (now - SERVICE_DAY_START).date()


def parse_event_date(date_str: str):
    """Parse a transit event timestamp string into a timezone-aware datetime.

    Handles three formats:

    - ``YYYY-MM-DD HH:MM:SS`` with no offset — assumed Eastern Time.
    - The same with a timezone offset (``YYYY-MM-DD HH:MM:SS±HH:MM``).
    - The same with fractional seconds (``YYYY-MM-DD HH:MM:SS.ffffff±HH:MM``), which Gobble's
      Commuter Rail terminal arrivals carry from 2026-10-04.

    Args:
        date_str: Timestamp string from an event CSV.

    Returns:
        Timezone-aware ``datetime`` object.
    """
    parsed = datetime.fromisoformat(date_str)
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=EASTERN_TIME)
    return parsed


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
    instant = (datetime.fromisoformat(event_time) - next_day_offset).replace(tzinfo=timezone.utc)
    return instant.astimezone(EASTERN_TIME).strftime("%Y-%m-%d %H:%M:%S")


def return_formatted_date(date: datetime):
    """Format a datetime as an ISO-style string for API responses.

    Args:
        date: Datetime object to format.

    Returns:
        String in ``YYYY-MM-DDTHH:MM:SS`` format.
    """
    return date.strftime(DATE_FORMAT_OUT)
