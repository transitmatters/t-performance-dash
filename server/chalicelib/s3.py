import boto3
from botocore.exceptions import ClientError
import csv
import zlib

from chalicelib import parallel

BUCKET = "tm-mbta-performance"
s3 = boto3.client('s3')


# General downloading/uploading
def download(key, encoding="utf8"):
    obj = s3.get_object(Bucket=BUCKET, Key=key)
    s3_data = obj["Body"].read()
    # 32 should detect zlib vs gzip
    decompressed = zlib.decompress(s3_data, zlib.MAX_WBITS | 32).decode(encoding)
    return decompressed


def upload(key, bytes, compress=True):
    if compress:
        bytes = zlib.compress(bytes)
    s3.put_object(Bucket=BUCKET, Key=key, Body=bytes)


def is_bus(stop_id):
    return '-' in stop_id


def download_one_event_file(date, stop_id):
    """As advertised: single event file from s3"""
    year, month, day = date.year, date.month, date.day

    folder = 'daily-bus-data' if is_bus(stop_id) else 'daily-data'
    key = f"Events/{folder}/{stop_id}/Year={year}/Month={month}/Day={day}/events.csv.gz"

    # Download events from S3
    try:
        decompressed = download(key, 'ascii')

    except ClientError as ex:
        if ex.response['Error']['Code'] == 'NoSuchKey':
            # raise Exception(f"Data not available on S3 for key {key} ") from None
            print(f"WARNING: No data available on S3 for key: {key}")
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


def download_single_day_events(date, stops):
    """Will download events for single day, but can handle multiple stop_ids"""
    result = []
    for stop_id in stops:
        result += download_one_event_file(date, stop_id)
    return sorted(result, key=lambda row: row["event_time"])


# signature: (date_iterable, [stop_id])
# Will download events for multiple stops, over a date range.
download_event_range = parallel.make_parallel(download_single_day_events)
