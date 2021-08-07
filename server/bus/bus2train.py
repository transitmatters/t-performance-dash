import csv
import gzip
import json
import os
import pathlib
import sys
import traceback
from collections import defaultdict
from datetime import date
from operator import itemgetter

CSV_HEADER = ["service_date", "route_id", "trip_id", "direction_id", "stop_id",
              "stop_sequence", "vehicle_id", "vehicle_label", "event_type", "event_time"]
AVAILABILITY_FILE = "bus_available.json"


def write_row(output_by_stop_and_day, stop_id, day, row):
    if (stop_id, day) in output_by_stop_and_day:
        output_by_stop_and_day[(stop_id, day)].append(row)
        return

    output_by_stop_and_day[(stop_id, day)] = [row]


def parse_user_date(user_date):
    date_split = user_date.split("-")
    [year, month, day] = [int(x) for x in date_split[0:3]]
    return date(year=year, month=month, day=day)


def merge_availability_dicts(current: defaultdict, from_disk: dict):
    for stop_id, directions in from_disk.items():
        current[stop_id] = list(set(current[stop_id] + directions))
    return current


def process(input_csv):
    output_by_stop_and_day = {}
    availability_metadata = defaultdict(list)

    with open(input_csv, newline='') as csv_in:
        reader = csv.DictReader(csv_in)

        for row in reader:
            try:
                if row["standard_type"] != "Headway":
                    continue
                if row["actual"] == "NA":
                    continue

                """
        "service_date", "route_id", "direction",  "half_trip_id", "stop_id",  "time_point_id",  "time_point_order", "point_type",   "standard_type",  "scheduled",            "actual",               "scheduled_headway",  "headway"
        2020-01-15,     "01",       "Inbound",    46374001,       67,         "maput",                2,            "Midpoint",     "Schedule",       1900-01-01 05:08:00,    1900-01-01 05:09:07,      -5,                   NA,NA
        2020-01-15,     "01",       "Inbound",    46374001,       110,        "hhgat",                1,            "Startpoint",   "Schedule",       1900-01-01 05:05:00,    1900-01-01 05:04:34,      26,                   NA,NA
        2020-01-15,     "01",       "Inbound",    46374001,       72,         "cntsq",                3,            "Midpoint",     "Schedule",       1900-01-01 05:11:00,    1900-01-01 05:12:01,      -22,                    NA,NA
        2020-01-15,     "01",       "Inbound",    46374001,       75,         "mit",                  4,            "Midpoint",     "Schedule",       1900-01-01 05:14:00,    1900-01-01 05:14:58,      -25,                    NA,NA
        2020-01-15,     "01",       "Inbound",    46374001,       79,         "hynes",                5,            "Midpoint",     "Schedule",       1900-01-01 05:18:00,    1900-01-01 05:18:45,      32,                   NA,NA
        2020-01-15,     "01",       "Inbound",    46374001,       187,        "masta",                6,            "Midpoint",     "Schedule",       1900-01-01 05:20:00,    1900-01-01 05:21:04,      -33,                    NA,NA
        2020-01-15,     "01",       "Inbound",    46374045,       110,        "hhgat",                1,            "Startpoint",   "Headway",        1900-01-01 05:20:00,    1900-01-01 05:20:45,      NA,                   900,971
        """

                time = row["actual"].split(" ")[1]
                service_date = row["service_date"]
                route_id = row["route_id"].lstrip("0")
                trip_id = row["half_trip_id"]
                direction_id = 0 if row["direction"] == "Outbound" else 1
                stop_id = int(row["stop_id"])
                event_type = "ARR"
                event_time = f"{service_date} {time}"

                # Debug override
                # if service_date != "2020-01-15" or route_id != "1":
                #   continue

                if direction_id not in availability_metadata[stop_id]:
                    availability_metadata[stop_id].append(direction_id)

                # Bus has no delineation between departure and arrival, so we write out a departure row and an arrival row that match,
                #   so it looks like the rapid transit format
                # Write out an arrival row
                write_row(output_by_stop_and_day, stop_id, service_date, [
                    service_date,
                    route_id,
                    trip_id,
                    direction_id,
                    stop_id,
                    "",  # stop_sequence
                    "",  # vehicle_id
                    "",  # vehicle_label
                    event_type,
                    event_time,
                ])
                # Write out a departure row
                write_row(output_by_stop_and_day, stop_id, service_date, [
                    service_date,
                    route_id,
                    trip_id,
                    direction_id,
                    stop_id,
                    "",  # stop_sequence
                    "",  # vehicle_id
                    "",  # vehicle_label
                    "DEP",
                    event_time,
                ])
            except Exception:
                traceback.print_exc()
    return output_by_stop_and_day, availability_metadata


def to_disk(output_by_stop_and_day, root):
    for (stop_id, day), rows in output_by_stop_and_day.items():
        day = parse_user_date(day)
        destination_dir = pathlib.Path(root, "Events", "daily-data", str(
            stop_id), f"Year={day.year}", f"Month={day.month}", f"Day={day.day}")
        destination_dir.mkdir(parents=True, exist_ok=True)
        destination = pathlib.Path(destination_dir, "events.csv.gz")
        with open(destination, "wb") as file_out:
            with gzip.open(file_out, "wt") as csv_out:
                writer = csv.writer(csv_out, delimiter=",")
                writer.writerow(CSV_HEADER)
                for row in sorted(rows, key=itemgetter(CSV_HEADER.index("event_time"))):
                    writer.writerow(row)


def main():
    if len(sys.argv) < 3:
        print("Usage: python3 bus2train.py INPUT_CSV OUTPUT_DIR", file=sys.stderr)
        exit(1)

    input_csv = sys.argv[1]
    output_dir = sys.argv[2]
    pathlib.Path(output_dir).mkdir(exist_ok=True)

    output, availability_metadata = process(input_csv)
    to_disk(output, output_dir)

    availability_path = os.path.join(output_dir, AVAILABILITY_FILE)
    try:
        with open(availability_path, "r") as file:
            from_disk = json.load(file)
            availability_metadata = merge_availability_dicts(
                availability_metadata, from_disk)
    except FileNotFoundError:
        pass
    except:
        raise

    with open(availability_path, "w", encoding="utf-8") as file:
        json.dump(availability_metadata, file, ensure_ascii=False, indent=4)
        file.write("\n")


if __name__ == "__main__":
    main()
