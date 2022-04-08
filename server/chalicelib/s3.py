import boto3
from botocore.exceptions import ClientError
import csv
import itertools
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
    return ('-0-' in stop_id) or ('-1-' in stop_id)


def download_one_event_file(date, stop_id, monthly=False):
    """As advertised: single event file from s3"""
    year, month, day = date.year, date.month, date.day

    if monthly:
        folder = 'monthly-bus-data'
        key = f"Events/{folder}/{stop_id}/Year={year}/Month={month}/events.csv.gz"
    else:
        folder = 'daily-data'
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

def multiplexed_download_one_event_file(datestop, monthly):
    (date, stop) = datestop
    return download_one_event_file(date, stop, monthly)

parallel_download_events = parallel.make_parallel(multiplexed_download_one_event_file)

def download_single_day_events(date, stops):
    """Will download events for single day, but can handle multiple stop_ids"""
    result = []
    for stop_id in stops:
        result += download_one_event_file(date, stop_id)
    return sorted(result, key=lambda row: row["event_time"])


# signature: (date_iterable, [stop_id])
# Will download events for multiple stops, over a date range.
download_event_range = parallel.make_parallel(download_single_day_events)


def download_events(sdate, edate, stops):
    if is_bus(stops[0]):
        datestops = itertools.product(parallel.month_range(sdate, edate), stops)
        result = parallel_download_events(datestops, monthly=True)
        return filter(lambda row: sdate.strftime("%Y-%m-%d") <= row['service_date'] <= edate.strftime("%Y-%m-%d"), result)
    else:
        return download_event_range(parallel.date_range(sdate, edate), stops)