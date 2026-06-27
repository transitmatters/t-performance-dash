"""Retrieval of hourly weather observations from S3.

Weather is written by a separate Lambda as one gzipped JSON per day at
``Weather/hourly/<date>.json.gz``, keyed by local-time ISO hour strings
(``YYYY-MM-DDTHH:00``, America/New_York). Today/tomorrow files are partial
because the forecast extends only ~24 hours ahead; historical archive days
may also be missing due to the upstream feed's ~2-day publishing lag.
"""

from datetime import date

from botocore.exceptions import ClientError
import json

from chalicelib import parallel, s3


def key(day: date) -> str:
    """Construct the S3 object key for a given day's weather file."""
    return f"Weather/hourly/{day.isoformat()}.json.gz"


def get_weather_for_day(day: date) -> list[dict]:
    """Download and flatten a single day's hourly weather file.

    Transforms the on-disk ``{"<ts>": {...fields}, ...}`` shape into a list of
    ``{"timestamp": <ts>, ...fields}`` dicts sorted by timestamp. Returns an
    empty list if the S3 key does not exist (expected for forecast-only days
    and historical gaps).
    """
    try:
        raw = s3.download(key(day), "utf8")
    except ClientError as ex:
        if ex.response["Error"]["Code"] == "NoSuchKey":
            return []
        raise
    by_hour: dict[str, dict] = json.loads(raw)
    return sorted(
        ({"timestamp": ts, **fields} for ts, fields in by_hour.items()),
        key=lambda row: row["timestamp"],
    )


@parallel.make_parallel
def _parallel_get_weather_for_day(day):
    """Fan-out wrapper for ``get_weather_for_day`` used by ``get_weather``."""
    return get_weather_for_day(day)


def get_weather(start_date: date, end_date: date) -> list[dict]:
    """Fetch hourly weather observations across a date range, in parallel.

    Args:
        start_date: First day to include (inclusive).
        end_date: Last day to include (inclusive).

    Returns:
        Flat list of hourly entries across all days in the range, sorted by
        timestamp ascending.
    """
    days = [d.date() for d in parallel.date_range(str(start_date), str(end_date))]
    rows = _parallel_get_weather_for_day(days)
    return sorted(rows, key=lambda row: row["timestamp"])
