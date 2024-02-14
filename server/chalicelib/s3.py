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


def is_bus(stop_id: str):
    return ("-0-" in stop_id) or ("-1-" in stop_id)


def get_live_folder(stop_id: str):
    if is_bus(stop_id):
        return "daily-bus-data"
    else:
        return "daily-rapid-data"


def download_one_event_file(date, stop_id: str, use_live_data=False):
    """As advertised: single event file from s3"""
    year, month, day = date.year, date.month, date.day

    if use_live_data:
        folder = get_live_folder(stop_id)
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
            if not use_live_data and is_bus(stop_id):
                return download_one_event_file(date, stop_id, use_live_data=True)
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


def download_events(sdate: str, edate: str, stops: list):
    datestops = itertools.product(parallel.s3_date_range(sdate, edate), stops)
    result = parallel_download_events(datestops)
    result = filter(lambda row: sdate.strftime("%Y-%m-%d") <= row["service_date"] <= edate.strftime("%Y-%m-%d"), result)
    return sorted(result, key=lambda row: row["event_time"])


def get_all_s3_objects(s3, **base_kwargs):
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
