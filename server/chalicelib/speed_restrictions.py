"""Speed restriction data queries from DynamoDB."""

from boto3.dynamodb.conditions import Key
from dynamodb_json import json_util as ddb_json

from . import dynamo

# SpeedRestrictions table - initialized to None. This will be set by app.py

SpeedRestrictions = None


def set_speed_restrictions_table():
    """Get SpeedRestrictions table, creating it lazily if needed."""
    global SpeedRestrictions
    SpeedRestrictions = dynamo.dynamodb.Table("SpeedRestrictions")


def get_boundary_date(line_id: str, first: bool):
    """Get the earliest or latest date with speed restriction data for a line.

    Args:
        line_id: The transit line identifier to query.
        first: If True, return the earliest date; if False, return the latest.

    Returns:
        str: The boundary date in ISO format (e.g. '2023-01-15').
    """
    response = SpeedRestrictions.query(
        KeyConditionExpression=Key("lineId").eq(line_id),
        ScanIndexForward=first,
        Limit=1,
    )
    loaded = ddb_json.loads(response["Items"])
    return loaded[0]["date"]


def query_speed_restrictions(line_id: str, on_date: str):
    """Query speed restriction zones for a line on a given date.

    If on_date is before the earliest available data, returns unavailable.
    If on_date is after the latest available data, clamps to the latest date.

    Args:
        line_id: The transit line identifier to query.
        on_date: The date to query in ISO format (e.g. '2023-01-15').

    Returns:
        dict: With key 'available' (bool). If available, also includes 'date'
              (str, the date used) and 'zones' (dict of speed restriction zones).
    """
    first_sr_date = get_boundary_date(line_id=line_id, first=True)
    latest_sr_date = get_boundary_date(line_id=line_id, first=False)
    if on_date < first_sr_date:
        return {"available": False}
    if on_date > latest_sr_date:
        on_date = latest_sr_date
    line_condition = Key("lineId").eq(line_id)
    date_condition = Key("date").eq(on_date)
    condition = line_condition & date_condition
    response = SpeedRestrictions.query(KeyConditionExpression=condition, Limit=1)
    response_item = ddb_json.loads(response["Items"])[0]
    zones = response_item.get("zones", {}).get("zones", {})
    return {
        "available": True,
        "date": on_date,
        "zones": zones,
    }
