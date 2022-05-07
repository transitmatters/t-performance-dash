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

KEY = "NewTrains/run_counts/{}.csv"


def train_runs(route, date):
    spec = ROUTE_DEFINITIONS[route]
    api_data = MbtaPerformanceAPI.get_api_data("events", {"stop": spec["core_stations"]}, date)
    events = sum([stop["events"] for stop in api_data], [])
    departures = filter(lambda event: event["event_type"] in EVENT_DEPARTURE, events)
    by_trip_id = {event["trip_id"]: event for event in departures}  # Just in case a single trip gets a DEP and a PRD
    return list(filter(lambda event: int(event["vehicle_label"]) in spec["labels"], by_trip_id.values()))


def update_statistics_file(route, date, count):
    csv_row = "{formatted_date},{count}\n".format(
        formatted_date=date.strftime("%Y-%m-%d"),
        count=count
    )
    key = KEY.format(route)
    try:
        data = s3.download(key, compressed=False) + csv_row
    except ClientError as ex:
        if ex.response['Error']['Code'] != 'NoSuchKey':
            raise
        data = "service_date,run_count\n" + csv_row

    s3.upload(key, data.encode(), compress=False)
