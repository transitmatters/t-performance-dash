from chalicelib import data_funcs
import datetime

import boto3
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError
dyn_resource = boto3.resource("dynamodb")
table = dyn_resource.Table("overviewStats")

termini = {
    "RL": [[[70063],[70083]],[[70083],[70091]],[[70083],[70105]]],
    "OL": [[[70034],[70002]]],
    "BL": [[[70057],[70039]]]
    }

def get_speed(line):
    total_time = 0
    benchmark = 0 
    now = datetime.datetime.now()
    for stop_pair in termini[line]:
        tts = data_funcs.process_mbta_travel_times(stop_pair[0], stop_pair[1], now)
        for tt in tts:
            if "travel_time_sec" in tt:
                total_time += tt["travel_time_sec"]
            if "benchmark_travel_time_sec" in tt:
                benchmark += tt["benchmark_travel_time_sec"]
    percentage = int(100*benchmark/total_time)
    try:
        table.update_item(
            Key={"stat": f"{line}-Speed"},
            UpdateExpression='SET #last_updated = :last_updated, #value = :value',
             ExpressionAttributeNames= {
                '#last_updated' : 'last_updated',
                '#value' : 'value'
            },
            ExpressionAttributeValues={
            ':last_updated': f'{now.strftime("%Y-%m-%d %H:%M:%S")}',
            ':value': f'{percentage}',
            },
        )
    except ClientError:
        print("Could not update table.")
        raise
    return [{
        "last_updated": f'{now.strftime("%Y-%m-%d %H:%M:%S")}',
        "value": percentage,
    }]





def fetch_speed(line):
    now = datetime.datetime.now()
    try:
        response = table.query(
            KeyConditionExpression=Key("stat").eq(f"{line}-Speed")
        )
        if len(response["Items"]) == 0:
            return get_speed(line)
        last_updated = datetime.datetime.strptime(response["Items"][0]["last_updated"], "%Y-%m-%d %H:%M:%S")
        diff = abs(now - last_updated)
        if diff > datetime.timedelta(minutes=5):
            return get_speed(line)
    except ClientError:
        print("could not read dynamo table TraveltimesAggByDate")
        raise
    return response["Items"]