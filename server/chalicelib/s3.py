"""S3 data access layer for downloading and uploading transit event data."""

import csv
import itertools
import zlib
from datetime import date

import boto3
import botocore
import pandas as pd
from botocore.exceptions import ClientError

from chalicelib import date_utils, parallel

BUCKET = "tm-mbta-performance"
s3 = boto3.client("s3", config=botocore.client.Config(max_pool_connections=25))


# General downloading/uploading
def download(key, encoding="utf8", compressed=True):
    """Download and decode a file from the S3 performance data bucket.

    Args:
      key: S3 object key to download.
      encoding: Character encoding for decoding. (Default value = "utf8")
      compressed: Whether the file is gzip/zlib compressed. (Default value = True)

    Returns:
      str: The decoded file contents as a string.
    """
    obj = s3.get_object(Bucket=BUCKET, Key=key)
    s3_data = obj["Body"].read()
    if not compressed:
        return s3_data.decode(encoding)
    # 32 should detect zlib vs gzip
    decompressed = zlib.decompress(s3_data, zlib.MAX_WBITS | 32).decode(encoding)
    return decompressed


def upload(key, bytes, compress=True):
    """Upload data to the S3 performance data bucket.

    Args:
      key: S3 object key to write to.
      bytes: Raw bytes to upload.
      compress: Whether to zlib-compress before uploading. (Default value = True)
    """
    if compress:
        bytes = zlib.compress(bytes)
    s3.put_object(Bucket=BUCKET, Key=key, Body=bytes)


def is_bus(stop_id: str):
    """Check if a stop ID belongs to a bus route based on its naming convention.

    Args:
      stop_id: str: The stop identifier.

    Returns:
      bool: True if the stop ID matches bus stop patterns ("-0-" or "-1-").
    """
    return ("-0-" in stop_id) or ("-1-" in stop_id)


def is_cr(stop_id: str):
    """Check if a stop ID belongs to a commuter rail route.

    Args:
      stop_id: str: The stop identifier.

    Returns:
      bool: True if the stop ID starts with "CR-".
    """
    return stop_id.startswith("CR-")


def is_ferry(stop_id: str):
    """Check if a stop ID belongs to a ferry route.

    Args:
      stop_id: str: The stop identifier.

    Returns:
      bool: True if the stop ID starts with "Boat-".
    """
    return stop_id.startswith("Boat-")


def get_gobble_folder(stop_id: str):
    """Return the S3 folder name for Gobble-ingested data based on the stop's mode.

    Args:
      stop_id: str: The stop identifier.

    Returns:
      str: One of "daily-bus-data", "daily-cr-data", "daily-ferry-data", or "daily-rapid-data".
    """
    if is_bus(stop_id):
        return "daily-bus-data"
    elif is_cr(stop_id):
        return "daily-cr-data"
    elif is_ferry(stop_id):
        return "daily-ferry-data"
    else:
        return "daily-rapid-data"


def get_lamp_folder(stop_id: str):
    """Return the S3 folder name for LAMP-ingested data based on the stop's mode.

    Args:
      stop_id: str: The stop identifier.

    Returns:
      str: "bus-daily-data" for bus stops, "daily-data" for rapid transit.
    """
    return "bus-daily-data" if is_bus(stop_id) else "daily-data"


def _historic_key(date: pd.Timestamp, stop_id: str):
    """S3 key for the stop's monthly archive covering ``date``, or None if there isn't one."""
    if is_cr(stop_id):
        return None
    if is_ferry(stop_id):
        if date.date() > date_utils.get_max_ferry_monthly_data_date():
            return None
        folder = "monthly-ferry-data"
    else:
        if date.date() > date_utils.get_max_monthly_data_date():
            return None
        folder = "monthly-bus-data" if is_bus(stop_id) else "monthly-data"
    return f"Events/{folder}/{stop_id}/Year={date.year}/Month={date.month}/events.csv.gz"


def _lamp_key(date: pd.Timestamp, stop_id: str):
    """S3 key for the stop's LAMP file on ``date``, or None if LAMP can't have it."""
    # Commuter Rail LAMP doesn't exist yet; add it here when it does
    if is_cr(stop_id) or is_ferry(stop_id):
        return None
    if is_bus(stop_id):
        # Bus LAMP is published a day late, so today always comes from Gobble
        if date.date() < date_utils.get_lamp_bus_start_date() or date.date() >= date_utils.current_service_date():
            return None
    folder = get_lamp_folder(stop_id)
    return f"Events-lamp/{folder}/{stop_id}/Year={date.year}/Month={date.month}/Day={date.day}/events.csv"


def _gobble_key(date: pd.Timestamp, stop_id: str):
    """S3 key for the stop's Gobble file on ``date``."""
    folder = get_gobble_folder(stop_id)
    return f"Events-live/{folder}/{stop_id}/Year={date.year}/Month={date.month}/Day={date.day}/events.csv.gz"


SINGLE_DAY_SOURCES = (_lamp_key, _historic_key, _gobble_key)
DAILY_FALLBACK_SOURCES = (_lamp_key, _gobble_key)


def _download_first(keys):
    """Download and parse the first of ``keys`` that exists, skipping Nones.

    Returns:
      list[dict] | None: Rows sorted by event_time, or None if no key exists.
    """
    for key in keys:
        if key is None:
            continue
        try:
            return _parse_events(download(key, "ascii", key.endswith(".gz")))
        except ClientError as ex:
            if ex.response["Error"]["Code"] != "NoSuchKey":
                raise
            print(f"WARNING: No data available on S3 for key: {key}")
    return None


def download_one_event_file(date: pd.Timestamp, stop_id: str):
    """Download a single day's events for a stop, for single-day (trip view) requests.

    Tries LAMP first for the most detail, then the monthly archive, then Gobble.

    Args:
      date: pd.Timestamp: The date to fetch events for.
      stop_id: str: The stop identifier.

    Returns:
      list[dict]: Rows of event data sorted by event_time, or empty list if unavailable.
    """
    return _download_first(source(date, stop_id) for source in SINGLE_DAY_SOURCES) or []


def download_range_event_file(date: pd.Timestamp, stop_id: str, start_date: date, end_date: date):
    """Download one ``parallel.s3_date_range`` entry for a stop, for ranged (aggregate) requests.

    Reads the monthly archive first since it's the most complete. If the stop has no
    archive for that month, or the date is past the archive, each day falls back to
    LAMP and then Gobble.

    Args:
      date: pd.Timestamp: A month-end date (monthly archive) or a single day.
      stop_id: str: The stop identifier.
      start_date: date: Start of the requested range, to limit the daily fallback.
      end_date: date: End of the requested range, to limit the daily fallback.

    Returns:
      list[dict]: Rows of event data, or empty list if unavailable.
    """
    historic_key = _historic_key(date, stop_id)
    if historic_key is None:
        days = [date]
    else:
        rows = _download_first([historic_key])
        if rows is not None:
            return rows
        month_start = date.replace(day=1)
        month_end = month_start + pd.offsets.MonthEnd(0)
        days = pd.date_range(max(month_start, pd.Timestamp(start_date)), min(month_end, pd.Timestamp(end_date)))

    rows = []
    for day in days:
        rows.extend(_download_first(source(day, stop_id) for source in DAILY_FALLBACK_SOURCES) or [])
    return rows


def _parse_events(csv_text: str):
    """Parse an events CSV into rows sorted by event_time."""
    return sorted(csv.DictReader(csv_text.splitlines()), key=lambda row: row["event_time"])


@parallel.make_parallel
def parallel_download_events(datestop: itertools.product, single_day=False, start_date=None, end_date=None):
    """Download event data for a single (date, stop) pair. Parallelized via @make_parallel.

    Args:
      datestop: A (date, stop_id) tuple from an itertools.product iterator.
      single_day: Use the single-day source order instead of the ranged one. (Default value = False)
      start_date: Start of the requested range, for ranged requests. (Default value = None)
      end_date: End of the requested range, for ranged requests. (Default value = None)

    Returns:
      list[dict]: Event rows for the given date and stop.
    """
    (date, stop) = datestop
    if single_day:
        return download_one_event_file(date, stop)
    return download_range_event_file(date, stop, start_date, end_date)


def download_events(start_date: date, end_date: date, stops: list, single_day=False):
    """Download event data for multiple stops over a date range, in parallel.

    Single-day requests (trip views) read LAMP, then the monthly archive, then Gobble.
    Ranged requests (aggregates) read the monthly archive, then LAMP, then Gobble.
    Each source falls back to the next when a stop's file is missing.

    Args:
      start_date: date: Start of the date range (inclusive).
      end_date: date: End of the date range (inclusive).
      stops: list: List of stop IDs to fetch data for.
      single_day: Whether this is a single-day request. (Default value = False)

    Returns:
      list[dict]: All event rows sorted by event_time.
    """
    if single_day:
        datestops = [(pd.Timestamp(start_date), stop) for stop in stops]
        result = parallel_download_events(datestops, single_day=True)
    else:
        datestops = itertools.product(parallel.s3_date_range(start_date, end_date, stops), stops)
        result = parallel_download_events(datestops, start_date=start_date, end_date=end_date)
    result = filter(
        lambda row: start_date.strftime("%Y-%m-%d") <= row["service_date"] <= end_date.strftime("%Y-%m-%d"), result
    )
    return sorted(result, key=lambda row: row["event_time"])


def get_all_s3_objects(s3, **base_kwargs):
    """Paginate through all objects in an S3 bucket/prefix, yielding each object metadata.

    Args:
      s3: A boto3 S3 client.
      **base_kwargs: Arguments passed to s3.list_objects_v2 (e.g., Bucket, Prefix).

    Yields:
      dict: Individual object metadata dicts from the S3 listing.
    """
    continuation_token = None
    while True:
        list_kwargs = dict(MaxKeys=1000, **base_kwargs)
        if continuation_token:
            list_kwargs["ContinuationToken"] = continuation_token
        response = s3.list_objects_v2(**list_kwargs)
        yield from response.get("Contents", [])
        if not response.get("IsTruncated"):  # At the end of the list?
            break
        continuation_token = response.get("NextContinuationToken")
