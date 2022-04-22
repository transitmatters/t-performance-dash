from chalicelib import MbtaPerformanceAPI, s3
from chalicelib.constants import EVENT_DEPARTURE
from botocore.exceptions import ClientError

ROUTES = {
    "Red": {
        "is_new": lambda x: int(x) >= 1900 and int(x) <= 2151,
        "core_stations": [70077, 70078]  # Downtown Crossing
    },
    "Orange": {
        "is_new": lambda x: int(x) >= 1400 and int(x) <= 1551,
        "core_stations": [70014, 70015]  # Back Bay
    }
}

KEY = "NewTrains/AggData/{}LineAgg.csv"


def train_runs(label_filter, stations, date):
    api_data = MbtaPerformanceAPI.get_api_data("events",
                                               {"stop": stations},
                                               date)
    all_events = sum([stop["events"] for stop in api_data], [])
    deps = list(filter(lambda event: event["event_type"] in EVENT_DEPARTURE, all_events))
    return list(filter(lambda event: label_filter(event["vehicle_label"]), deps))


def update_statistics_file(route, date, count):
    csv_row = "{formatted_date},{count}\n".format(
        formatted_date=date.strftime("%m/%d/%Y"),
        count=count
    )
    key = KEY.format(route)
    try:
        data = s3.download(key, compressed=False) + csv_row
    except ClientError as ex:
        if ex.response['Error']['Code'] != 'NoSuchKey':
            raise
        data = "service_date,run_count\n" + csv_row

    s3.upload(key, data.encode(), False)
