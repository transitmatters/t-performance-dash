import boto3
import csv
import zlib

BUCKET = "tm-mbta-performance"
s3 = boto3.resource("s3")

def download_sorted_events(stop_id, year, month, day):
  # Download events from S3
  key = f"Events/daily-data/{stop_id}/Year={year}/Month={month}/Day={day}/events.csv.gz"
  obj = s3.Object(BUCKET, key)
  s3_data = obj.get()["Body"].read()

  # Uncompress
  decompressed = zlib.decompress(s3_data, wbits=zlib.MAX_WBITS | 16).decode("ascii").split("\r\n")

  # Parse CSV
  rows = []
  for row in csv.DictReader(decompressed):
    rows.append(row)

  # sort
  rows_by_time = sorted(rows, key=lambda row: row["event_time"])
  return rows_by_time



