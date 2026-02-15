"""DynamoDB access layer for querying trip metrics, scheduled service, and ridership data."""

from datetime import date
from boto3.dynamodb.conditions import Key
import boto3
from dynamodb_json import json_util as ddb_json
from chalicelib import constants
from typing import List
import concurrent.futures
import os


# DynamoDB resource - initialized to None. This will be set by app.py
dynamodb = None


def set_dynamodb_resource():
    """Initialize the global DynamoDB resource with the configured AWS region."""
    global dynamodb

    region = os.environ.get("AWS_DEFAULT_REGION", "us-east-1")
    dynamodb = boto3.resource("dynamodb", region_name=region)


def query_daily_trips_on_route(table_name: str, route, start_date: str | date, end_date: str | date):
    """Query daily trip metrics for a single route from DynamoDB.

    Args:
      table_name: str: The DynamoDB table name to query.
      route: The route ID (partition key).
      start_date: str | date: Start of date range (inclusive).
      end_date: str | date: End of date range (inclusive).

    Returns:
      list[dict]: Deserialized trip metric records.
    """
    table = dynamodb.Table(table_name)
    response = table.query(KeyConditionExpression=Key("route").eq(route) & Key("date").between(start_date, end_date))
    return ddb_json.loads(response["Items"])


def query_daily_trips_on_line(table_name: str, line: str, start_date: str | date, end_date: str | date):
    """Query daily trip metrics for all routes on a line, in parallel.

    Resolves the line to its constituent routes via LINE_TO_ROUTE_MAP and queries
    each route concurrently using a thread pool.

    Args:
      table_name: str: The DynamoDB table name to query.
      line: str: The line identifier (e.g., "Red", "Orange").
      start_date: str | date: Start of date range (inclusive).
      end_date: str | date: End of date range (inclusive).

    Returns:
      list[list[dict]]: A list of result lists, one per route on the line.
    """
    route_keys = constants.LINE_TO_ROUTE_MAP[line]
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        futures = [
            executor.submit(
                query_daily_trips_on_route,
                table_name,
                route_key,
                start_date,
                end_date,
            )
            for route_key in route_keys
        ]
        results = []
        for future in concurrent.futures.as_completed(futures):
            result = future.result()
            results.append(result)
    return results


def query_scheduled_service(start_date: date, end_date: date, route_id: str = None):
    """Query scheduled service data from the ScheduledServiceDaily DynamoDB table.

    Args:
      start_date: date: Start of date range (inclusive).
      end_date: date: End of date range (inclusive).
      route_id: str: The route ID to query. (Default value = None)

    Returns:
      list[dict]: Deserialized scheduled service records.
    """
    table = dynamodb.Table("ScheduledServiceDaily")
    line_condition = Key("routeId").eq(route_id)
    date_condition = Key("date").between(start_date.isoformat(), end_date.isoformat())
    condition = line_condition & date_condition
    response = table.query(KeyConditionExpression=condition)
    return ddb_json.loads(response["Items"])


def query_ridership(start_date: date, end_date: date, line_id: str = None):
    """Query ridership data from the Ridership DynamoDB table.

    Args:
      start_date: date: Start of date range (inclusive).
      end_date: date: End of date range (inclusive).
      line_id: str: The line ID to query. (Default value = None)

    Returns:
      list[dict]: Deserialized ridership records.
    """
    table = dynamodb.Table("Ridership")
    line_condition = Key("lineId").eq(line_id)
    date_condition = Key("date").between(start_date.isoformat(), end_date.isoformat())
    condition = line_condition & date_condition
    response = table.query(KeyConditionExpression=condition)
    return ddb_json.loads(response["Items"])


def query_agg_trip_metrics(start_date: str | date, end_date: str | date, table_name: str, line: str = None):
    """Query aggregated trip metrics from a DynamoDB table, keyed by line and date.

    Args:
      start_date: str | date: Start of date range (inclusive).
      end_date: str | date: End of date range (inclusive).
      table_name: str: The DynamoDB table name to query.
      line: str: The line identifier (partition key). (Default value = None)

    Returns:
      list[dict]: Deserialized aggregated trip metric records.
    """
    table = dynamodb.Table(table_name)
    line_condition = Key("line").eq(line)
    date_condition = Key("date").between(start_date, end_date)
    condition = line_condition & date_condition
    response = table.query(KeyConditionExpression=condition)
    return ddb_json.loads(response["Items"])


def query_extended_trip_metrics(
    start_date: date,
    end_date: date,
    route_ids: List[str],
):
    """Query extended trip metrics from DynamoDB for multiple routes.

    Queries the DeliveredTripMetricsExtended table for each route ID sequentially.

    Args:
      start_date: date: Start of date range (inclusive).
      end_date: date: End of date range (inclusive).
      route_ids: List[str]: Route IDs to query.

    Returns:
      list[dict]: Combined deserialized records from all queried routes.
    """
    table = dynamodb.Table("DeliveredTripMetricsExtended")
    start_date_str = start_date.strftime("%Y-%m-%d")
    end_date_str = end_date.strftime("%Y-%m-%d")
    response_dicts = []
    for route_id in route_ids:
        route_condition = Key("route").eq(route_id)
        date_condition = Key("date").between(start_date_str, end_date_str)
        condition = route_condition & date_condition
        response = table.query(KeyConditionExpression=condition)
        responses = ddb_json.loads(response["Items"])
        response_dicts.extend(responses)
    return response_dicts
