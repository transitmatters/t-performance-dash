import boto3
import botocore
from botocore.exceptions import ClientError
import csv
import itertools
import zlib

from chalicelib import parallel

BUCKET = "tm-mbta-performance"
s3 = boto3.client("s3", config=botocore.client.Config(max_pool_connections=15))


# General downloading/uploading
def download(key, encoding="utf8", compressed=True):
    obj = s3.get_object(Bucket=BUCKET, Key=key)
    s3_data = obj["Body"].read()
    if not compressed:
        return s3_data.decode(encoding)
    # 32 should detect zlib vs gzip
    decompressed = zlib.decompress(s3_data, zlib.MAX_WBITS | 32).decode(encoding)
    return decompressed


def upload(key, bytes, compress=True):
    if compress:
        bytes = zlib.compress(bytes)
    s3.put_object(Bucket=BUCKET, Key=key, Body=bytes)


def is_bus(stop_id):
    return ("-0-" in stop_id) or ("-1-" in stop_id)


def download_one_event_file(date, stop_id, live=False):
    """As advertised: single event file from s3"""
    year, month, day = date.year, date.month, date.day

    if live:
        folder = "daily-bus-data" if is_bus(stop_id) else "daily-data"
        key = f"Events-live/{folder}/{stop_id}/Year={year}/Month={month}/Day={day}/events.csv.gz"
    else:
        folder = "monthly-bus-data" if is_bus(stop_id) else "monthly-data"
        key = f"Events/{folder}/{stop_id}/Year={year}/Month={month}/events.csv.gz"

    # Download events from S3
    try:
        decompressed = download(key, "ascii")

    except ClientError as ex:
        if ex.response["Error"]["Code"] == "NoSuchKey":
            # raise Exception(f"Data not available on S3 for key {key} ") from None
            print(f"WARNING: No data available on S3 for key: {key}")
            if not live:
                return download_one_event_file(date, stop_id, live=True)
            return []
        else:
            raise

    # Parse CSV
    rows = []
    for row in csv.DictReader(decompressed.splitlines()):
        rows.append(row)

    # sort
    rows_by_time = sorted(rows, key=lambda row: row["event_time"])
    return rows_by_time


@parallel.make_parallel
def parallel_download_events(datestop):
    (date, stop) = datestop
    return download_one_event_file(date, stop)


def download_events(sdate, edate, stops):
    # This used to be month_range but updated to date_range to support live ranges
    # If something breaks, this may be why
    datestops = itertools.product(parallel.date_range(sdate, edate), stops)
    result = parallel_download_events(datestops)
    result = filter(lambda row: sdate.strftime("%Y-%m-%d") <= row["service_date"] <= edate.strftime("%Y-%m-%d"), result)
    return sorted(result, key=lambda row: row["event_time"])
