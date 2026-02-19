"""Time prediction accuracy data queries from DynamoDB."""

from boto3.dynamodb.conditions import Key
from dynamodb_json import json_util as ddb_json

from . import dynamo

# TimePredictions table - initialized to None. This will be set by app.py

TimePredictions = None


def set_time_predictions_table():
    """Get TimePredictions table, creating it lazily if needed."""
    global TimePredictions
    TimePredictions = dynamo.dynamodb.Table("TimePredictions")


def query_time_predictions(route_id: str):
    """Query time prediction accuracy records for a route from DynamoDB.

    Args:
        route_id: The route identifier to query (e.g. ``"Red"``).

    Returns:
        A list of time prediction records for the given route.
    """
    condition = Key("routeId").eq(route_id)
    response = TimePredictions.query(KeyConditionExpression=condition)
    response_items = ddb_json.loads(response["Items"])
    return response_items
