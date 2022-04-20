import argparse
import pandas as pd
import pathlib
import sys


def process_events(input_csv, outdir, nozip=False):
    columns = ["service_date", "route_id", "trip_id", "direction_id", "stop_id", "stop_sequence",
               "vehicle_id", "vehicle_label", "event_type", "event_time_sec"]

    df = pd.read_csv(input_csv, usecols=columns,
                     parse_dates=["service_date"],
                     infer_datetime_format=True,
                     dtype={
                         "route_id": "str",
                         "trip_id": "str",
                         "stop_id": "str",
                         "vehicle_id": "str",
                         "vehicle_label": "str",
                         "event_time": "int"})

    df["event_time"] = df["service_date"] + pd.to_timedelta(df["event_time_sec"], unit="s")
    df.drop(columns=["event_time_sec"], inplace=True)

    service_date_month = pd.Grouper(key="service_date", freq="1M")
    grouped = df.groupby([service_date_month, "stop_id"])

    for name, events in grouped:
        service_date, stop_id = name

        fname = pathlib.Path(outdir,
                             "Events",
                             "monthly-data",
                             str(stop_id),
                             f"Year={service_date.year}",
                             f"Month={service_date.month}",
                             "events.csv.gz")
        fname.parent.mkdir(parents=True, exist_ok=True)
        # set mtime to 0 in gzip header for determinism (so we can re-gen old routes, and rsync to s3 will ignore)
        events.to_csv(fname, index=False, compression={"method": "gzip", "mtime": 0} if not nozip else None)


def main():
    parser = argparse.ArgumentParser()

    parser.add_argument("input", metavar="INPUT_CSV")
    parser.add_argument("output", metavar="OUTPUT_DIR")

    parser.add_argument("--nozip", "-nz", action="store_true", help="debug feature to skip gzipping")

    args = parser.parse_args()
    input_csv = args.input
    output_dir = args.output
    no_zip = args.nozip

    pathlib.Path(output_dir).mkdir(exist_ok=True)

    process_events(input_csv, output_dir, no_zip)

if __name__ == '__main__':
    main()
