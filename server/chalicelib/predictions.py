from boto3.dynamodb.conditions import Key
from dynamodb_json import json_util as ddb_json

from .dynamo import dynamodb

# TimePredictions table - initialized to None. This will be set by app.py

TimePredictions = None

def set_time_predictions_table():
    """Get TimePredictions table, creating it lazily if needed."""
    global TimePredictions
    TimePredictions = dynamodb.Table("TimePredictions")

def query_time_predictions(route_id: str):
    condition = Key("routeId").eq(route_id)
    response = TimePredictions.query(KeyConditionExpression=condition)
    response_items = ddb_json.loads(response["Items"])
    return response_items
