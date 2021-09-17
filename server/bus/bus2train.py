import argparse
import csv
import gzip
import json
import os
import pathlib
import sys
import traceback
from datetime import date, datetime
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

# Read json file of availability into a set()
# Example:
#   (These aren't actually stop ids for the 77)
"""
{
    "77": {
        "70061": [
            0,
            1
        ],
        "70062": [
            1
        ]
    }
}

 ==>
 ("77", "70061", 0),
 ("77", "70061", 1),
  etc
"""
def json_to_availability(file_path):
    try:
        with open(file_path, "r") as file:
            flat = set()
            nested = json.load(file)
            for route, stop in nested.items():
                for direction in stop:
                    flat.add((route, stop, direction))
            return flat
    except FileNotFoundError:
        return set()
    except Exception:
        raise

# Same thing as above but in reverse
def availability_to_json(availability_set):
    to_output = {}
    for (route, stop, direction) in availability_set:
        if route not in to_output:
            to_output[route] = {
                stop: [direction]
            }
            continue
        if stop not in to_output[route]:
            to_output[route][stop] = [direction]
            continue
        if direction not in to_output[route][stop]:
            to_output[route][stop].append(direction)
    return to_output

OFFSET = datetime(1900, 1, 1, 0, 0, 0)

def process(input_csv, availability_path, routes):
    output_by_stop_and_day = {}
    availability_set = json_to_availability(availability_path)

    with open(input_csv, newline='') as csv_in:
        reader = csv.DictReader(csv_in)

        for row in reader:
            try:
                if row["standard_type"] != "Headway":
                    continue
                if row["actual"] in ["NA", ""]:
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
                # represent actual time as timedelta from 1900-01-01 for some reason
                time = datetime.fromisoformat(row["actual"]) - OFFSET
                service_date = row["service_date"]
                route_id = row["route_id"].lstrip("0")
                trip_id = row["half_trip_id"]
                direction_id = 0 if row["direction_id"] == "Outbound" else 1
                stop_id = int(row["stop_id"])
                event_type = "ARR"
                event_time = datetime.fromisoformat(service_date) + time

                # Debug override
                # if service_date != "2020-01-15" or route_id != "1":
                #   continue
                if routes:
                    if route_id not in routes:
                        continue

                # I hate this and I'm sorry
                availability_set.add((route_id, str(stop_id), direction_id))

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
    return output_by_stop_and_day, availability_set


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

    parser = argparse.ArgumentParser()

    parser.add_argument('input', metavar='INPUT_CSV')
    parser.add_argument('output', metavar='OUTPUT_DIR')
    parser.add_argument('--routes', '-r', nargs="*", type=str)

    args = parser.parse_args()

    input_csv = args.input
    output_dir = args.output
    routes = args.routes

    pathlib.Path(output_dir).mkdir(exist_ok=True)

    availability_path = os.path.join(output_dir, AVAILABILITY_FILE)
    output, availability_set = process(input_csv, availability_path, routes)
    to_disk(output, output_dir)

    with open(availability_path, "w", encoding="utf-8") as file:
        json.dump(availability_to_json(availability_set), file, ensure_ascii=False, indent=4)
        file.write("\n")


if __name__ == "__main__":
    main()
