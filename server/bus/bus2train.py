import argparse
import csv
import gzip
import json
import os
import pathlib
import pandas as pd
import sys
import traceback
from datetime import date, datetime
from operator import itemgetter

CSV_HEADER = ["service_date", "route_id", "trip_id", "direction_id", "stop_id",
              "stop_sequence", "vehicle_id", "vehicle_label", "event_type", "event_time"]
AVAILABILITY_FILE = "bus_available.json"

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


def process(input_csv, availability_path, routes):
    output_by_stop_and_day = {}
    # availability_set = json_to_availability(availability_path)

    # thinking about doing this in pandas to have all the info at once
    df = pd.read_csv(input_csv, parse_dates=['service_date', 'scheduled', 'actual'])
    
    df = df.loc[(df.standard_type == "Headway") & (df.actual.notnull())]
    df.route_id = df.route_id.str.lstrip('0')
    if routes:
        df = df.loc[df.route_id.isin(routes)]

    OFFSET = datetime(1900, 1, 1, 0, 0, 0)
    df.scheduled = df.service_date + (df.scheduled - OFFSET)
    df.actual = df.service_date + (df.actual - OFFSET)
    df.service_date = df.service_date.dt.date

    df.direction_id = df.direction_id.map({"Outbound": 0, "Inbound": 1})

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
    available = df[['route_id', 'stop_id', 'direction_id']].drop_duplicates().to_records(index=False)


    CSV_HEADER = ["service_date", "route_id", "trip_id", "direction_id", "stop_id",
              "stop_sequence", "vehicle_id", "vehicle_label", "event_type", "event_time"]
    
    df = df.rename(columns={'half_trip_id': 'trip_id',
                            'time_point_order': 'stop_sequence',
                            'actual': 'event_time'})
    df.drop(columns=['time_point_id','standard_type','scheduled','scheduled_headway','headway'])
    df['vehicle_id'] = ""
    df['vehicle_label'] = ""

    df['event_type'] = df.point_type.map({"Startpoint": ["DEP"],
                                       "Midpoint": ["ARR", "DEP"],
                                       "Endpoint": ["ARR"]})
    df = df.explode('event_type')
    df = df[CSV_HEADER]

    return df, []
    return output_by_stop_and_day, []


def write_file(events, outdir):
    service_date, stop_id = events.name

    fname = (pathlib.Path(outdir) /
        "Events" / 
        "daily-data" /
        str(stop_id) / 
        f"Year={service_date.year}" / 
        f"Month={service_date.month}" /
        f"Day={service_date.day}" /
        "events.csv.gz")
    fname.parent.mkdir(parents=True, exist_ok=True)
    events.to_csv(fname, index=False, compression='gzip')


def to_disk(df, root):
    df.groupby(['service_date', 'stop_id']).apply(lambda e: write_file(e, root))

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
