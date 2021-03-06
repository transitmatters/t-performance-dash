from concurrent.futures import ThreadPoolExecutor, as_completed
import boto3
import datetime
import csv
import zlib

BUCKET = "tm-mbta-performance"
THREAD_COUNT = 5


def chunks(l, n):
    n = max(1, n)
    return (l[i:i + n] for i in range(0, len(l), n))


def download_event_range(stop_id, sdate, edate):
    delta = edate - sdate
    jobs = []
    for i in range(0, delta.days):
        date = sdate + datetime.timedelta(days=i)
        jobs.append((stop_id, date))

    thread_sets = chunks(jobs, len(jobs) // THREAD_COUNT)
    with ThreadPoolExecutor(max_workers=THREAD_COUNT) as executor:
        futures = []
        for group in thread_sets:
            futures.append(executor.submit(download_multiple_event_files, jobs=group))
        as_completed(futures)
    results = list(map(lambda future: future.result(), futures))
    # Flatten all of the results into one list
    return [item for sublist in results for item in sublist]


def download_multiple_event_files(jobs):
    session = boto3.session.Session()
    s3 = session.resource("s3")
    all_events = []
    for job in jobs:
        stop_id, date = job
        result = download_one_event_file(s3, stop_id, date)
        all_events.extend(result)
    return all_events


def download_one_event_file(s3, stop_id, date):
    year, month, day = date.year, date.month, date.day

    # Download events from S3
    try:
        key = f"Events/daily-data/{stop_id}/Year={year}/Month={month}/Day={day}/events.csv.gz"
        obj = s3.Object(BUCKET, key)
        s3_data = obj.get()["Body"].read()
        # Uncompress
        decompressed = zlib.decompress(
            s3_data, wbits=zlib.MAX_WBITS | 16).decode("ascii").split("\r\n")

    except s3.meta.client.exceptions.NoSuchKey:
        # raise Exception(f"Data not available on S3 for key {key} ") from None
        print(f"WARNING: No data available on S3 for key: {key}")
        return []

    # Parse CSV
    rows = []
    for row in csv.DictReader(decompressed):
        rows.append(row)

    # sort
    rows_by_time = sorted(rows, key=lambda row: row["event_time"])
    return rows_by_time
