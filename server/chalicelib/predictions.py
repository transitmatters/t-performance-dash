from boto3.dynamodb.conditions import Key
from dynamodb_json import json_util as ddb_json

from .dynamo import dynamodb

TimePredictions = dynamodb.Table("TimePredictions")


def query_time_predictions(route_id: str):
    condition = Key("routeId").eq(route_id)
    response = TimePredictions.query(KeyConditionExpression=condition)
    response_items = ddb_json.loads(response["Items"])
    return response_items
