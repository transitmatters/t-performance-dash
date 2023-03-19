import concurrent.futures
import datetime
import boto3
from botocore.exceptions import ClientError

from chalicelib import dynamo, data_funcs


dyn_resource = boto3.resource("dynamodb")
table = dyn_resource.Table("OverviewStats")

'''array of stop pairs which encompass entire system. Not actually termini - one before the termini.'''
termini = {
    "RL": [[70063, 70091], [70092, 70064], [70063, 70103], [70104, 70064]],
    "OL": [[70034, 70002], [70003, 70035]],
    "BL": [[70057, 70039], [70040, 70058]],
}


# TODO: Maybe this should be a x hour rolling average of the past x hours of active service (?) or maybe last x trips
def get_speed(line):  # TODO: deal with case when no trains have run yet.
    total_time = 0
    benchmark = 0
    now = datetime.datetime.now()
    today = now
    if now.hour < 4:
        today = today.replace(hour=0, minute=0, second=0, microsecond=0) - datetime.timedelta(days=1) + datetime.timedelta(hours=23, minutes=59)

    for stop_pair in termini[line]:
        tts = data_funcs.process_mbta_travel_times([stop_pair[0]], [stop_pair[1]], today)
        total_time += sum(tt["travel_time_sec"] for tt in tts if "travel_time_sec" in tt)
        benchmark += sum(tt["benchmark_travel_time_sec"] for tt in tts if "benchmark_travel_time_sec" in tt)

    percentage = int(100 * benchmark / total_time) if total_time > 0 else 0
    executor = concurrent.futures.ThreadPoolExecutor()
    executor.submit(dynamo.update_speed, [line, now, percentage])
    return [{
        "last_updated": f'{now.strftime(data_funcs.DATE_FORMAT)}',
        "value": percentage,
    }]


def is_fresh(response, now):
    last_updated = datetime.datetime.strptime(response["Items"][0]["last_updated"], data_funcs.DATE_FORMAT)
    diff = abs(now - last_updated)
    return diff < datetime.timedelta(minutes=10)


def fetch_speed(line):
    now = datetime.datetime.now()
    try:
        response = table.query(
            KeyConditionExpression='line = :line and stat = :stat',
            ExpressionAttributeValues={
                ':line': line,
                ':stat': 'Speed'
            }
        )
    except ClientError:
        print("could not read from table.")
        raise
    if len(response["Items"]) == 0 or not is_fresh(response, now):  # If no value or expired - get fresh.
        return get_speed(line)
    return response["Items"]
