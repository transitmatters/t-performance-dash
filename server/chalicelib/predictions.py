"""Time prediction accuracy data queries from DynamoDB."""

from datetime import date

from boto3.dynamodb.conditions import Key
from dynamodb_json import json_util as ddb_json

from . import dynamo

# TimePredictions table - initialized to None. This will be set by app.py

TimePredictions = None


def set_time_predictions_table():
    """Get TimePredictions table, creating it lazily if needed."""
    global TimePredictions
    TimePredictions = dynamo.dynamodb.Table("TimePredictions")


def query_time_predictions(route_id: str, start_date: date | None = None, end_date: date | None = None):
    """Query time prediction accuracy records for a route from DynamoDB.

    Args:
        route_id: The route identifier to query (e.g. ``"Red"``).
        start_date: If given, only weeks starting on or after this date.
        end_date: If given, only weeks starting on or before this date.

    Returns:
        A list of time prediction records for the given route.
    """
    condition = Key("routeId").eq(route_id)
    if start_date and end_date:
        condition &= Key("week").between(start_date.isoformat(), end_date.isoformat())
    elif start_date:
        condition &= Key("week").gte(start_date.isoformat())
    elif end_date:
        condition &= Key("week").lte(end_date.isoformat())
    response = TimePredictions.query(KeyConditionExpression=condition)
    response_items = ddb_json.loads(response["Items"])
    return response_items
