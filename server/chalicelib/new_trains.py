import json
import sys
import traceback
from chalicelib import MbtaPerformanceAPI, s3
from chalicelib.constants import EVENT_DEPARTURE
from botocore.exceptions import ClientError

ROUTE_DEFINITIONS = {
    "Red": {
        "labels": range(1900, 2152),
        "core_stations": [70077, 70078]  # Downtown Crossing
    },
    "Orange": {
        "labels": range(1400, 1552),
        "core_stations": [70014, 70015]  # Back Bay
    }
}
S3_KEY_NEW_TRAINS = "statistics/{}/new_trains.json.gz"  # inside tm-mbta-performance
S3_KEY_PUBLIC_JSON = "static/statistics/summary.json"  # inside dashboard.transitmatters.org


def vehicle_label_metrics(route, date) -> dict:
    spec = ROUTE_DEFINITIONS[route]
    api_data = MbtaPerformanceAPI.get_api_data("events", {"stop": spec["core_stations"]}, date)
    events = sum([stop["events"] for stop in api_data], [])
    departures = filter(lambda event: event["event_type"] in EVENT_DEPARTURE, events)
    by_trip_id = {event["trip_id"]: event for event in departures}  # Just in case a single trip gets a DEP and a PRD

    new_len = len(list(filter(
        lambda event: int(event["vehicle_label"]) in spec["labels"],
        by_trip_id.values()
    )))
    total_len = len(by_trip_id)
    return {
        "new_vehicle_trips": new_len,
        "total_trips": total_len
    }


def update_statistics_file(route, date, route_metrics) -> dict:
    date_str = date.strftime("%Y-%m-%d")
    key = S3_KEY_NEW_TRAINS.format(route)
    try:
        data = s3.download(key, compressed=True)
        parsed = json.loads(data)
    except ClientError as ex:
        if ex.response['Error']['Code'] != 'NoSuchKey':
            raise
        parsed = {}

    parsed[date_str] = route_metrics

    s3.upload(key, json.dumps(parsed).encode(), compress=True)
    return parsed


def summarize(statistics) -> dict:
    new_vehicle_trips_max = 0
    new_vehicle_trips_date = None
    for date, metrics in statistics.items():
        if metrics["new_vehicle_trips"] > new_vehicle_trips_max:
            new_vehicle_trips_max = metrics["new_vehicle_trips"]
            new_vehicle_trips_date = date

    return {
        "new_vehicles": {
            "max": new_vehicle_trips_max,
            "on_date": new_vehicle_trips_date,
        }
    }


def update_all(date):
    summaries = {}
    for route in ROUTE_DEFINITIONS.keys():
        print(f"Storing new train runs for {route}...")
        try:
            single_day_route_metrics = vehicle_label_metrics(route, date)

            # update_statistics_file(), as a part of storing `date`'s data, returns everything
            all_days_route_metrics = update_statistics_file(route, date, single_day_route_metrics)

            summaries[route] = summarize(all_days_route_metrics)
        except Exception:
            print(f"Unable to store metrics for route={route}", file=sys.stderr)
            traceback.print_exc()
            continue
    s3.upload(S3_KEY_PUBLIC_JSON, json.dumps(summaries).encode(), compress=False, bucket=s3.FRONTEND_BUCKET)
