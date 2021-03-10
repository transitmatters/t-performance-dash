import boto3
from botocore.exceptions import ClientError
import csv
import zlib

from chalicelib import parallel

BUCKET = "tm-mbta-performance"
s3 = boto3.client('s3')


def download_one_event_file(date, stop_id):
    year, month, day = date.year, date.month, date.day

    # Download events from S3
    try:

        key = f"Events/daily-data/{stop_id}/Year={year}/Month={month}/Day={day}/events.csv.gz"
        obj = s3.get_object(Bucket=BUCKET, Key=key)
        s3_data = obj["Body"].read()
        # Uncompress
        decompressed = zlib.decompress(
            s3_data, wbits=zlib.MAX_WBITS | 16).decode("ascii").split("\r\n")

    except ClientError as ex:
        if ex.response['Error']['Code'] == 'NoSuchKey':
            # raise Exception(f"Data not available on S3 for key {key} ") from None
            print(f"WARNING: No data available on S3 for key: {key}")
            return []
        else:
            raise

    # Parse CSV
    rows = []
    for row in csv.DictReader(decompressed):
        rows.append(row)

    # sort
    rows_by_time = sorted(rows, key=lambda row: row["event_time"])
    return rows_by_time


# signature: (date_iterable, stop_id)
download_event_range = parallel.make_parallel(download_one_event_file)
