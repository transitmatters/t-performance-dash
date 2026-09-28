"""S3 data access layer for downloading and uploading transit event data."""

from datetime import date
import boto3
import botocore
import pandas as pd
from botocore.exceptions import ClientError
import csv
import itertools
import zlib

from chalicelib import parallel
from chalicelib import date_utils

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
      str: One of "daily-bus-data", "daily-cr-data", or "daily-rapid-data".
    """
    if is_bus(stop_id):
        return "daily-bus-data"
    elif is_cr(stop_id):
        return "daily-cr-data"
    else:
        return "daily-rapid-data"


def get_lamp_folder():
    """Return the S3 folder name for LAMP-ingested data."""
    return "daily-data"


def is_rapid_transit(stop_id: str):
    """Check if a stop ID belongs to a rapid transit (subway) route."""
    return not (is_bus(stop_id) or is_cr(stop_id) or is_ferry(stop_id))


def download_one_event_file(date: pd.Timestamp, stop_id: str, use_gobble=False, route_context=None, prefer_lamp=False):
    """Download and parse a single day's event CSV for a stop from S3.

    Selects the appropriate S3 path based on the stop's mode (bus, CR, ferry, rapid
    transit) and data recency (monthly archives vs. daily LAMP/Gobble feeds). Falls
    back to Gobble data if the LAMP key is not found.

    Args:
      date: pd.Timestamp: The date to fetch events for.
      stop_id: str: The stop identifier.
      use_gobble: Force using Gobble data instead of LAMP. (Default value = False)
      route_context: Unused, reserved for future use. (Default value = None)
      prefer_lamp: For rapid transit, try LAMP before the monthly archive, which is less
        detailed. Used for single-day requests. (Default value = False)

    Returns:
      list[dict]: Rows of event data sorted by event_time, or empty list if unavailable.
    """
    year, month, day = date.year, date.month, date.day

    if prefer_lamp and is_rapid_transit(stop_id) and date.date() <= date_utils.get_max_monthly_data_date():
        lamp_key = f"Events-lamp/{get_lamp_folder()}/{stop_id}/Year={year}/Month={month}/Day={day}/events.csv"
        try:
            return _parse_events(download(lamp_key, "ascii", False))
        except ClientError as ex:
            if ex.response["Error"]["Code"] != "NoSuchKey":
                raise
        return download_one_event_file(date, stop_id, use_gobble, route_context)

    if is_cr(stop_id):
        folder = get_gobble_folder(stop_id)
        key = f"Events-live/{folder}/{stop_id}/Year={year}/Month={month}/Day={day}/events.csv.gz"
    if is_ferry(stop_id):
        folder = "monthly-ferry-data"
        key = f"Events/{folder}/{stop_id}/Year={year}/Month={month}/events.csv.gz"
    # if current date is newer than the max monthly data date, use LAMP
    elif date.date() > date_utils.get_max_monthly_data_date():
        # if we've asked to use gobble data or bus data, check gobble
        if use_gobble or is_bus(stop_id):
            folder = get_gobble_folder(stop_id)
            key = f"Events-live/{folder}/{stop_id}/Year={year}/Month={month}/Day={day}/events.csv.gz"
        else:
            folder = get_lamp_folder()
            key = f"Events-lamp/{folder}/{stop_id}/Year={year}/Month={month}/Day={day}/events.csv"
    else:
        folder = "monthly-bus-data" if is_bus(stop_id) else "monthly-data"
        key = f"Events/{folder}/{stop_id}/Year={year}/Month={month}/events.csv.gz"

    # Download events from S3
    try:
        decompressed = download(key, "ascii", ".gz" in key)

    except ClientError as ex:
        if ex.response["Error"]["Code"] == "NoSuchKey":
            # raise Exception(f"Data not available on S3 for key {key} ") from None
            print(f"WARNING: No data available on S3 for key: {key}")
            if not use_gobble and not is_bus(stop_id):
                return download_one_event_file(date, stop_id, use_gobble=True)
            return []
        else:
            raise

    return _parse_events(decompressed)


def _parse_events(csv_text: str):
    """Parse an events CSV into rows sorted by event_time."""
    return sorted(csv.DictReader(csv_text.splitlines()), key=lambda row: row["event_time"])


@parallel.make_parallel
def parallel_download_events(datestop: itertools.product, prefer_lamp=False):
    """Download event data for a single (date, stop) pair. Parallelized via @make_parallel.

    Args:
      datestop: A (date, stop_id) tuple from an itertools.product iterator.
      prefer_lamp: Passed through to ``download_one_event_file``. (Default value = False)

    Returns:
      list[dict]: Event rows for the given date and stop.
    """
    (date, stop) = datestop
    return download_one_event_file(date, stop, prefer_lamp=prefer_lamp)


def download_events(start_date: date, end_date: date, stops: list):
    """Download event data for multiple stops over a date range, in parallel.

    Fetches all combinations of dates and stops, then filters to the exact date range
    and sorts by event time.

    Args:
      start_date: date: Start of the date range (inclusive).
      end_date: date: End of the date range (inclusive).
      stops: list: List of stop IDs to fetch data for.

    Returns:
      list[dict]: All event rows sorted by event_time.
    """
    if start_date == end_date:
        # Single day: fetch that exact date (not its month file) so rapid transit can read LAMP first
        datestops = [(pd.Timestamp(start_date), stop) for stop in stops]
        result = parallel_download_events(datestops, prefer_lamp=True)
    else:
        datestops = itertools.product(parallel.s3_date_range(start_date, end_date, stops), stops)
        result = parallel_download_events(datestops)
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
