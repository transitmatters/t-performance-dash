from datetime import date
from boto3.dynamodb.conditions import Key
import boto3
from dynamodb_json import json_util as ddb_json

# Create a DynamoDB resource
dynamodb = boto3.resource("dynamodb")


def query_speed_tables(table_name, line, start_date, end_date):
    table = dynamodb.Table(table_name)
    response = table.query(KeyConditionExpression=Key("line").eq(line) & Key("date").between(start_date, end_date))
    return ddb_json.loads(response["Items"])


def query_trip_counts(start_date: date, end_date: date, route_id: str = None):
    table = dynamodb.Table("TripCounts")
    line_condition = Key("routeId").eq(route_id)
    date_condition = Key("date").between(start_date.isoformat(), end_date.isoformat())
    condition = line_condition & date_condition
    response = table.query(KeyConditionExpression=condition)
    return ddb_json.loads(response["Items"])


def query_ridership(start_date: date, end_date: date, line_id: str = None):
    table = dynamodb.Table("Ridership")
    line_condition = Key("lineId").eq(line_id)
    date_condition = Key("date").between(start_date.isoformat(), end_date.isoformat())
    condition = line_condition & date_condition
    response = table.query(KeyConditionExpression=condition)
    return ddb_json.loads(response["Items"])
