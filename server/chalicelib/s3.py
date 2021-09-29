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
    decompressed = zlib.decompress(s3_data, zlib.MAX_WBITS|32).decode(encoding)
    return decompressed


def upload(key, bytes, compress=True):
    if compress:
        bytes = zlib.compress(bytes)
    s3.put_object(Bucket=BUCKET, Key=key, Body=bytes)


def download_one_event_file(date, stop_id):
    year, month, day = date.year, date.month, date.day

    # Download events from S3
    try:
        key = f"Events/daily-data/{stop_id}/Year={year}/Month={month}/Day={day}/events.csv.gz"
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


# signature: (date_iterable, stop_id)
download_event_range = parallel.make_parallel(download_one_event_file)
